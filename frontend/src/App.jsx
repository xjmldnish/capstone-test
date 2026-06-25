import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OAuthSuccessPage from './pages/OAuthSuccessPage.jsx';
import HomePage from './pages/HomePage.jsx';
import VoucherDetailsPage from './pages/VoucherDetailsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminVouchersPage from './pages/AdminVouchersPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import RedemptionHistoryPage from './pages/RedemptionHistoryPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth-success" element={<OAuthSuccessPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/vouchers/:id" element={<VoucherDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/redemption-history" element={<RedemptionHistoryPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
