import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './routes/DashboardPage';
import DocumentsPage from './routes/DocumentsPage';
import CustomersPage from './routes/CustomersPage';
import SuppliersPage from './routes/SuppliersPage';
import InventoryPage from './routes/InventoryPage';
import LoansPage from './routes/LoansPage';
import AuditLogsPage from './routes/AuditLogsPage';
import ApprovalsPage from './routes/ApprovalsPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { UserProfile } from './types';

const defaultUser: UserProfile = {
  id: 1,
  email: 'admin@interiorduct.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN'
};

function App() {
  const [user] = useState<UserProfile>(defaultUser);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar user={user} />
        <main className="flex-1 p-6 lg:p-8">
          <Header user={user} onLogout={() => {}} />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
