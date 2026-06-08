import { UserCheck, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition">
          <img src="/logo.png" alt="Interior Duct Ltd" className="h-12 w-12 rounded-lg" />
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand-600">Interior Duct Ltd</p>
            <h1 className="text-2xl font-semibold text-slate-900">Receipts & Invoice Management</h1>
            <p className="mt-1 text-sm text-slate-500">Enterprise-grade document management built for Nigerian manufacturing and services.</p>
          </div>
        </Link>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
          <UserCheck className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
          <button type="button" onClick={onLogout} className="ml-4 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-white transition hover:bg-brand-700">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
