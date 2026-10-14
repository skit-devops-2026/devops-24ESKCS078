import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Only lets logged-in users see the pages inside it. Others go to /login.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p className="center-text">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
