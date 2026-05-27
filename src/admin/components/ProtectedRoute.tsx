import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c0f] flex items-center justify-center">
        <div className="text-[#bc993c] font-mono text-sm tracking-widest animate-pulse">
          AUTHENTICATING...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.requirePasswordChange && location.pathname !== '/admin/account/change-password') {
    return <Navigate to="/admin/account/change-password" replace />;
  }

  return <>{children}</>;
}
