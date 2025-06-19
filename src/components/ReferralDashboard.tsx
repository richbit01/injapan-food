
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useUserReferralCode } from '@/hooks/useUserReferralCode';
import { useReferralTransactions } from '@/hooks/useReferralTransactions';
import { useCreateReferralCode } from '@/hooks/useCreateReferralCode';
import { useToast } from '@/hooks/use-toast';

const ReferralDashboard = () => {
  const { data: referralCode, isLoading: codeLoading } = useUserReferralCode();
  const { data: transactions = [], isLoading: transactionsLoading } = useReferralTransactions();
  const createReferralCode = useCreateReferralCode();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate pending vs confirmed stats
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
  const cancelledTransactions = transactions.filter(t => t.status === 'cancelled');

  const pendingCommission = pendingTransactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);
  const confirmedCommission = confirmedTransactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      await createReferralCode.mutateAsync();
      toast({
        title: 'Kode Referral Berhasil Dibuat',
        description: 'Kode referral Anda telah berhasil dibuat dan siap digunakan',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Membuat Kode Referral',
        description: error.message || 'Terjadi kesalahan saat membuat kode referral',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast({
        title: 'Kode Berhasil Disalin',
        description: 'Kode referral telah disalin ke clipboard',
      });
    }
  };

  const handleCopyLink = () => {
    if (referralCode?.code) {
      const link = `${window.location.origin}?ref=${referralCode.code}`;
      navigator.clipboard.writeText(link);
      toast({
        title: 'Link Berhasil Disalin',
        description: 'Link referral telah disalin ke clipboard',
      });
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (codeLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Referral
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCode?.total_uses || 0}</div>
            <p className="text-xs text-gray-500">Kode digunakan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Komisi Pending
            </CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatPrice(pendingCommission)}
            </div>
            <p className="text-xs text-gray-500">
              {pendingTransactions.length} transaksi menunggu konfirmasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Komisi Terkonfirmasi
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(confirmedCommission)}
            </div>
            <p className="text-xs text-gray-500">
              {confirmedTransactions.length} transaksi dikonfirmasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Komisi
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatPrice(referralCode?.total_commission_earned || 0)}
            </div>
            <p className="text-xs text-gray-500">Komisi yang sudah diterima</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Kode Referral Anda</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Referral
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={referralCode.code}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={handleCopyCode} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Referral
                </label>
                <div className="flex space-x-2">
                  <Input
                    value={`${window.location.origin}?ref=${referralCode.code}`}
                    readOnly
                    className="text-sm"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Cara Menggunakan Kode Referral:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Bagikan kode atau link referral kepada teman/keluarga</li>
                  <li>Mereka memasukkan kode saat checkout</li>
                  <li>Admin akan mengkonfirmasi pesanan setelah pembayaran</li>
                  <li>Komisi Anda akan masuk setelah konfirmasi admin</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Kode Referral</h3>
              <p className="text-gray-600 mb-4">
                Buat kode referral untuk mulai mendapatkan komisi
              </p>
              <Button 
                onClick={handleGenerateCode}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Membuat Kode...</span>
                  </div>
                ) : (
                  'Buat Kode Referral'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi Referral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">Order #{transaction.order_id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </div>
                    <div className="text-sm">
                      Total Pesanan: {formatPrice(Number(transaction.order_total))}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg">
                      {formatPrice(Number(transaction.commission_amount))}
                    </div>
                    <Badge 
                      className={
                        transaction.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {transaction.status === 'confirmed' 
                        ? 'Terkonfirmasi' 
                        : transaction.status === 'pending'
                        ? 'Menunggu Konfirmasi'
                        : 'Dibatalkan'
                      }
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
