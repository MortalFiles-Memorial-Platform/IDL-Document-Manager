import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';

const documentTypes = [
  'SALES_RECEIPT',
  'CASH_RECEIPT',
  'SALES_INVOICE',
  'PROFORMA_INVOICE',
  'QUOTATION',
  'DELIVERY_NOTE',
  'PAYMENT_VOUCHER',
  'IMPREST_VOUCHER',
  'EXPENSE_VOUCHER',
  'PURCHASE_RECEIPT',
  'PURCHASE_INVOICE',
  'LOAN_RECEIPT',
  'LOAN_REPAYMENT_RECEIPT',
  'SERVICE_COMPLETION_CERTIFICATE'
];

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  vat: number;
  total: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [template, setTemplate] = useState(documentTypes[0]);
  const [reference, setReference] = useState('IDL-0001');
  const [customerId, setCustomerId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState('Open');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Upholstery work', quantity: 1, unit: 'job', unitPrice: 0, discount: 0, vat: 0, total: 0 }
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<number | null>(null);
  const [previewDocument, setPreviewDocument] = useState<any | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = lineItems.reduce((sum, item) => sum + item.vat, 0);
    const discountAmount = lineItems.reduce((sum, item) => sum + item.discount, 0);
    const balance = subtotal - amountPaid;
    return { subtotal, vatAmount, discountAmount, balance };
  }, [lineItems, amountPaid]);

  const validateDocument = () => {
    const errors: Record<string, string> = {};
    if (!reference.trim()) errors.reference = 'Reference is required.';
    if (!signedBy.trim()) errors.signedBy = 'Staff signature name is required.';
    if (amountPaid < 0) errors.amountPaid = 'Amount paid cannot be negative.';
    if (!transactionStatus.trim()) errors.transactionStatus = 'Transaction status is required.';
    if (lineItems.length === 0) errors.lineItems = 'At least one line item is required.';

    lineItems.forEach((item, index) => {
      if (!item.description.trim()) errors[`line-${index}-description`] = 'Description is required.';
      if (item.quantity <= 0) errors[`line-${index}-quantity`] = 'Quantity must be at least 1.';
      if (item.unitPrice < 0) errors[`line-${index}-unitPrice`] = 'Unit price must be 0 or greater.';
      if (item.discount < 0) errors[`line-${index}-discount`] = 'Discount cannot be negative.';
      if (item.vat < 0) errors[`line-${index}-vat`] = 'VAT cannot be negative.';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleItemChange = (index: number, key: keyof LineItem, value: string | number) => {
    setLineItems((items) => {
      const next = [...items];
      next[index] = { ...next[index], [key]: value };
      next[index].total = Number(next[index].quantity) * Number(next[index].unitPrice) - Number(next[index].discount) + Number(next[index].vat);
      return next;
    });
  };

  const addLineItem = () => setLineItems((items) => [...items, { description: '', quantity: 1, unit: 'unit', unitPrice: 0, discount: 0, vat: 0, total: 0 }]);
  const removeLineItem = (index: number) => setLineItems((items) => items.filter((_, idx) => idx !== index));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionError('');
    setSuccessMessage('');

    if (!validateDocument()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/documents', {
        docType: template,
        reference,
        customerId: customerId || undefined,
        supplierId: supplierId || undefined,
        signedBy,
        amountPaid,
        transactionStatus,
        lineItems,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
      setSuccessMessage('Document created successfully.');
      fetchDocuments();
    } catch (error) {
      console.error(error);
      setSubmissionError('Unable to create document. Please review your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPreview = (documentItem: any) => {
    setPreviewDocumentId(documentItem.id);
    setPreviewDocument(documentItem);
  };

  const closePreview = () => {
    setPreviewDocumentId(null);
    setPreviewDocument(null);
  };

  const shareOnWhatsApp = (documentItem: any) => {
    const documentUrl = `${window.location.origin}/api/documents/${documentItem.id}/pdf`;
    const text = `Interior Duct Ltd document ${documentItem.reference} is ready. View the PDF here: ${documentUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener');
  };

  const inputErrorClass = (field: string) => (formErrors[field] ? 'border-rose-500' : '');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Document Template</h2>
              <p className="mt-1 text-sm text-slate-500">Create VAT-ready receipt and invoice documents with validation and line-item accuracy.</p>
            </div>
            {successMessage && <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{successMessage}</span>}
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Document Type
                <select className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm" value={template} onChange={(event) => setTemplate(event.target.value)}>
                  {documentTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Reference
                <Input className={inputErrorClass('reference')} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Document reference" />
                {formErrors.reference && <p className="mt-1 text-xs text-rose-600">{formErrors.reference}</p>}
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Customer ID
                <Input value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Customer ID" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Supplier ID
                <Input value={supplierId} onChange={(event) => setSupplierId(event.target.value)} placeholder="Supplier ID" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Staff Signature
                <Input className={inputErrorClass('signedBy')} value={signedBy} onChange={(event) => setSignedBy(event.target.value)} placeholder="Staff name" />
                {formErrors.signedBy && <p className="mt-1 text-xs text-rose-600">{formErrors.signedBy}</p>}
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Amount Paid (NGN)
                <Input className={inputErrorClass('amountPaid')} type="number" value={amountPaid} onChange={(event) => setAmountPaid(Number(event.target.value))} placeholder="0" />
                {formErrors.amountPaid && <p className="mt-1 text-xs text-rose-600">{formErrors.amountPaid}</p>}
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Transaction Status
                <Input className={inputErrorClass('transactionStatus')} value={transactionStatus} onChange={(event) => setTransactionStatus(event.target.value)} placeholder="Open / Paid / Partial" />
                {formErrors.transactionStatus && <p className="mt-1 text-xs text-rose-600">{formErrors.transactionStatus}</p>}
              </label>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Line Items</h3>
                <Button type="button" onClick={addLineItem}>Add item</Button>
              </div>
              {formErrors.lineItems && <p className="mt-2 text-xs text-rose-600">{formErrors.lineItems}</p>}

              <div className="space-y-3 pt-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-3">
                    <label className="block text-sm font-medium text-slate-700">
                      Description
                      <Input className={inputErrorClass(`line-${index}-description`)} value={item.description} onChange={(event) => handleItemChange(index, 'description', event.target.value)} placeholder="Item description" />
                      {formErrors[`line-${index}-description`] && <p className="mt-1 text-xs text-rose-600">{formErrors[`line-${index}-description`]}</p>}
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Qty
                      <Input className={inputErrorClass(`line-${index}-quantity`)} type="number" value={item.quantity} onChange={(event) => handleItemChange(index, 'quantity', Number(event.target.value))} />
                      {formErrors[`line-${index}-quantity`] && <p className="mt-1 text-xs text-rose-600">{formErrors[`line-${index}-quantity`]}</p>}
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Unit
                      <Input value={item.unit} onChange={(event) => handleItemChange(index, 'unit', event.target.value)} placeholder="unit" />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Unit Price
                      <Input className={inputErrorClass(`line-${index}-unitPrice`)} type="number" value={item.unitPrice} onChange={(event) => handleItemChange(index, 'unitPrice', Number(event.target.value))} />
                      {formErrors[`line-${index}-unitPrice`] && <p className="mt-1 text-xs text-rose-600">{formErrors[`line-${index}-unitPrice`]}</p>}
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Discount
                      <Input className={inputErrorClass(`line-${index}-discount`)} type="number" value={item.discount} onChange={(event) => handleItemChange(index, 'discount', Number(event.target.value))} />
                      {formErrors[`line-${index}-discount`] && <p className="mt-1 text-xs text-rose-600">{formErrors[`line-${index}-discount`]}</p>}
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      VAT
                      <Input className={inputErrorClass(`line-${index}-vat`)} type="number" value={item.vat} onChange={(event) => handleItemChange(index, 'vat', Number(event.target.value))} />
                      {formErrors[`line-${index}-vat`] && <p className="mt-1 text-xs text-rose-600">{formErrors[`line-${index}-vat`]}</p>}
                    </label>
                    <div className="flex items-end justify-between md:col-span-3">
                      <p className="text-sm text-slate-600">Line Total: NGN {item.total.toFixed(2)}</p>
                      {lineItems.length > 1 && (
                        <button type="button" className="text-rose-600 hover:text-rose-800" onClick={() => removeLineItem(index)}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {submissionError && <p className="text-sm text-rose-600">{submissionError}</p>}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving document…' : 'Create Document'}</Button>
          </form>
        </Card>
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Documents</h2>
              <p className="mt-1 text-sm text-slate-500">Preview, share, and print generated business documents quickly.</p>
            </div>
            <Button type="button" onClick={fetchDocuments}>Refresh</Button>
          </div>
          <div className="mt-4 space-y-4">
            {documents.slice(0, 6).map((document) => (
              <div key={document.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{document.docType.replace(/_/g, ' ')}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{document.reference}</p>
                    <p className="text-sm text-slate-600">Status: {document.status}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">Balance: NGN {Number(document.balanceDue || 0).toFixed(2)}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => openPreview(document)}>Preview</Button>
                  <Button type="button" className="bg-slate-700 hover:bg-slate-800" onClick={() => shareOnWhatsApp(document)}>Share WhatsApp</Button>
                  <a className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700" href={`/api/documents/${document.id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {previewDocumentId && previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Document Preview</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{previewDocument.reference}</h3>
                <p className="text-sm text-slate-600">{previewDocument.docType.replace(/_/g, ' ')} • Status {previewDocument.status}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => window.open(`/api/documents/${previewDocumentId}/pdf`, '_blank')}>Open PDF</Button>
                <Button type="button" className="bg-slate-700 hover:bg-slate-800" onClick={() => window.open(`/api/documents/${previewDocumentId}/pdf`, '_blank')}>Print</Button>
                <button type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100" onClick={closePreview}>Close</button>
              </div>
            </div>
            <div className="h-[75vh] bg-slate-950">
              <iframe src={`/api/documents/${previewDocumentId}/pdf`} className="h-full w-full" title="Document preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
