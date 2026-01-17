import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VerifyEmailBlockingScreen from '../Auth/VerifyEmailBlockingScreen';

/**
 * ProtectedRoute - Route guard với flow chuẩn industry
 * 
 * Flow:
 * - Nếu không có user → redirect về landing page
 * - Nếu user chưa verify email (email/password only) → show blocking screen
 * - Nếu user đã verify → render children
 * 
 * ❌ KHÔNG signOut() - chỉ block quyền
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Only show loading on initial mount (first time), not on every navigation
  // After first load, user state is cached, so loading should be false quickly
  if (loading && !user) {
    // Show minimal loading - just a blank screen for a moment
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check email verification (only for email/password users, not social login)
  const isEmailPasswordUser = user.providerData[0]?.providerId === 'password';
  if (isEmailPasswordUser && !user.emailVerified) {
    // Flow chuẩn: Show blocking screen, KHÔNG signOut
    return <VerifyEmailBlockingScreen />;
  }

  return children;
}

export default ProtectedRoute;