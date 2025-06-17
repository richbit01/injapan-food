
import AdminLayout from '@/components/admin/AdminLayout';
import AdminReferralPanel from '@/components/admin/AdminReferralPanel';

const ReferralPanelPage = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel Referral</h1>
          <p className="text-gray-600">Kelola dan pantau aktivitas referral pengguna</p>
        </div>
        
        <AdminReferralPanel />
      </div>
    </AdminLayout>
  );
};

export default ReferralPanelPage;
