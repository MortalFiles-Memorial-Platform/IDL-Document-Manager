import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import BackButton from '../components/BackButton';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '', tin: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      setError(message);
      console.error('Customers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Customer name is required';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errors.contactEmail = 'Enter a valid email';
    }
    if (form.phone && !/^[\d+\-\s()]+$/.test(form.phone)) {
      errors.phone = 'Enter a valid phone number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      setError(null);
      await api.post('/customers', form);
      setSuccessMessage('Customer created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchCustomers();
      setForm({ name: '', contactEmail: '', phone: '', address: '', tin: '', notes: '' });
      setFormErrors({});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create customer';
      setError(message);
      console.error('Customer save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      {error && (
        <div className="rounded-3xl bg-rose-50 p-4 border border-rose-200">
          <p className="text-sm text-rose-700 font-medium">Error: {error}</p>
          <Button onClick={fetchCustomers} className="mt-3 bg-rose-600 hover:bg-rose-700">
            Retry
          </Button>
        </div>
      )}
      {successMessage && (
        <div className="rounded-3xl bg-emerald-50 p-4 border border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">✓ {successMessage}</p>
        </div>
      )}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Customer Management</h2>
        <p className="mt-2 text-sm text-slate-500">Capture customers, contacts, and billing information for furniture sales, upholstery, welding, and training customers.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Input placeholder="Customer name (e.g., ABC Enterprises Ltd)" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={formErrors.name ? 'border-rose-500' : ''} />
            {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
          </div>
          <div>
            <Input placeholder="Email (e.g., contact@customer.com)" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} className={formErrors.contactEmail ? 'border-rose-500' : ''} />
            {formErrors.contactEmail && <p className="mt-1 text-xs text-rose-600">{formErrors.contactEmail}</p>}
          </div>
          <div>
            <Input placeholder="Phone (e.g., +234 803 456 7890)" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={formErrors.phone ? 'border-rose-500' : ''} />
            {formErrors.phone && <p className="mt-1 text-xs text-rose-600">{formErrors.phone}</p>}
          </div>
          <Input placeholder="TIN (e.g., TIN001234)" value={form.tin} onChange={(event) => setForm({ ...form, tin: event.target.value })} />
          <Input placeholder="Address (e.g., 123 Marina Street, Lagos, Nigeria)" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <Input placeholder="Notes (optional)" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Creating...' : 'Create Customer'}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Customer Directory</h2>
          <Button onClick={fetchCustomers} className="bg-slate-400 hover:bg-slate-500">Refresh</Button>
        </div>
        {loading && !error && (
          <div className="text-center py-8">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="h-8 w-8 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
              <p className="text-slate-600">Loading customers...</p>
            </div>
          </div>
        )}
        {!loading && customers.length === 0 && !error && (
          <p className="text-center text-slate-500 py-8">No customers yet. Create one to get started.</p>
        )}
        {!loading && customers.length > 0 && (
          <div className="mt-4 space-y-3">
            {customers.map((customer) => (
              <div key={customer.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-600">{customer.contactEmail || 'No email'} • {customer.phone || 'No phone'}</p>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">TIN: {customer.tin || 'N/A'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{customer.address || 'No address provided'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
