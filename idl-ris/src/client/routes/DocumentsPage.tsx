import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { getToken } from '../lib/auth';
import BackButton from '../components/BackButton';

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download file');
  }
};

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

function DocumentForm({ docType, onSubmit }: { docType: string; onSubmit: (data: any) => void }) {
  const [reference, setReference] = useState('IDL-0001');
  const [customerId, setCustomerId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState('Open');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Service', quantity: 1, unit: 'unit', unitPrice: 0, discount: 0, vat: 0, total: 0 }
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReceipt = docType.includes('RECEIPT');
  const isVoucher = docType.includes('VOUCHER');
  const isLoan = docType.includes('LOAN');
  const isPurchase = docType.includes('PURCHASE');
  const isSales = docType.includes('SALES') || docType.includes('INVOICE') || docType.includes('QUOTATION');

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      return sum + (qty * price) - discount;
    }, 0);

    const vatAmount = lineItems.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const itemSubtotal = (qty * price) - discount;
      const vatPercentage = Number(item.vat) || 0;
      return sum + (itemSubtotal * vatPercentage) / 100;
    }, 0);

    const discountAmount = lineItems.reduce((sum, item) => sum + Number(item.discount), 0);
    const balance = subtotal + vatAmount - amountPaid;
    return { subtotal, vatAmount, discountAmount, balance };
  }, [lineItems, amountPaid]);

  const validateDocument = () => {
    const errors: Record<string, string> = {};
    if (!reference.trim()) errors.reference = 'Reference is required.';
    if (!signedBy.trim()) errors.signedBy = 'Authorized person is required.';
    if (amountPaid < 0) errors.amountPaid = 'Amount cannot be negative.';
    if (lineItems.length === 0) errors.lineItems = 'At least one line item is required.';

    lineItems.forEach((item, index) => {
      if (!item.description.trim()) errors[`line-${index}-description`] = 'Description required.';
      if (item.quantity <= 0) errors[`line-${index}-quantity`] = 'Quantity must be > 0.';
      if (item.unitPrice < 0) errors[`line-${index}-unitPrice`] = 'Unit price invalid.';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleItemChange = (index: number, key: keyof LineItem, value: string | number) => {
    setLineItems((items) => {
      const next = [...items];
      next[index] = { ...next[index], [key]: value };

      const quantity = Number(next[index].quantity) || 0;
      const unitPrice = Number(next[index].unitPrice) || 0;
      const discount = Number(next[index].discount) || 0;
      const vatPercentage = Number(next[index].vat) || 0;

      const subtotal = (quantity * unitPrice) - discount;
      const vatAmount = (subtotal * vatPercentage) / 100;
      next[index].total = subtotal + vatAmount;

      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateDocument()) {
      setIsSubmitting(true);
      onSubmit({
        docType,
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
      setTimeout(() => setIsSubmitting(false), 2000);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Reference
          <Input
            className={formErrors.reference ? 'border-rose-500 mt-1' : 'mt-1'}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Document reference"
          />
          {formErrors.reference && <p className="mt-1 text-xs text-rose-600">{formErrors.reference}</p>}
        </label>

        {(isSales || isPurchase) && (
          <label className="block text-sm font-medium text-slate-700">
            {isSales ? 'Customer ID' : 'Supplier ID'}
            <Input
              className="mt-1"
              value={isSales ? customerId : supplierId}
              onChange={(e) => (isSales ? setCustomerId(e.target.value) : setSupplierId(e.target.value))}
              placeholder={isSales ? 'Customer ID' : 'Supplier ID'}
            />
          </label>
        )}

        {isVoucher && (
          <label className="block text-sm font-medium text-slate-700">
            Approving Officer
            <Input className="mt-1" value={signedBy} onChange={(e) => setSignedBy(e.target.value)} placeholder="Officer name" />
          </label>
        )}

        {!isVoucher && (
          <label className="block text-sm font-medium text-slate-700">
            Authorized By
            <Input className="mt-1" value={signedBy} onChange={(e) => setSignedBy(e.target.value)} placeholder="Name" />
          </label>
        )}
      </div>

      {!isReceipt && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Amount {isReceipt ? 'Received' : 'Paid'} (NGN)
            <Input className="mt-1" type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} placeholder="e.g., 50000.00" min="0" step="0.01" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Status
            <select className="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm">
              <option>Open</option>
              <option>Partial</option>
              <option>Paid</option>
            </select>
          </label>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900">
            {isVoucher ? 'Expense Items' : isSales ? 'Sales Items' : isPurchase ? 'Purchase Items' : 'Items'}
          </h3>
          <Button type="button" onClick={() => setLineItems([...lineItems, { description: '', quantity: 1, unit: 'unit', unitPrice: 0, discount: 0, vat: 0, total: 0 }])}>
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {lineItems.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-3">
              <label className="block text-sm font-medium text-slate-700">
                Description
                <Input className="mt-1" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder={isVoucher ? 'Expense description' : 'Item description'} />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Qty
                <Input className="mt-1" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} placeholder="e.g., 5" min="0" step="0.01" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Unit Price
                <Input className="mt-1" type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))} placeholder="e.g., 1000.00" min="0" step="0.01" />
              </label>
              {!isVoucher && (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Discount
                    <Input className="mt-1" type="number" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))} placeholder="e.g., 50.00" min="0" step="0.01" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    VAT (%)
                    <Input
                      className="mt-1"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={item.vat}
                      onChange={(e) => handleItemChange(index, 'vat', Number(e.target.value))}
                      placeholder="e.g., 7.5"
                    />
                  </label>
                </>
              )}
              <div className="flex items-end justify-between md:col-span-3">
                <p className="text-sm text-slate-600">Total: NGN {item.total.toFixed(2)}</p>
                {lineItems.length > 1 && <button type="button" className="text-rose-600" onClick={() => setLineItems(lineItems.filter((_, i) => i !== index))}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-3xl space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal (after discount):</span>
          <span className="font-medium">NGN {(totals.subtotal - totals.discountAmount).toFixed(2)}</span>
        </div>
        {!isVoucher && (
          <>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span className="font-medium">-NGN {totals.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {totals.vatAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>VAT (calculated):</span>
                <span className="font-medium">+NGN {totals.vatAmount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}
        <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
          <span>Total:</span>
          <span>NGN {(totals.subtotal - totals.discountAmount + totals.vatAmount).toFixed(2)}</span>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '⏳ Creating...' : `✓ Create ${docType.replace(/_/g, ' ')}`}
      </Button>
    </form>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [template, setTemplate] = useState(documentTypes[0]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
      console.error('Failed to fetch documents:', error);
      setErrorMessage('Failed to load documents');
    }
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      console.log('Submitting document:', data);
      const response = await api.post('/documents', data);
      console.log('Document created successfully:', response.data);
      setSuccessMessage(`✓ ${data.docType.replace(/_/g, ' ')} created successfully!`);
      await fetchDocuments();
      setTemplate(documentTypes[0]);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to create document:', error);
      if (error instanceof Error && error.message.includes('401')) {
        setErrorMessage('Session expired. Please log in again.');
        localStorage.removeItem('idl_ris_token');
        window.location.href = '/';
      } else {
        const details = error instanceof Error ? error.message : (error as any)?.response?.data?.message || 'Unknown error';
        setErrorMessage(`Failed to create document: ${details}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openPreview = (doc: any) => {
    setPreviewDocumentId(doc.id);
    setPreviewDocument(doc);
  };

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Create Document</h2>
              <p className="mt-1 text-sm text-slate-500">Form adapts based on document type selected.</p>
            </div>
          </div>

          {successMessage && (
            <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Document Type
              <select
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <DocumentForm docType={template} onSubmit={handleSubmit} />
        </Card>

        <Card>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Documents</h2>
              <p className="mt-1 text-sm text-slate-500">View and manage generated documents.</p>
            </div>
            <Button type="button" onClick={fetchDocuments}>Refresh</Button>
          </div>

          <div className="space-y-4">
            {documents.slice(0, 6).map((doc) => (
              <div key={doc.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-500">{doc.docType.replace(/_/g, ' ')}</p>
                  <p className="font-semibold text-slate-900">{doc.reference}</p>
                  <p className="text-sm text-slate-600">Status: {doc.status}</p>
                  <span className="inline-block w-fit rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
                    Balance: NGN {Number(doc.balanceDue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => openPreview(doc)}>Preview</Button>
                  <Button onClick={() => downloadFile(`/documents/${doc.id}/pdf`, `${doc.reference}.pdf`)} className="bg-brand-600 hover:bg-brand-700">PDF</Button>
                  <Button onClick={() => downloadFile(`/documents/${doc.id}/image?format=png`, `${doc.reference}.png`)} className="bg-blue-600 hover:bg-blue-700">PNG</Button>
                  <Button onClick={() => downloadFile(`/documents/${doc.id}/image?format=jpg`, `${doc.reference}.jpg`)} className="bg-amber-600 hover:bg-amber-700">JPG</Button>
                  <Button onClick={() => downloadFile(`/documents/${doc.id}/pdf?style=pos`, `${doc.reference}_receipt.pdf`)} className="bg-slate-600 hover:bg-slate-700">Receipt</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {previewDocumentId && previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Document Preview</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{previewDocument.reference}</h3>
              </div>
              <button onClick={() => setPreviewDocumentId(null)} className="text-slate-500 hover:text-slate-900">✕</button>
            </div>
            <div className="h-[70vh] bg-slate-950">
              <iframe src={`/api/documents/${previewDocumentId}/pdf?token=${getToken()}`} className="h-full w-full" title="Document preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
