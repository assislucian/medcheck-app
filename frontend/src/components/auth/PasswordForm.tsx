import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

interface PasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
}

const PasswordForm = ({ onSubmit, isLoading }: PasswordFormProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>(
    {}
  );

  const validateForm = () => {
    try {
      passwordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'password') newErrors.password = err.message;
          if (err.path[0] === 'confirmPassword')
            newErrors.confirmPassword = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Nova senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
            required
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
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            <span className="sr-only">
              {showConfirmPassword ? 'Esconder senha' : 'Mostrar senha'}
            </span>
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
      </Button>
    </form>
  );
};

export default PasswordForm;
