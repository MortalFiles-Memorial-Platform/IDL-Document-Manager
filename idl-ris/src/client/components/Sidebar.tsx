import { NavLink } from 'react-router-dom';
import type { UserProfile } from '../types';
import { FileText, Users, Box, ClipboardList, ShieldCheck, CheckCircle2, Database, Layers } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Database },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/suppliers', label: 'Suppliers', icon: Box },
  { path: '/inventory', label: 'Inventory', icon: Layers },
  { path: '/loans', label: 'Loans', icon: ClipboardList },
  { path: '/approvals', label: 'Approvals', icon: CheckCircle2 },
  { path: '/audit', label: 'Audit Logs', icon: ShieldCheck }
];

export default function Sidebar({ user }: { user: UserProfile }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-6 lg:block">
      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">IDL-RIS Portal</p>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Welcome, {user.firstName}</h2>
        <p className="mt-2 text-sm text-slate-500">Manage documents, customers, inventory, approvals and compliance from one secure system.</p>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-200/50' : 'text-slate-700 hover:bg-slate-100'}`}>
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
