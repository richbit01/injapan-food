
import React from 'react';
import { useUserReferralCode } from '@/hooks/useUserReferralCode';
import { useReferralTransactions } from '@/hooks/useReferralTransactions';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, TrendingUp, Users, Gift, Clock, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReferralDashboard = () => {
  const { user } = useAuth();
  const { data: referralCode, isLoading: codeLoading } = useUserReferralCode();
  const { data: transactions = [], isLoading: transactionsLoading } = useReferralTransactions();

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      toast({
        title: "Berhasil!",
        description: "Kode referral telah disalin",
      });
    }
  };

  // Filter transactions by status
  const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  // Calculate totals
  const totalConfirmedCommission = confirmedTransactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);
  const totalPendingCommission = pendingTransactions.reduce((sum, t) => sum + Number(t.commission_amount), 0);

  if (codeLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!referralCode) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Tidak ada kode referral aktif.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Referral</h2>
        <p className="text-gray-600">Kelola kode referral dan pantau komisi Anda</p>
      </div>

      {/* Kode Referral Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Kode Referral Anda</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Kode Referral</p>
              <p className="text-2xl font-bold text-primary">{referralCode.code}</p>
            </div>
            <Button onClick={handleCopyCode} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Salin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penggunaan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCode.total_uses}</div>
            <p className="text-xs text-muted-foreground">
              Kali digunakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi Terkonfirmasi</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">¥{totalConfirmedCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Dari {confirmedTransactions.length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">¥{totalPendingCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu konfirmasi admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History Transaksi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Riwayat Transaksi Referral</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Belum ada transaksi referral
              </p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={
                        transaction.status === 'confirmed' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' :
                        'destructive'
                      }>
                        {transaction.status === 'confirmed' ? 'Terkonfirmasi' :
                         transaction.status === 'pending' ? 'Pending' :
                         'Dibatalkan'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Order Total: ¥{Number(transaction.order_total).toLocaleString()}
                    </p>
                    {transaction.status === 'pending' && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Menunggu konfirmasi admin
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.status === 'confirmed' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-yellow-600' :
                      'text-gray-400'
                    }`}>
                      ¥{Number(transaction.commission_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Komisi</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Informasi Penting</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Komisi akan diberikan setelah admin mengkonfirmasi pesanan</li>
                <li>• Bagikan kode referral Anda untuk mendapatkan komisi dari setiap pembelian</li>
                <li>• Persentase komisi dapat dilihat di pengaturan referral</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
