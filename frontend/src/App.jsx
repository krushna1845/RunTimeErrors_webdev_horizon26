import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Auth from './pages/Auth';
import OwnerDashboard from './pages/OwnerDashboard';
import OperationsDashboard from './pages/OperationsDashboard';
import WarRoom from './pages/WarRoom';
import Pricing from './pages/Pricing';
import DataSourceSettings from './pages/DataSourceSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⚡</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading OpsPulse…</div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth/*" element={<Auth />} />

      {/* Root: redirect manager → /ops, otherwise show owner dashboard */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            {user?.role === 'manager'
              ? <Navigate to="/ops" replace />
              : <OwnerDashboard />
            }
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/ops" element={
        <ProtectedRoute>
          <Layout>
            <OperationsDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/warroom" element={
        <ProtectedRoute>
          <Layout>
            <WarRoom />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/data-sources" element={
        <ProtectedRoute>
          <Layout>
            <DataSourceSettings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/pricing" element={
        <ProtectedRoute>
          <Layout>
            <Pricing />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
