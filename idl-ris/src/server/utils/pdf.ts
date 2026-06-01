import PDFDocument from 'pdfkit';
import { type Document as DocumentModel, type DocumentLineItem, type Customer, type Supplier } from '@prisma/client';

interface PdfDocumentPayload {
  document: DocumentModel & { lineItems: DocumentLineItem[] };
  customer?: Customer | null;
  supplier?: Supplier | null;
  qrCodeUri?: string;
}

export function buildDocumentPdf(payload: PdfDocumentPayload) {
  const { document, customer, supplier, qrCodeUri } = payload;
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => undefined);

  doc.fontSize(20).fillColor('#0f172a').text('Interior Duct Ltd', { align: 'left' });
  doc.moveDown(0.4);
  doc.fontSize(14).fillColor('#334155').text(document.docType.replace(/_/g, ' '), { align: 'left' });
  doc.moveDown(0.5);

  doc.fontSize(10).fillColor('#475569');
  doc.text(`Reference: ${document.reference}`);
  doc.text(`Issue Date: ${document.issueDate.toISOString().split('T')[0]}`);
  if (document.dueDate) {
    doc.text(`Due Date: ${document.dueDate.toISOString().split('T')[0]}`);
  }
  doc.text(`Status: ${document.status}`);
  doc.text(`Approval Status: ${document.approvalStatus}`);
  doc.moveDown();

  const group = doc.fontSize(10).fillColor('#0f172a');
  group.text('Bill To:', { continued: true }).text(customer?.name || supplier?.name || 'N/A');
  if (customer) {
    doc.text(customer.address);
    doc.text(`Email: ${customer.contactEmail}`);
    doc.text(`Phone: ${customer.phone}`);
  }
  if (supplier) {
    doc.text(supplier.address);
    doc.text(`Email: ${supplier.contactEmail}`);
    doc.text(`Phone: ${supplier.phone}`);
  }
  doc.moveDown(1);

  const tableTop = doc.y;
  const itemHeaders = ['Description', 'Qty', 'Unit', 'Unit Price', 'Discount', 'VAT', 'Line Total'];
  const columnWidths = [200, 40, 50, 70, 60, 50, 80];
  let x = doc.x;

  itemHeaders.forEach((header, index) => {
    doc.font('Helvetica-Bold').fontSize(9).text(header, x, tableTop, { width: columnWidths[index], continued: false });
    x += columnWidths[index];
  });

  doc.moveDown(0.5);

  document.lineItems.forEach((line) => {
    x = doc.x;
    const values = [
      line.description,
      String(line.quantity),
      line.unit,
      Number(line.unitPrice).toFixed(2),
      `${Number(line.discount).toFixed(2)}`,
      `${Number(line.vat).toFixed(2)}`,
      Number(line.total).toFixed(2)
    ];
    values.forEach((value, index) => {
      doc.font('Helvetica').fontSize(9).text(value, x, doc.y, { width: columnWidths[index], continued: false });
      x += columnWidths[index];
    });
    doc.moveDown(0.3);
  });

  doc.moveDown(1);
  doc.font('Helvetica-Bold').text(`Sub Total: NGN ${Number(document.totalAmount).toFixed(2)}`);
  doc.font('Helvetica').text(`VAT: NGN ${Number(document.vatAmount).toFixed(2)}`);
  doc.text(`Discount: NGN ${Number(document.discountAmount).toFixed(2)}`);
  doc.text(`Amount Paid: NGN ${Number(document.amountPaid).toFixed(2)}`);
  doc.text(`Balance Due: NGN ${Number(document.balanceDue).toFixed(2)}`);
  doc.moveDown(1);

  if (qrCodeUri) {
    doc.image(qrCodeUri, { fit: [120, 120], align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(8).text('Scan the QR code to verify the document record.', { width: 250 });
  }

  doc.moveDown(1);
  doc.fontSize(10).text(`Staff Signature: ${document.signedBy || 'Required'}`);
  if (document.customerSignatureUrl) {
    doc.fontSize(10).text('Customer signature included.');
  }

  doc.end();
  return Buffer.concat(chunks);
}
