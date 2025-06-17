
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const { user } = useFirebaseAuth();
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count');
      if (error) {
        setConnectionStatus('Connection failed');
        setError(error.message);
        console.error('Connection test failed:', error);
        return;
      }
      
      setConnectionStatus('Connected successfully');
      console.log('Supabase connection successful');
      
      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(profilesError.message);
      } else {
        setProfiles(allProfiles || []);
        console.log('All profiles:', allProfiles);
      }
      
      // Get current user profile if user exists
      if (user) {
        console.log('Current Firebase user:', user.uid);
        
        const { data: userProfile, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('firebase_uid', user.uid)
          .maybeSingle();
        
        if (userError) {
          console.error('Error fetching user profile:', userError);
          setError(userError.message);
        } else {
          setCurrentUserProfile(userProfile);
          console.log('Current user profile:', userProfile);
        }
      }
      
    } catch (err: any) {
      setConnectionStatus('Connection error');
      setError(err.message);
      console.error('Test error:', err);
    }
  };

  useEffect(() => {
    testConnection();
  }, [user]);

  const createProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          firebase_uid: user.uid,
          full_name: user.displayName || 'Test User',
          role: 'admin'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        setError(error.message);
      } else {
        console.log('Profile created:', data);
        setCurrentUserProfile(data);
        await testConnection(); // Refresh data
      }
    } catch (err: any) {
      console.error('Create profile error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Status:</strong> {connectionStatus}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
          </div>
          
          <Button onClick={testConnection}>Refresh Test</Button>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Current Firebase User</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Display Name:</strong> {user.displayName || 'None'}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current User Profile in Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUserProfile ? (
            <div>
              <p><strong>ID:</strong> {currentUserProfile.id}</p>
              <p><strong>Firebase UID:</strong> {currentUserProfile.firebase_uid}</p>
              <p><strong>Full Name:</strong> {currentUserProfile.full_name}</p>
              <p><strong>Role:</strong> {currentUserProfile.role}</p>
              <p><strong>Created:</strong> {currentUserProfile.created_at}</p>
            </div>
          ) : (
            <div>
              <p>No profile found for current user</p>
              {user && (
                <Button onClick={createProfile} className="mt-2">
                  Create Admin Profile
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Profiles ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length > 0 ? (
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div key={profile.id} className="border p-2 rounded">
                  <p><strong>Firebase UID:</strong> {profile.firebase_uid}</p>
                  <p><strong>Name:</strong> {profile.full_name}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No profiles found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseTest;
