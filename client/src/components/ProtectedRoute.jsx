import { useEffect, useRef } from 'react';
import { notify } from '../services/notifications';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only lets in logged-in users who have the required role
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  const alerted = useRef(false);

  useEffect(() => {
    if (user && user.role !== role && !alerted.current) { alerted.current = true; notify('You are not authorized to perform this action.', 'warning'); }
  }, [user, role]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <div className="mx-auto mt-24 max-w-md text-center">
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="mt-2 text-slate-600">This page is only for {role}s.</p>
        <Link to={`/${user.role}`} className="btn-primary mt-6">
          Go to my dashboard
        </Link>
      </div>
    );
  }
  return children;
}
