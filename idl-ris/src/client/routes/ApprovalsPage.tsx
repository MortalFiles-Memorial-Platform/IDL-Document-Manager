import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import BackButton from '../components/BackButton';

const approvalFilters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];

export default function ApprovalsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [filter, setFilter] = useState('PENDING');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const visibleDocuments = useMemo(() => {
    if (filter === 'ALL') return documents;
    return documents.filter((doc) => doc.approvalStatus === filter);
  }, [documents, filter]);

  const handleSelect = (doc: any) => {
    setSelectedDoc(doc);
    setComment('');
  };

  const updateApproval = async (status: string) => {
    if (!selectedDoc) return;
    setIsSubmitting(true);
    try {
      await api.put(`/documents/${selectedDoc.id}/status`, {
        approvalStatus: status,
        status: selectedDoc.status,
        comment
      });
      await loadDocuments();
      setSelectedDoc(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Approval Workflow</h2>
            <p className="mt-2 text-sm text-slate-500">Review and route documents across finance, audit, and operations using a detailed approval interface.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {approvalFilters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${filter === option ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {visibleDocuments.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{doc.docType.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{doc.reference}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">{doc.approvalStatus}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Balance due: NGN {Number(doc.balanceDue).toFixed(2)}</p>
                  <p className="text-sm text-slate-600">Status: {doc.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={() => handleSelect(doc)}>Review</Button>
                  <a className="inline-flex items-center justify-center rounded-2xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800" href={`/api/documents/${doc.id}/pdf`} target="_blank" rel="noreferrer">Open PDF</a>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Review Panel</h3>
            {selectedDoc ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{selectedDoc.docType.replace(/_/g, ' ')}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">{selectedDoc.reference}</p>
                  <p className="mt-2 text-sm text-slate-600">Approved by: {selectedDoc.approvedById || 'Pending'}</p>
                  <p className="text-sm text-slate-600">Created: {new Date(selectedDoc.issueDate).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600">Balance due: NGN {Number(selectedDoc.balanceDue).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Review comment</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={4}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    placeholder="Add a note for the finance or audit team"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => updateApproval('APPROVED')} disabled={isSubmitting}>Approve</Button>
                  <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={() => updateApproval('REJECTED')} disabled={isSubmitting}>Reject</Button>
                  <button type="button" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setSelectedDoc(null)}>Clear</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Choose a pending document to review detailed line items, approval status, and compliance status.</p>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900">Approval Guidance</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Confirm line item values, VAT charges, and total amounts before approving.</li>
              <li>• Verify the staff signature field is completed for compliance.</li>
              <li>• Use comments for audit trail and finance reviewer context.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
