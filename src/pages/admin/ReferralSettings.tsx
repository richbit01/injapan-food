
import AdminLayout from '@/components/admin/AdminLayout';
import ReferralSettings from '@/components/admin/ReferralSettings';

const ReferralSettingsPage = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Referral</h1>
          <p className="text-gray-600">Kelola komisi referral dan lihat riwayat perubahan</p>
        </div>
        
        <ReferralSettings />
      </div>
    </AdminLayout>
  );
};

export default ReferralSettingsPage;
