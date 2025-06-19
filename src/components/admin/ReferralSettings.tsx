
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useReferralCommissionRate, useUpdateAppSetting, useSettingsHistory } from '@/hooks/useAppSettings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, Save, History } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQueryClient } from '@tanstack/react-query';

const ReferralSettings = () => {
  const { data: currentRate, isLoading } = useReferralCommissionRate();
  const { data: history = [] } = useSettingsHistory('referral_commission_rate');
  const updateSetting = useUpdateAppSetting();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newRate, setNewRate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (currentRate !== undefined) {
      setNewRate(currentRate.toString());
    }
  }, [currentRate]);

  const handleSave = async () => {
    const rate = parseFloat(newRate);
    
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast({
        title: 'Error',
        description: 'Masukkan persentase yang valid (0-100)',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateSetting.mutateAsync({
        settingId: 'referral_commission_rate',
        newValue: { rate },
        notes: notes || undefined
      });

      // Invalidate related queries to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['app-setting', 'referral_commission_rate'] });
      await queryClient.invalidateQueries({ queryKey: ['settings-history', 'referral_commission_rate'] });

      toast({
        title: 'Berhasil',
        description: 'Komisi referral berhasil diperbarui',
      });
      
      setNotes('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memperbarui komisi referral',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Pengaturan Komisi Referral</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Komisi akan berlaku untuk semua transaksi referral ke depan. 
              Perubahan tidak mempengaruhi transaksi yang sudah ada.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentRate">Komisi Saat Ini</Label>
                <div className="text-2xl font-bold text-primary">
                  {currentRate}%
                </div>
              </div>

              <div>
                <Label htmlFor="newRate">Persentase Komisi Referral Baru (%)</Label>
                <Input
                  id="newRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="Masukkan persentase (contoh: 3)"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Masukkan nilai antara 0-100 (contoh: 3 untuk 3%)
                </p>
              </div>

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alasan perubahan komisi..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSave}
                disabled={updateSetting.isPending || newRate === currentRate?.toString()}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSetting.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Contoh Perhitungan</h4>
                <div className="space-y-2 text-sm">
                  <div>Total Pembelian: ¥10,000</div>
                  <div>Komisi ({newRate || currentRate}%): ¥{((parseFloat(newRate) || currentRate || 0) * 10000 / 100).toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Formula Perhitungan</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  komisi = totalPembelian * ({newRate || currentRate}% / 100)
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowHistory(!showHistory)}
          >
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5" />
              <span>Riwayat Perubahan</span>
            </div>
            <Button variant="ghost" size="sm">
              {showHistory ? 'Sembunyikan' : 'Tampilkan'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {history.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                Belum ada riwayat perubahan
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nilai Lama</TableHead>
                    <TableHead>Nilai Baru</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.changed_at)}</TableCell>
                      <TableCell>
                        {record.old_value?.rate ? `${record.old_value.rate}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {record.new_value?.rate}%
                      </TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ReferralSettings;
