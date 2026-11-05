import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import api from '../../services/api';

export default function AdminProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('arabista_admin_token');
  const [verifying, setVerifying] = useState(Boolean(token));
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setVerifying(false);
      return;
    }

    // Verify current admin token with backend
    let isMounted = true;
    api
      .get('/auth/me')
      .then((res) => {
        if (isMounted) {
          setIsAuthenticated(true);
          if (res.data) {
            localStorage.setItem('arabista_admin_user', JSON.stringify(res.data));
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem('arabista_admin_token');
          localStorage.removeItem('arabista_admin_user');
          setIsAuthenticated(false);
        }
      })
      .finally(() => {
        if (isMounted) setVerifying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (verifying) {
    return <Loader fullScreen text="Verifying staff credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
