import { NavLink, Link } from 'react-router-dom';
import type { UserProfile } from '../types';
import { FileText, Users, Box, ClipboardList, ShieldCheck, CheckCircle2, Database, Layers, BarChart3, PieChart } from 'lucide-react';

// Map navigation items to departments that should see them
// Each item can specify which roles/departments can access it
const navItems = [
  { path: '/', label: 'Dashboard', icon: Database, departments: ['ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'] },
  { path: '/documents', label: 'Documents', icon: FileText, departments: ['ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'] },
  { path: '/customers', label: 'Customers', icon: Users, departments: ['ADMIN', 'SALES', 'FINANCE'] },
  { path: '/suppliers', label: 'Suppliers', icon: Box, departments: ['ADMIN', 'PROCUREMENT', 'FINANCE'] },
  { path: '/inventory', label: 'Inventory', icon: Layers, departments: ['ADMIN', 'PROCUREMENT'] },
  { path: '/loans', label: 'Loans', icon: ClipboardList, departments: ['ADMIN', 'FINANCE'] },
  { path: '/approvals', label: 'Approvals', icon: CheckCircle2, departments: ['ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT'] },
  { path: '/audit', label: 'Audit Logs', icon: ShieldCheck, departments: ['ADMIN', 'AUDITOR'] },
  { path: '/general-ledger', label: 'General Ledger', icon: Database, departments: ['ADMIN', 'FINANCE'] },
  { path: '/profit-loss', label: 'Profit & Loss', icon: BarChart3, departments: ['ADMIN', 'FINANCE'] },
  { path: '/balance-sheet', label: 'Balance Sheet', icon: PieChart, departments: ['ADMIN', 'FINANCE'] }
];

// Helper function to get user's access department
function getUserAccessDepartment(user: UserProfile): string {
  // Use department field if available, otherwise fall back to role
  return user.department || user.role;
}

export default function Sidebar({ user }: { user: UserProfile }) {
  const userDept = getUserAccessDepartment(user);
  
  const filteredNavItems = navItems.filter(item => {
    // Show item if user's department is in the allowed departments
    return item.departments.includes(userDept);
  });

  return (
    <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-slate-50 p-6 lg:block">
      <Link to="/" className="mb-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm block hover:shadow-md transition">
        <div className="flex items-center gap-3 mb-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Interior Duct Ltd" className="h-10 w-10 rounded-lg object-cover" />
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">IDL-RIS Portal</p>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Welcome, {user.firstName}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {userDept} Department - Manage documents and operations from one secure system.
        </p>
      </Link>
      <nav className="space-y-2">
        {filteredNavItems.map((item) => {
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
