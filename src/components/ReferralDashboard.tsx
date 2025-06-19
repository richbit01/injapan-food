
import { useUserReferralCode, useReferralTransactions } from '@/hooks/useReferralCodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gift, Users, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const ReferralDashboard = () => {
  const { data: referralCode, isLoading: codeLoading } = useUserReferralCode();
  const { data: transactions = [], isLoading: transactionsLoading } = useReferralTransactions();

  if (codeLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const confirmedTransactions = transactions.filter(t => t.status === 'confirmed');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalConfirmedCommission = confirmedTransactions.reduce((sum, t) => sum + t.commission_amount, 0);
  const totalPendingCommission = pendingTransactions.reduce((sum, t) => sum + t.commission_amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kode Referral</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralCode?.code || 'Belum ada'}
            </div>
            <p className="text-xs text-muted-foreground">
              Kode unik Anda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penggunaan</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referralCode?.total_uses || 0}
            </div>
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
            <div className="text-2xl font-bold text-green-600">
              ¥{totalConfirmedCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Sudah dikonfirmasi admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Komisi Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ¥{totalPendingCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Menunggu konfirmasi admin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi Referral</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Transaksi
              </h3>
              <p className="text-gray-600">
                Bagikan kode referral Anda untuk mulai mendapatkan komisi!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      transaction.status === 'confirmed' ? 'bg-green-100' :
                      transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      {transaction.status === 'confirmed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : transaction.status === 'pending' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Order #{transaction.order_id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">¥{transaction.commission_amount.toLocaleString()}</p>
                    <Badge variant={
                      transaction.status === 'confirmed' ? 'default' :
                      transaction.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {transaction.status === 'confirmed' ? 'Terkonfirmasi' :
                       transaction.status === 'pending' ? 'Pending' : 'Dibatalkan'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingTransactions.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              <Clock className="w-5 h-5 mr-2 inline" />
              Komisi Menunggu Konfirmasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 text-sm">
              Anda memiliki {pendingTransactions.length} transaksi dengan total komisi ¥{totalPendingCommission.toLocaleString()} 
              yang sedang menunggu konfirmasi dari admin. Komisi akan masuk setelah admin mengkonfirmasi pesanan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralDashboard;
