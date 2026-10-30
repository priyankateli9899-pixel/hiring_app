import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Wraps a route and enforces:
 *   1. User must be authenticated.
 *   2. User's role must match one of the allowed roles (if provided).
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/' }) {
  const { user } = useAuth();

  if (!user) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
