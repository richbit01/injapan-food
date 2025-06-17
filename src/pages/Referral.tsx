
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ReferralDashboard from '@/components/ReferralDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Referral = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">affiliate</h1>
          <p className="text-gray-600 mt-2">
            Kelola kode referral Anda dan lacak komisi yang diperoleh
          </p>
        </div>
        
        <ReferralDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Referral;
