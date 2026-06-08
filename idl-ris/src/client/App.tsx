import { useNavigate } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardPage from './routes/DashboardPage';
import DocumentsPage from './routes/DocumentsPage';
import CustomersPage from './routes/CustomersPage';
import SuppliersPage from './routes/SuppliersPage';
import InventoryPage from './routes/InventoryPage';
import LoansPage from './routes/LoansPage';
import AuditLogsPage from './routes/AuditLogsPage';
import ApprovalsPage from './routes/ApprovalsPage';
import GeneralLedgerPage from './routes/GeneralLedgerPage';
import ProfitLossPage from './routes/ProfitLossPage';
import BalanceSheetPage from './routes/BalanceSheetPage';
import AuthPage from './routes/AuthPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';

function App() {
  const BYPASS_AUTH = true;
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading && !BYPASS_AUTH) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-600"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !BYPASS_AUTH) {
    return (
      <AuthPage
        onLogin={async (profile, token) => {
          navigate('/');
        }}
      />
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <MobileNav user={user!} />
      <div className="lg:flex lg:min-h-screen">
        <Sidebar user={user!} />
        <main className="flex-1 p-4 pt-20 lg:pt-0 lg:p-8">
          <Header user={user!} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/audit" element={<AuditLogsPage />} />
            <Route path="/general-ledger" element={<GeneralLedgerPage />} />
            <Route path="/profit-loss" element={<ProfitLossPage />} />
            <Route path="/balance-sheet" element={<BalanceSheetPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
