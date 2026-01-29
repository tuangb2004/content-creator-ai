import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';

/**
 * ProtectedRoute - Route guard với flow chuẩn industry
 * 
 * Flow chuẩn 2024-2025:
 * - Nếu không có user → redirect về landing page
 * - Nếu user có nhưng chưa verify email (email/password only) → render Blocking Screen
 * - Nếu user đã verify → render children
 * 
 * ✅ KHÔNG signOut() - giữ session
 * ✅ Check user.emailVerified
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Only show loading on initial mount
  if (loading && !user) {
    return null;
  }

  // 1. Guard Authentication: Chưa login -> Kick ra
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Guard Authorization: Chưa verify email -> Show Blocking Modal
  const isEmailPasswordUser = user.providerData[0]?.providerId === 'password';
  if (isEmailPasswordUser && !user.emailVerified) {
    // Render the blocking modal directly
    // Using AuthModal in 'verify' mode and blocking interactions
    return (
      <AuthModal
        isOpen={true}
        onClose={() => { }} // No-op, close logic handled inside by logout/redirect if needed
        initialView="verify"
        isBlocking={true}
        onLoginSuccess={() => {
          // Once verified (detected by polling or manual check), 
          // the modal will auto close or we reload the window to clear this state
          window.location.reload();
        }}
      />
    );
  }

  // 3. Authorized -> Access Granted
  return children;
}

export default ProtectedRoute;