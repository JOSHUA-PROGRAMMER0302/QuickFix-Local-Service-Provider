import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps a route component and enforces authentication + optional role check.
 *
 * Props:
 *   children   — The component to render if access is granted
 *   requiredRole — 'admin' | 'user' | undefined (any authenticated user)
 *
 * Behavior:
 *   - Not logged in → /login
 *   - Wrong role (admin visiting user-only or vice-versa) → their dashboard
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/directory'} replace />;
  }

  return children;
};

export default ProtectedRoute;
