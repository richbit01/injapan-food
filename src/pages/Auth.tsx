import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Auth = () => {
  const { user } = useAuth();
  
  // Redirect to home page if user is logged in
  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);
  
  // Only show auth form if no user
  return <AuthForm />;
};

export default Auth;