import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { createQRCodeDataUri } from '../utils/qrcode';
import { buildDocumentPdf } from '../utils/pdf';
import { generateDocumentImage } from '../utils/image';
import { uploadBufferToS3 } from '../utils/s3';
import { sendDocumentEmail } from '../utils/email';
import { logAudit } from '../utils/audit';
import type { AuthRequest } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'), async (req: AuthRequest, res) => {
  const docs = await prisma.document.findMany({ include: { customer: true, supplier: true, lineItems: true }, orderBy: { createdAt: 'desc' } });
  res.json(docs);
});

router.post('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT'), async (req: AuthRequest, res) => {
  try {
    const { docType, reference, customerId, supplierId, issueDate, dueDate, transactionStatus, signedBy, customerSignatureUrl, lineItems, amountPaid, transactionStatus: statusValue } = req.body;
    const parsedItems = Array.isArray(lineItems) ? lineItems.map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit: item.unit,
      unitPrice: Number(item.unitPrice || 0),
      discount: Number(item.discount || 0),
      vat: Number(item.vat || 0),
      total: Number(item.total || 0)
    })) : [];
    const totalAmount = parsedItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = parsedItems.reduce((sum, item) => sum + (item.vat || 0), 0);
    const discountAmount = parsedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
    const paidAmount = Number(amountPaid || 0);
    const balanceDue = totalAmount - paidAmount;

    const qrCodeData = JSON.stringify({ reference, docType, totalAmount, balanceDue, issuedAt: new Date().toISOString() });
    const qrCodeUri = await createQRCodeDataUri(qrCodeData);

    const document = await prisma.document.create({
      data: {
        docType,
        reference,
        customerId: customerId ? Number(customerId) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: paidAmount >= totalAmount ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'OPEN',
        approvalStatus: 'DRAFT',
        currency: 'NGN',
        totalAmount,
        vatAmount,
        discountAmount,
        amountPaid: paidAmount,
        balanceDue,
        transactionStatus: statusValue || 'UNSET',
        signedBy,
        customerSignatureUrl,
        qrCodeData,
        lineItems: {
          create: parsedItems
        },
        createdById: req.user!.id
      }
    });

    const payload = await prisma.document.findUnique({ where: { id: document.id }, include: { lineItems: true, customer: true, supplier: true } });

    let documentUrl = '';
    try {
      const pdfBuffer = await buildDocumentPdf({ document: payload as any, customer: payload?.customer || undefined, supplier: payload?.supplier || undefined, qrCodeUri });
      documentUrl = await uploadBufferToS3(pdfBuffer, `documents/${reference}.pdf`, 'application/pdf');
      await prisma.document.update({ where: { id: document.id }, data: { documentUrl } });
    } catch (pdfError) {
      console.error('PDF generation/upload error:', pdfError);
    }

    await logAudit('CREATE_DOCUMENT', 'Document', document.id, req.user?.id, `Created document ${reference}`);
    res.status(201).json({ ...document, documentUrl });
  } catch (error) {
    console.error('Document creation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: 'Failed to create document', details: message });
  }
});

router.get('/:id/pdf', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const posStyle = req.query.style === 'pos';
    const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, supplier: true, lineItems: true } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const qrCodeUri = await createQRCodeDataUri(document.qrCodeData || JSON.stringify({ reference: document.reference }));
    const pdfBuffer = await buildDocumentPdf({ document: document as any, customer: document.customer, supplier: document.supplier, qrCodeUri, posStyle });

    // Set proper headers for PDF download
    const filename = `${document.reference}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Failed to generate PDF', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/:id/image', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'AUDITOR'), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const format = (req.query.format as string) || 'png';

    if (!['png', 'jpg', 'jpeg'].includes(format.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid format. Use png or jpg.' });
    }

    const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, supplier: true, lineItems: true } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const imageSvg = generateDocumentImage({ document: document as any, customer: document.customer, supplier: document.supplier, format: format.toLowerCase() as 'png' | 'jpg' });

    // Set proper headers for image download
    const fileExtension = format.toLowerCase() === 'jpg' ? 'jpg' : 'png';
    const filename = `${document.reference}.${fileExtension}`;
    const contentType = format.toLowerCase() === 'jpg' ? 'image/jpeg' : 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', imageSvg.length);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(imageSvg);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ message: 'Failed to generate image', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/:id/send-email', authorizeRoles('ADMIN', 'SALES', 'FINANCE'), async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { to, subject, message } = req.body;
    const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, supplier: true, lineItems: true } });
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const qrCodeUri = await createQRCodeDataUri(document.qrCodeData || JSON.stringify({ reference: document.reference }));
    const pdfBuffer = await buildDocumentPdf({ document: document as any, customer: document.customer, supplier: document.supplier, qrCodeUri });
    await sendDocumentEmail(to, subject, message || 'Please find your document attached.', pdfBuffer);
    await logAudit('EMAIL_DOCUMENT', 'Document', id, req.user?.id, `Sent document ${id} to ${to}`);

    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/:id/status', authorizeRoles('ADMIN', 'FINANCE'), async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { approvalStatus, status, approvedById } = req.body;
  const document = await prisma.document.update({ where: { id }, data: { approvalStatus, status, approvedById: approvedById ? Number(approvedById) : undefined } });
  await logAudit('UPDATE_DOCUMENT_STATUS', 'Document', id, req.user?.id, `Updated approval status to ${approvalStatus}`);
  res.json(document);
});

export default router;
