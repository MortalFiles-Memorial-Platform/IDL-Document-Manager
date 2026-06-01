import { Router } from 'express';
import prisma from '../db';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/roles';
import { createQRCodeDataUri } from '../utils/qrcode';
import { buildDocumentPdf } from '../utils/pdf';
import { uploadBufferToS3 } from '../utils/s3';
import { sendDocumentEmail } from '../utils/email';
import { logAudit } from '../utils/audit';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'), async (req, res) => {
  const docs = await prisma.document.findMany({ include: { customer: true, supplier: true, lineItems: true }, orderBy: { createdAt: 'desc' } });
  res.json(docs);
});

router.post('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT'), async (req, res) => {
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
  const pdfBuffer = buildDocumentPdf({ document: payload as any, customer: payload?.customer || undefined, supplier: payload?.supplier || undefined, qrCodeUri });
  const url = await uploadBufferToS3(pdfBuffer, `documents/${reference}.pdf`, 'application/pdf');

  await prisma.document.update({ where: { id: document.id }, data: { documentUrl: url } });
  await logAudit('CREATE_DOCUMENT', 'Document', document.id, req.user?.id, `Created document ${reference}`);

  res.status(201).json({ ...document, documentUrl: url });
});

router.get('/:id/pdf', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'AUDITOR'), async (req, res) => {
  const id = Number(req.params.id);
  const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, supplier: true, lineItems: true } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const qrCodeUri = await createQRCodeDataUri(document.qrCodeData || JSON.stringify({ reference: document.reference }));
  const pdfBuffer = buildDocumentPdf({ document: document as any, customer: document.customer, supplier: document.supplier, qrCodeUri });
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
});

router.post('/:id/send-email', authorizeRoles('ADMIN', 'SALES', 'FINANCE'), async (req, res) => {
  const id = Number(req.params.id);
  const { to, subject, message } = req.body;
  const document = await prisma.document.findUnique({ where: { id }, include: { customer: true, supplier: true, lineItems: true } });
  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const qrCodeUri = await createQRCodeDataUri(document.qrCodeData || JSON.stringify({ reference: document.reference }));
  const pdfBuffer = buildDocumentPdf({ document: document as any, customer: document.customer, supplier: document.supplier, qrCodeUri });
  await sendDocumentEmail(to, subject, message || 'Please find your document attached.', pdfBuffer);
  await logAudit('EMAIL_DOCUMENT', 'Document', id, req.user?.id, `Sent document ${id} to ${to}`);

  res.json({ message: 'Email sent successfully.' });
});

router.put('/:id/status', authorizeRoles('ADMIN', 'FINANCE'), async (req, res) => {
  const id = Number(req.params.id);
  const { approvalStatus, status, approvedById } = req.body;
  const document = await prisma.document.update({ where: { id }, data: { approvalStatus, status, approvedById: approvedById ? Number(approvedById) : undefined } });
  await logAudit('UPDATE_DOCUMENT_STATUS', 'Document', id, req.user?.id, `Updated approval status to ${approvalStatus}`);
  res.json(document);
});

export default router;
