
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const { user } = useAuth();

  const testSupabaseConnection = async () => {
    try {
      setTestResult('Testing Supabase connection...');
      
      // Test basic connection by fetching products
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(1);
      
      if (error) {
        setTestResult(`❌ Connection failed: ${error.message}`);
        return;
      }
      
      setTestResult('✅ Supabase connection successful!');
    } catch (error) {
      console.error('Supabase test error:', error);
      setTestResult(`❌ Test failed: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Test the connection to Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ User authenticated: {user.email}
            </p>
          </div>
        )}
        
        <Button onClick={testSupabaseConnection} className="w-full">
          Test Connection
        </Button>
        
        {testResult && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono">{testResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;
