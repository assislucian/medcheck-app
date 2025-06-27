import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from '@/hooks/use-profile-form';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface BasicInfoFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Informações Básicas</h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações pessoais básicas
        </p>
      </div>

      {/* Informações não editáveis - apenas exibição */}
      <div className="grid gap-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Informações Protegidas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">CRM</label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {user?.crm || 'Não informado'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Não editável por segurança
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">UF</label>
            <div className="mt-1">
              <Badge variant="outline" className="text-sm">
                {user?.uf || 'Não informado'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Não editável por segurança
            </p>
          </div>
        </div>
      </div>

      {/* Campos editáveis */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Digite seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte um pouco sobre você, sua experiência e especialidades..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
