import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserReferralCode, useCreateReferralCode, useReferralTransactions } from '@/hooks/useReferralCodes';
import { Copy, Share2, DollarSign, Users, TrendingUp } from 'lucide-react';

const ReferralDashboard = () => {
  const { data: referralCode, isLoading } = useUserReferralCode();
  const { data: transactions = [] } = useReferralTransactions();
  const createCode = useCreateReferralCode();
  const { toast } = useToast();

  // Use production domain instead of current location
  const baseUrl = 'https://injapanfood.com'; // Change this to your actual domain
  
  const [shareUrl, setShareUrl] = useState('');

  const handleCreateCode = async () => {
    try {
      await createCode.mutateAsync();
      toast({
        title: 'Berhasil!',
        description: 'Kode referral telah dibuat',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuat kode referral',
        variant: 'destructive',
      });
    }
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode.code);
      toast({
        title: 'Berhasil!',
        description: 'Kode referral telah disalin',
      });
    }
  };

  const handleCopyLink = () => {
    if (referralCode) {
      const url = `${baseUrl}?ref=${referralCode.code}`;
      navigator.clipboard.writeText(url);
      toast({
        title: 'Berhasil!',
        description: 'Link referral telah disalin',
      });
    }
  };

  const totalCommission = transactions.reduce((sum, t) => sum + t.commission_amount, 0);
  const pendingCommission = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.commission_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold">¥{totalCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Komisi Pending</p>
                <p className="text-2xl font-bold">¥{pendingCommission.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Referral</p>
                <p className="text-2xl font-bold">{referralCode?.total_uses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kode Referral Anda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!referralCode ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Anda belum memiliki kode referral</p>
              <Button onClick={handleCreateCode} disabled={createCode.isPending}>
                {createCode.isPending ? 'Membuat...' : 'Buat Kode Referral'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Kode Referral</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={referralCode.code} readOnly />
                  <Button variant="outline" size="sm" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Link Referral</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input 
                    value={`${baseUrl}?ref=${referralCode.code}`} 
                    readOnly 
                  />
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Cara Menggunakan:</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Bagikan kode atau link referral kepada teman</li>
                  <li>2. Ketika mereka berbelanja menggunakan kode Anda</li>
                  <li>3. Anda akan mendapat komisi otomatis</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Komisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{transaction.order_id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">¥{transaction.commission_amount.toLocaleString()}</p>
                    <Badge variant={
                      transaction.status === 'paid' ? 'default' : 
                      transaction.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralDashboard;
