import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'organizer' | 'attendee'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    openAuthModal('login');
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-white border border-brand-beige text-center space-y-4 shadow-brand">
        <h3 className="font-display font-bold text-xl text-brand-ink">Access Restricted</h3>
        <p className="text-xs text-brand-ink-muted">
          Your account role (<strong className="capitalize">{user.role}</strong>) does not have permission to view this page. Required role: {allowedRoles.join(' or ')}.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
