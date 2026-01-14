import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

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

  const isEmailPasswordUser = user.providerData[0]?.providerId === 'password';
  if (isEmailPasswordUser && !user.emailVerified) {
    signOut(auth);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;