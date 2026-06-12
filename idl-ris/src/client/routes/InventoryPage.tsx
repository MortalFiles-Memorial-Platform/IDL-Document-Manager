import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import BackButton from '../components/BackButton';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ sku: '', name: '', category: '', unit: 'pcs', unitPrice: 0, quantity: 0, reorderLevel: 5, location: '' });

  useEffect(() => {
    api.get('/inventory').then((response) => setItems(response.data)).catch(console.error);
  }, []);

  const handleSave = async () => {
    await api.post('/inventory', form);
    const response = await api.get('/inventory');
    setItems(response.data);
    setForm({ sku: '', name: '', category: '', unit: 'pcs', unitPrice: 0, quantity: 0, reorderLevel: 5, location: '' });
  };

  return (
    <div className="space-y-6">
      <BackButton label="Back to Dashboard" to="/dashboard" />
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Inventory Management</h2>
        <p className="mt-2 text-sm text-slate-500">Track raw materials, finished furniture stock, upholstery supplies, and maintenance inventory.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input placeholder="SKU (e.g., FRN-001)" value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
          <Input placeholder="Item name (e.g., Leather Sofa)" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input placeholder="Category (e.g., Furniture)" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <Input placeholder="Unit (e.g., pcs, meters, kg)" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          <Input placeholder="Unit price (e.g., 15000.00)" type="number" value={form.unitPrice} onChange={(event) => setForm({ ...form, unitPrice: Number(event.target.value) })} min="0" step="0.01" />
          <Input placeholder="Quantity (e.g., 10)" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })} min="0" step="0.01" />
          <Input placeholder="Reorder level (e.g., 5)" type="number" value={form.reorderLevel} onChange={(event) => setForm({ ...form, reorderLevel: Number(event.target.value) })} min="0" step="1" />
          <Input placeholder="Location (e.g., Warehouse A, Shelf 3)" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
        </div>
        <div className="mt-4">
          <Button type="button" onClick={handleSave}>Add inventory item</Button>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-slate-900">Inventory Items</h2>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-600">SKU: {item.sku} • {item.category}</p>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">Qty: {item.quantity}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Unit price: NGN {Number(item.unitPrice).toFixed(2)} • Location: {item.location}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
