
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useValidateReferralCode } from '@/hooks/useReferralCodes';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ReferralCodeInputProps {
  value?: string;
  onChange: (code: string) => void;
  onValidation?: (isValid: boolean, code?: string) => void;
}

const ReferralCodeInput = ({ value = '', onChange, onValidation }: ReferralCodeInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validatedCode, setValidatedCode] = useState<string | null>(null);
  
  const validateCode = useValidateReferralCode();
  const { toast } = useToast();

  const handleInputChange = (newValue: string) => {
    const cleanValue = newValue.trim().toUpperCase();
    setInputValue(cleanValue);
    onChange(cleanValue);
    
    // Reset validation when input changes
    if (validationStatus !== 'idle') {
      setValidationStatus('idle');
      setValidatedCode(null);
      onValidation?.(false);
    }
  };

  const handleValidate = async () => {
    if (!inputValue || inputValue.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'Masukkan kode referral terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    setValidationStatus('validating');
    console.log('🔍 Validating referral code:', inputValue);

    try {
      const result = await validateCode.mutateAsync(inputValue);
      
      if (result) {
        console.log('✅ Referral code is valid:', result);
        setValidationStatus('valid');
        setValidatedCode(result.code);
        onValidation?.(true, result.code);
        toast({
          title: 'Kode Valid!',
          description: `Kode referral ${result.code} berhasil divalidasi`,
        });
      } else {
        console.log('❌ Referral code is invalid');
        setValidationStatus('invalid');
        setValidatedCode(null);
        onValidation?.(false);
        toast({
          title: 'Kode Tidak Valid',
          description: 'Kode referral tidak ditemukan atau tidak aktif',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Error validating referral code:', error);
      setValidationStatus('invalid');
      setValidatedCode(null);
      onValidation?.(false);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memvalidasi kode referral',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="referralCode">Kode Referral (Opsional)</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="referralCode"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Masukkan kode referral..."
            className={`pr-8 ${
              validationStatus === 'valid' ? 'border-green-500' :
              validationStatus === 'invalid' ? 'border-red-500' : ''
            }`}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        <Button 
          type="button"
          variant="outline" 
          onClick={handleValidate}
          disabled={!inputValue || validationStatus === 'validating'}
        >
          {validationStatus === 'validating' ? 'Validasi...' : 'Validasi'}
        </Button>
      </div>

      {validationStatus === 'valid' && validatedCode && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Kode referral <strong>{validatedCode}</strong> valid! Anda akan mendapat potongan atau benefit saat checkout.
          </AlertDescription>
        </Alert>
      )}

      {validationStatus === 'invalid' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Kode referral tidak valid atau sudah tidak aktif. Pastikan kode yang dimasukkan benar.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-gray-600">
        Masukkan kode referral dari teman untuk mendapat benefit khusus
      </p>
    </div>
  );
};

export default ReferralCodeInput;
