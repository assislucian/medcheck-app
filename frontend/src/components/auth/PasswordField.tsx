import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  error?: string;
}

const PasswordField = ({ password, setPassword, error }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="password">Senha</Label>
        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
          Esqueceu a senha?
        </Link>
      </div>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`pr-10 ${error ? 'border-destructive' : ''}`}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          <span className="sr-only">
            {showPassword ? 'Esconder senha' : 'Mostrar senha'}
          </span>
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default PasswordField;
