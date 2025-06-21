import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resetDatabase } from '@/lib/supabase-reset';
import { setupDatabase } from '@/lib/supabase-setup';
import { insertSampleData } from '@/lib/supabase-data';
import { toast } from '@/hooks/use-toast';

const DatabaseSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('');

  const handleFullSetup = async () => {
    setIsLoading(true);
    try {
      setStep('Menghapus database lama...');
      await resetDatabase();
      
      setStep('Membuat database baru...');
      await setupDatabase();
      
      setStep('Menambahkan data sample...');
      await insertSampleData();
      
      setStep('Selesai!');
      toast({
        title: "Database Setup Berhasil!",
        description: "Database telah dibuat ulang dengan data sample",
      });
      
      // Redirect to home after success
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      console.error('Database setup error:', error);
      toast({
        title: "Error",
        description: "Gagal setup database: " + (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setStep('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Klik tombol di bawah untuk membuat database baru yang bersih
          </p>
          
          {step && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{step}</p>
            </div>
          )}
          
          <Button 
            onClick={handleFullSetup}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setup Database...</span>
              </div>
            ) : (
              'Setup Database Baru'
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Proses ini akan menghapus semua data yang ada dan membuat database baru dengan data sample
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSetup;
</parameter>