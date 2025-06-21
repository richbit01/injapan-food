import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SupabaseTest = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Status</CardTitle>
        <CardDescription>
          Database telah dihapus - menggunakan data lokal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Aplikasi berjalan dengan data lokal
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;