import PDFDocument from 'pdfkit';
import { type Document as DocumentModel, type DocumentLineItem, type Customer, type Supplier } from '@prisma/client';
import path from 'path';
import fs from 'fs';

interface PdfDocumentPayload {
  document: DocumentModel & { lineItems: DocumentLineItem[] };
  customer?: Customer | null;
  supplier?: Supplier | null;
  qrCodeUri?: string;
  posStyle?: boolean;
}

function padCenter(text: string, width: number): string {
  const padding = Math.max(0, width - text.length);
  const padLeft = Math.floor(padding / 2);
  const padRight = padding - padLeft;
  return ' '.repeat(padLeft) + text + ' '.repeat(padRight);
}

function padRight(text: string, width: number): string {
  return text + ' '.repeat(Math.max(0, width - text.length));
}

function buildPosPdfBuffer(payload: PdfDocumentPayload): Buffer {
  const { document, customer, supplier, qrCodeUri } = payload;
  const doc = new PDFDocument({
    size: [226.77, 841.89],
    margin: 10,
    bufferPages: true
  });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

  const width = 48;
  const separator = '='.repeat(width);
  const dashes = '-'.repeat(width);

  doc.font('Courier').fontSize(8);

  // Header
  doc.text(padCenter('INTERIOR DUCT LTD', width));
  doc.text(padCenter('Receipts & Invoice', width));
  doc.text(separator);
  doc.text('');

  // Document info
  doc.text(padRight(`${document.docType.replace(/_/g, ' ')}`, width));
  doc.text(padRight(`Ref: ${document.reference}`, width));
  doc.text(padRight(`Date: ${document.issueDate.toISOString().split('T')[0]}`, width));
  doc.text('');

  // Bill to
  doc.text('BILL TO:');
  const billName = customer?.name || supplier?.name || 'N/A';
  doc.text(billName.substring(0, width));
  if (customer || supplier) {
    const entity = customer || supplier;
    if (entity?.phone) doc.text(`Ph: ${entity.phone}`.substring(0, width));
  }
  doc.text('');

  // Items header
  doc.text(dashes);
  const descCol = 24;
  const qtyCol = 6;
  const priceCol = 8;
  const totalCol = 10;

  const header = 'ITEM' + ' '.repeat(descCol - 4) + 'QTY' + ' '.repeat(qtyCol - 3) + 'PRICE' + ' '.repeat(priceCol - 5) + 'TOTAL';
  doc.text(header.substring(0, width));
  doc.text(dashes);

  // Line items
  document.lineItems.forEach((line) => {
    const desc = line.description.substring(0, descCol).padEnd(descCol);
    const qty = String(line.quantity).padEnd(qtyCol).substring(0, qtyCol);
    const price = Number(line.unitPrice).toFixed(0).padStart(priceCol);
    const total = Number(line.total).toFixed(0).padStart(totalCol);

    doc.text(`${desc}${qty}${price}${total}`.substring(0, width));
  });

  doc.text(dashes);
  doc.text('');

  // Totals
  const subTotal = Number(document.totalAmount).toFixed(2);
  const vat = Number(document.vatAmount).toFixed(2);
  const discount = Number(document.discountAmount).toFixed(2);
  const amountPaid = Number(document.amountPaid).toFixed(2);
  const balance = Number(document.balanceDue).toFixed(2);

  doc.text(`Subtotal: NGN ${subTotal.padStart(width - 15)}`);
  if (Number(discount) > 0) {
    doc.text(`Discount: NGN ${discount.padStart(width - 15)}`);
  }
  if (Number(vat) > 0) {
    doc.text(`VAT: NGN ${vat.padStart(width - 15)}`);
  }
  doc.text(separator);
  doc.fontSize(10).text(padRight(`TOTAL: NGN ${subTotal}`, width), { align: 'right' });
  doc.fontSize(8).text(padRight(`Paid: NGN ${amountPaid}`, width));
  doc.text(padRight(`Balance: NGN ${balance}`, width));
  doc.text('');

  // QR Code
  if (qrCodeUri) {
    doc.image(qrCodeUri, { width: 100, align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(7).text(padCenter('Scan to verify', width));
  }

  doc.text('');
  doc.text(separator);
  doc.fontSize(7).text(padCenter(`Signed: ${document.signedBy || 'Required'}`, width));
  doc.text(padCenter(new Date().toLocaleString(), width));
  doc.text(padCenter('Thank you!', width));

  doc.end();
  return Buffer.concat(chunks);
}

export function buildDocumentPdf(payload: PdfDocumentPayload) {
  return new Promise<Buffer>((resolve, reject) => {
    if (payload.posStyle) {
      try {
        const buffer = buildPosPdfBuffer(payload);
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
      return;
    }

    const { document, customer, supplier, qrCodeUri } = payload;
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on('error', (err) => reject(err));
    doc.on('end', () => {
      try {
        resolve(Buffer.concat(chunks));
      } catch (error) {
        reject(error);
      }
    });

    // Add logo at the top
    const logoPath = path.join(__dirname, '../../public/logo.png');
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, { fit: [60, 60], align: 'left' });
        doc.moveDown(0.3);
      } catch (error) {
        console.warn('Could not load logo image:', error);
      }
    }

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
    const itemHeaders = ['Description', 'Qty', 'Unit', 'Unit Price', 'Discount', 'VAT (%)', 'Line Total'];
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
        `${Number(line.vat).toFixed(2)}%`,
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
  });
}
