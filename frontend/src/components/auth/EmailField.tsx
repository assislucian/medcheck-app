import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailFieldProps {
  email: string;
  setEmail: (email: string) => void;
  error?: string;
}

const EmailField = ({ email, setEmail, error }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="seu.email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={error ? 'border-destructive' : ''}
        required
        autoComplete="email"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default EmailField;
