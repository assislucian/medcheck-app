import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth/AuthContext';
import { AlertTriangle, Eye, EyeOff, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export const SecurityForm = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Deve ter pelo menos 8 caracteres');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter ao menos uma letra maiúscula');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter ao menos uma letra minúscula');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter ao menos um número');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Deve conter ao menos um caractere especial');
    }

    // Verificar sequências comuns
    const commonSequences = ['123456', 'abcdef', 'qwerty', 'password'];
    if (commonSequences.some((seq) => password.toLowerCase().includes(seq))) {
      feedback.push('Não deve conter sequências comuns');
      score = Math.max(0, score - 1);
    }

    return {
      score,
      feedback,
      isValid: score >= 4 && feedback.length === 0,
    };
  };

  const getPasswordStrengthColor = (score: number) => {
    if (score < 2) return 'text-red-600';
    if (score < 4) return 'text-orange-600';
    return 'text-green-600';
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 2) return 'Fraca';
    if (score < 4) return 'Média';
    return 'Forte';
  };

  const passwordStrength = validatePasswordStrength(formData.newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword) {
      toast.error('Senha atual é obrigatória');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('A nova senha não atende aos critérios de segurança');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('A nova senha deve ser diferente da atual');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senha: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar senha');
      }

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast.success(
        'Senha atualizada com sucesso! Faça login novamente para continuar.'
      );

      // Logout automático por segurança após mudança de senha
      setTimeout(async () => {
        await signOut();
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Segurança da Conta
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Atualize sua senha de acesso ao sistema com segurança
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Após alterar sua senha, você será deslogado
          automaticamente e precisará fazer login novamente para sua segurança.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="currentPassword">Senha Atual *</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="pr-10"
              placeholder="Digite sua senha atual"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('current')}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">Nova Senha *</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="pr-10"
              placeholder="Digite sua nova senha"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('new')}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          {formData.newPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Força da senha:</span>
                <span
                  className={`text-sm font-medium ${getPasswordStrengthColor(
                    passwordStrength.score
                  )}`}
                >
                  {getPasswordStrengthText(passwordStrength.score)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${passwordStrength.score < 2
                      ? 'bg-red-500'
                      : passwordStrength.score < 4
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="text-xs text-muted-foreground space-y-1">
                  {passwordStrength.feedback.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="pr-10"
              placeholder="Confirme sua nova senha"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('confirm')}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-600">As senhas não conferem</p>
            )}
        </div>

        <Button
          type="submit"
          disabled={
            loading ||
            !passwordStrength.isValid ||
            formData.newPassword !== formData.confirmPassword
          }
          className="w-full"
        >
          {loading ? 'Atualizando...' : 'Atualizar Senha'}
        </Button>
      </form>

      <div className="border-t pt-6">
        <h4 className="text-md font-medium mb-3">Ações da Conta</h4>
        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};
