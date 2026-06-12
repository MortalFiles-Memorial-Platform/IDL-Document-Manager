import { type Document as DocumentModel, type DocumentLineItem, type Customer, type Supplier } from '@prisma/client';
import sharp from 'sharp';

interface ImageGenerationPayload {
  document: DocumentModel & { lineItems: DocumentLineItem[] };
  customer?: Customer | null;
  supplier?: Supplier | null;
  format: 'png' | 'jpg';
}

function generateDocumentSvg(payload: ImageGenerationPayload): string {
  const { document, customer, supplier } = payload;

  const width = 800;
  const height = 1100;
  const margin = 40;
  const lineHeight = 25;
  let yPosition = margin + 40;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        .header-title { font-size: 28px; font-weight: bold; fill: #0f172a; }
        .header-subtitle { font-size: 20px; fill: #334155; }
        .label { font-size: 12px; font-weight: bold; fill: #0f172a; }
        .text { font-size: 11px; fill: #334155; }
        .table-header { font-size: 11px; font-weight: bold; fill: #0f172a; }
        .total { font-size: 13px; font-weight: bold; fill: #0f172a; }
        .line { stroke: #cbd5e1; stroke-width: 1; }
      </style>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="white"/>

    <!-- Header -->
    <text x="${margin}" y="${yPosition}" class="header-title">Interior Duct Ltd</text>
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="header-subtitle">${document.docType.replace(/_/g, ' ')}</text>`
    }

    <!-- Document Info -->
    ${
      yPosition += lineHeight + 10,
      `<text x="${margin}" y="${yPosition}" class="label">Reference:</text>
    <text x="${margin + 100}" y="${yPosition}" class="text">${document.reference}</text>`
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="label">Date:</text>
    <text x="${margin + 100}" y="${yPosition}" class="text">${new Date(document.issueDate).toLocaleDateString()}</text>`
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="label">Status:</text>
    <text x="${margin + 100}" y="${yPosition}" class="text">${document.status}</text>`
    }

    <!-- Bill To -->
    ${
      yPosition += lineHeight + 10,
      `<text x="${margin}" y="${yPosition}" class="label">Bill To:</text>
    <text x="${margin}" y="${yPosition + lineHeight}" class="text">${customer?.name || supplier?.name || 'N/A'}</text>`
    }

    <!-- Table Header -->
    ${
      yPosition += lineHeight * 2,
      `<line x1="${margin}" y1="${yPosition}" x2="${width - margin}" y2="${yPosition}" class="line"/>
    <text x="${margin}" y="${yPosition + 15}" class="table-header">Description</text>
    <text x="${margin + 300}" y="${yPosition + 15}" class="table-header">Qty</text>
    <text x="${margin + 380}" y="${yPosition + 15}" class="table-header">Unit Price</text>
    <text x="${margin + 530}" y="${yPosition + 15}" class="table-header">Discount</text>
    <text x="${margin + 650}" y="${yPosition + 15}" class="table-header">VAT (%)</text>
    <line x1="${margin}" y1="${yPosition + 20}" x2="${width - margin}" y2="${yPosition + 20}" class="line"/>`
    }

    <!-- Line Items -->
    ${document.lineItems
      .map((item) => {
        yPosition += lineHeight;
        return `
    <text x="${margin}" y="${yPosition}" class="text">${item.description.substring(0, 40)}</text>
    <text x="${margin + 300}" y="${yPosition}" class="text">${item.quantity}</text>
    <text x="${margin + 380}" y="${yPosition}" class="text">₦${Number(item.unitPrice).toFixed(2)}</text>
    <text x="${margin + 530}" y="${yPosition}" class="text">₦${Number(item.discount).toFixed(2)}</text>
    <text x="${margin + 650}" y="${yPosition}" class="text">${Number(item.vat).toFixed(2)}%</text>`;
      })
      .join('')}

    <!-- Totals -->
    ${
      yPosition += lineHeight + 5,
      `<line x1="${margin}" y1="${yPosition}" x2="${width - margin}" y2="${yPosition}" class="line"/>`
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="total">Subtotal:</text>
    <text x="${width - margin - 80}" y="${yPosition}" class="total" text-anchor="end">₦${Number(document.totalAmount).toFixed(2)}</text>`
    }
    ${
      document.vatAmount > 0
        ? (yPosition += lineHeight,
          `<text x="${margin}" y="${yPosition}" class="text">VAT:</text>
    <text x="${width - margin - 80}" y="${yPosition}" class="text" text-anchor="end">₦${Number(document.vatAmount).toFixed(2)}</text>`)
        : ''
    }
    ${
      document.discountAmount > 0
        ? (yPosition += lineHeight,
          `<text x="${margin}" y="${yPosition}" class="text">Discount:</text>
    <text x="${width - margin - 80}" y="${yPosition}" class="text" text-anchor="end">₦${Number(document.discountAmount).toFixed(2)}</text>`)
        : ''
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="total">Amount Paid:</text>
    <text x="${width - margin - 80}" y="${yPosition}" class="total" text-anchor="end">₦${Number(document.amountPaid).toFixed(2)}</text>`
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="total">Balance Due:</text>
    <text x="${width - margin - 80}" y="${yPosition}" class="total" text-anchor="end">₦${Number(document.balanceDue).toFixed(2)}</text>`
    }

    <!-- Footer -->
    ${
      yPosition += lineHeight * 2,
      `<text x="${margin}" y="${yPosition}" class="text">Authorized By: ${document.signedBy || 'Required'}</text>`
    }
    ${
      yPosition += lineHeight,
      `<text x="${margin}" y="${yPosition}" class="text" font-size="10">${new Date().toLocaleString()}</text>`
    }

  </svg>`;

  return svg;
}

export async function generateDocumentImage(payload: ImageGenerationPayload): Promise<Buffer> {
  const svg = generateDocumentSvg(payload);
  const svgBuffer = Buffer.from(svg, 'utf-8');
  
  const { format } = payload;
  
  if (format === 'jpg') {
    return await sharp(svgBuffer)
      .jpeg({ quality: 90, progressive: true })
      .toBuffer();
  } else {
    return await sharp(svgBuffer)
      .png({ compressionLevel: 9 })
      .toBuffer();
  }
}

export function generateDocumentImageAsBase64(payload: ImageGenerationPayload): string {
  const svg = generateDocumentSvg(payload);
  return Buffer.from(svg, 'utf-8').toString('base64');
}
