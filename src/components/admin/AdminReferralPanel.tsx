
import { useState } from 'react';
import { useAdminReferrerSummary, useAdminReferralDetails } from '@/hooks/useAdminReferralData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Users, TrendingUp, DollarSign } from 'lucide-react';
import { formatPrice } from '@/utils/cart';

const AdminReferralPanel = () => {
  const [selectedReferrer, setSelectedReferrer] = useState<string | null>(null);
  const [selectedReferrerName, setSelectedReferrerName] = useState<string>('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: referrerSummary = [], isLoading: summaryLoading } = useAdminReferrerSummary();
  const { data: referralDetails = [], isLoading: detailsLoading } = useAdminReferralDetails(selectedReferrer);

  const handleViewDetails = (referrerId: string, referrerName: string) => {
    setSelectedReferrer(referrerId);
    setSelectedReferrerName(referrerName);
    setDetailsDialogOpen(true);
  };

  const totalReferrers = referrerSummary.length;
  const totalReferrals = referrerSummary.reduce((sum, r) => sum + r.total_uses, 0);
  const totalCommissions = referrerSummary.reduce((sum, r) => sum + r.total_commission_earned, 0);

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrers}</div>
            <p className="text-xs text-muted-foreground">
              User yang aktif mereferral
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              Jumlah referral sukses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">
              Komisi yang dibayarkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referrers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Referrer</CardTitle>
        </CardHeader>
        <CardContent>
          {referrerSummary.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Belum ada data referral</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Referrer</TableHead>
                  <TableHead>Kode Referral</TableHead>
                  <TableHead className="text-center">Jumlah Referral</TableHead>
                  <TableHead className="text-right">Total Komisi</TableHead>
                  <TableHead className="text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrerSummary.map((referrer) => (
                  <TableRow key={referrer.user_id}>
                    <TableCell className="font-medium">
                      {referrer.user_name}
                    </TableCell>
                    <TableCell>
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {referrer.referral_code}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {referrer.total_uses}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(referrer.total_commission_earned)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog open={detailsDialogOpen && selectedReferrer === referrer.user_id} onOpenChange={setDetailsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(referrer.user_id, referrer.user_name || 'Unknown')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Detail Referral: {selectedReferrerName}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {detailsLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                              </div>
                            ) : referralDetails.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p>Tidak ada detail transaksi referral</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>User yang Direferal</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead className="text-right">Total Order</TableHead>
                                    <TableHead className="text-right">Komisi</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {referralDetails.map((detail) => (
                                    <TableRow key={detail.id}>
                                      <TableCell>
                                        {detail.referred_user_email || 'Guest User'}
                                      </TableCell>
                                      <TableCell className="font-mono text-sm">
                                        {detail.order_id.slice(0, 8)}...
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {formatPrice(detail.order_total)}
                                      </TableCell>
                                      <TableCell className="text-right font-medium text-green-600">
                                        {formatPrice(detail.commission_amount)}
                                      </TableCell>
                                      <TableCell className="text-sm text-gray-500">
                                        {new Date(detail.created_at).toLocaleDateString('id-ID')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReferralPanel;
