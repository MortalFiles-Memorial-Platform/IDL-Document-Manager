# Interior Duct Ltd Receipts & Invoice System (IDL-RIS)

Enterprise-ready business document management system for Nigerian furniture manufacturing, procurement, sales, services, training, and audit workflows.

## Features

- Sales Receipts, Cash Receipts, Sales/Proforma Invoices, Quotations, Delivery Notes, Vouchers, Purchase Receipts, Loan Documents, Service Completion Certificates
- Dynamic document templates with multiple line items, quantity, unit, unit price, discount, VAT, balance due, amount paid, status, and auto-calculations
- QR code verification + PDF generation + print support
- Email and WhatsApp sharing hooks
- Optional customer signature + mandatory staff signature
- Customer management, supplier management, inventory, expenses, loans, approval workflow, audit logs, dashboard analytics
- Role-based access control with Nigerian VAT-compliant templates
- Node.js + Express backend, PostgreSQL database, JWT authentication, AWS S3 document storage

## Getting Started

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure PostgreSQL and AWS credentials in `.env`

4. Generate Prisma client, run the first migration, and seed a default admin user:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

5. Start development servers:

   ```bash
   npm run dev
   ```

6. Open the frontend at `http://localhost:5173`

## Deployment

- Host the backend on Railway with PostgreSQL as the primary database
- Use AWS S3 for document storage and media
- Deploy the frontend via GitHub Pages, Railway static site, or any Vite-compatible host
- Add `DATABASE_URL`, `JWT_SECRET`, `AWS_*`, and `SMTP_*` environment variables in Railway

## Project Structure

- `src/server` – Express API, authentication, RBAC middleware, Prisma database connector, document generator, email and S3 helpers
- `src/client` – React + TypeScript frontend with TailwindCSS and shadcn-style UI components
- `prisma/schema.prisma` – PostgreSQL data model for users, customers, suppliers, inventory, documents, expenses, loans, audit

## Notes

- Remove any external links, ads, or irrelevant content from legacy sources before production deployment
- This repository is structured for a private GitHub deployment with secure environment variables and audit compliance
- Use Railway for production hosting and AWS S3 for file storage
