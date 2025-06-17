
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        console.log('Checking admin status for Firebase user:', user.uid);
        
        // Check admin status using firebase_uid
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('firebase_uid', user.uid)
          .single();
        
        if (error) {
          console.error('Error checking admin status:', error);
        } else {
          console.log('Admin check result:', data);
          setIsAdmin(data?.role === 'admin');
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No Firebase user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
