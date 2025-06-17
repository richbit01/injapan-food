
import AuthForm from '@/components/AuthForm';
import SupabaseTest from '@/components/SupabaseTest';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

const Auth = () => {
  const { user } = useFirebaseAuth();
  
  // Show test component if user is logged in
  if (user) {
    return <SupabaseTest />;
  }
  
  return <AuthForm />;
};

export default Auth;
