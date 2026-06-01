import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardPage from './routes/DashboardPage';
import DocumentsPage from './routes/DocumentsPage';
import CustomersPage from './routes/CustomersPage';
import SuppliersPage from './routes/SuppliersPage';
import InventoryPage from './routes/InventoryPage';
import LoansPage from './routes/LoansPage';
import AuditLogsPage from './routes/AuditLogsPage';
import ApprovalsPage from './routes/ApprovalsPage';
import AuthPage from './routes/AuthPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { getToken, removeToken, setToken } from './lib/auth';
import type { UserProfile } from './types';
import { api } from './lib/api';

function PrivateRoute({ children }: { children: JSX.Element }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }
    api.get('/auth/me').then((response) => setUser(response.data)).catch(() => {
      removeToken();
      navigate('/login');
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="lg:flex lg:min-h-screen">
        {user && <Sidebar user={user} />}
        <main className="flex-1 p-6 lg:p-8">
          {user && <Header user={user} onLogout={() => { removeToken(); setUser(null); navigate('/login'); }} />}
          <Routes>
            <Route path="/login" element={<AuthPage onLogin={(profile, token) => { setToken(token); setUser(profile); navigate('/'); }} />} />
            <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
            <Route path="/customers" element={<PrivateRoute><CustomersPage /></PrivateRoute>} />
            <Route path="/suppliers" element={<PrivateRoute><SuppliersPage /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
            <Route path="/loans" element={<PrivateRoute><LoansPage /></PrivateRoute>} />
            <Route path="/approvals" element={<PrivateRoute><ApprovalsPage /></PrivateRoute>} />
            <Route path="/audit" element={<PrivateRoute><AuditLogsPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
