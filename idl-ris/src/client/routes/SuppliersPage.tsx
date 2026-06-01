import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', contactEmail: '', phone: '', address: '', tin: '', notes: '' });

  useEffect(() => {
    api.get('/suppliers').then((response) => setSuppliers(response.data)).catch(console.error);
  }, []);

  const handleSave = async () => {
    await api.post('/suppliers', form);
    const response = await api.get('/suppliers');
    setSuppliers(response.data);
    setForm({ name: '', contactEmail: '', phone: '', address: '', tin: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Supplier Management</h2>
        <p className="mt-2 text-sm text-slate-500">Manage procurement suppliers, vendor contacts, and supplier documentation for materials and equipment.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input placeholder="Supplier name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Email" value={form.contactEmail} onChange={(event) => setForm({ ...form, contactEmail: event.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <Input placeholder="TIN" value={form.tin} onChange={(event) => setForm({ ...form, tin: event.target.value })} />
          <Input placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <Input placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={handleSave}>Create Supplier</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Supplier Directory</h2>
        <div className="mt-4 space-y-3">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{supplier.name}</p>
                  <p className="text-sm text-slate-600">{supplier.contactEmail} • {supplier.phone}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">TIN: {supplier.tin || 'N/A'}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{supplier.address}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
