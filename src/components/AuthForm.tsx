
import { useState } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useFirebaseAuth();
  const { toast } = useToast();

  const getFirebaseErrorMessage = (error: any) => {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    // Handle Firebase Auth specific errors
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali data Anda.';
      
      case 'auth/invalid-email':
        return 'Format email tidak valid. Silakan masukkan alamat email yang benar.';
      
      case 'auth/user-disabled':
        return 'Akun Anda telah dinonaktifkan. Silakan hubungi customer service kami untuk bantuan.';
      
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.';
      
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah. Silakan periksa koneksi Anda dan coba lagi.';
      
      case 'auth/email-already-in-use':
        return 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk dengan akun yang sudah ada.';
      
      case 'auth/weak-password':
        return 'Password terlalu lemah. Gunakan minimal 6 karakter dengan kombinasi huruf dan angka.';
      
      case 'auth/operation-not-allowed':
        return 'Metode login ini sedang tidak tersedia. Silakan hubungi customer service kami.';
      
      default:
        // Handle other common error messages
        if (errorMessage.includes('Invalid login credentials')) {
          return 'Email atau password yang Anda masukkan salah. Silakan periksa kembali data Anda.';
        } else if (errorMessage.includes('email_address_invalid')) {
          return 'Format email tidak valid. Silakan masukkan alamat email yang benar.';
        } else if (errorMessage.includes('Email address')) {
          return 'Alamat email tidak valid atau tidak terdaftar dalam sistem kami.';
        }
        
        return 'Terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi customer service kami jika masalah berlanjut.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      const { error } = await signIn(email, password);
      if (error) {
        console.error('Sign in error:', error);
        const errorMessage = getFirebaseErrorMessage(error);
        
        toast({
          title: "Login Gagal",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang! Anda berhasil masuk ke akun Anda.",
        });
        // Redirect will be handled by the auth state change
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign in catch error:', error);
      toast({
        title: "Login Gagal",
        description: "Terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi customer service kami.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign up with email:', email);
      const { error } = await signUp(email, password, fullName);
      if (error) {
        console.error('Sign up error:', error);
        const errorMessage = getFirebaseErrorMessage(error);
        
        toast({
          title: "Pendaftaran Gagal",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pendaftaran Berhasil",
          description: "Akun Anda berhasil dibuat! Selamat datang di Injapan Food.",
        });
        // Clear form and switch to sign in tab
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (error) {
      console.error('Sign up catch error:', error);
      toast({
        title: "Pendaftaran Gagal",
        description: "Terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi customer service kami.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-lg overflow-hidden mx-auto mb-4">
            <img 
              src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
              alt="Injapan Food Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Injapan Food</h2>
          <p className="mt-2 text-sm text-gray-600">Makanan Indonesia di Jepang</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Masuk</TabsTrigger>
            <TabsTrigger value="signup">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Masuk ke Akun</CardTitle>
                <CardDescription>
                  Masukkan email dan password untuk masuk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Buat Akun Baru</CardTitle>
                <CardDescription>
                  Daftar untuk mulai berbelanja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Nama Lengkap</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password (min. 6 karakter)"
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthForm;
