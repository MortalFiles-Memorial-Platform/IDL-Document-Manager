import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import type { UserProfile } from '../types';
import { FileText, Users, Box, ClipboardList, ShieldCheck, CheckCircle2, Database, Layers, BarChart3, PieChart } from 'lucide-react';

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

export default function MobileNav({ user }: { user: UserProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const userDept = getUserAccessDepartment(user);

  const filteredNavItems = navItems.filter(item => {
    return item.departments.includes(userDept);
  });

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="IDL" className="h-8 w-8 rounded" />
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <nav className="lg:hidden fixed top-14 left-0 right-0 bottom-0 z-30 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-4 space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
