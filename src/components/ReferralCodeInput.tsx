
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useValidateReferralCode } from '@/hooks/useReferralCodes';
import { useAuth } from '@/hooks/useAuth';
import { Check, X } from 'lucide-react';

interface ReferralCodeInputProps {
  onReferralCodeChange: (code: string | null) => void;
  initialCode?: string;
}

const ReferralCodeInput = ({ onReferralCodeChange, initialCode }: ReferralCodeInputProps) => {
  const [code, setCode] = useState(initialCode || '');
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const validateCode = useValidateReferralCode();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Check for referral code in URL on component mount
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && !initialCode) {
      console.log('Found referral code in URL:', refCode);
      setCode(refCode);
      handleValidateCode(refCode);
    }
  }, []);

  const handleValidateCode = async (codeToValidate = code) => {
    if (!codeToValidate.trim()) {
      setIsValid(false);
      setValidatedCode(null);
      onReferralCodeChange(null);
      return;
    }

    console.log('Validating referral code:', codeToValidate);

    try {
      const result = await validateCode.mutateAsync(codeToValidate);
      if (result) {
        // Check if user is trying to use their own referral code
        if (user && result.user_id === user.id) {
          setIsValid(false);
          setValidatedCode(null);
          onReferralCodeChange(null);
          toast({
            title: 'Kode Tidak Valid',
            description: 'Anda tidak dapat menggunakan kode referral sendiri',
            variant: 'destructive',
          });
          return;
        }

        setIsValid(true);
        setValidatedCode(codeToValidate.trim().toUpperCase());
        onReferralCodeChange(codeToValidate.trim().toUpperCase());
        toast({
          title: 'Kode Referral Valid!',
          description: 'Anda akan mendapat manfaat dari referral ini',
        });
      } else {
        setIsValid(false);
        setValidatedCode(null);
        onReferralCodeChange(null);
        toast({
          title: 'Kode Tidak Valid',
          description: 'Kode referral tidak ditemukan atau tidak aktif',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setIsValid(false);
      setValidatedCode(null);
      onReferralCodeChange(null);
      toast({
        title: 'Error',
        description: 'Gagal memvalidasi kode referral',
        variant: 'destructive',
      });
    }
  };

  const handleClearCode = () => {
    setCode('');
    setIsValid(false);
    setValidatedCode(null);
    onReferralCodeChange(null);
    console.log('Referral code cleared');
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kode Referral (Opsional)
        </label>
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode referral..."
              disabled={validateCode.isPending}
              className={isValid ? 'border-green-500' : ''}
            />
            {isValid && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={() => handleValidateCode()}
            disabled={validateCode.isPending || !code.trim()}
          >
            {validateCode.isPending ? 'Validasi...' : 'Validasi'}
          </Button>
        </div>
      </div>

      {validatedCode && isValid && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Kode Valid
            </Badge>
            <span className="text-sm font-medium">{validatedCode}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClearCode}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {code && !isValid && !validateCode.isPending && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <X className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">Kode referral tidak valid</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralCodeInput;
