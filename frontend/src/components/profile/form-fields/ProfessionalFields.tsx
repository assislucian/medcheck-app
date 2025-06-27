import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ProfileFormValues } from '@/hooks/use-profile-form';
import { Building2, Award } from 'lucide-react';

interface ProfessionalFieldsProps {
  form: UseFormReturn<ProfileFormValues>;
}

export const ProfessionalFields = ({ form }: ProfessionalFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Informações Profissionais
        </h3>
        <p className="text-sm text-muted-foreground">
          Atualize suas informações de trabalho e especialidade
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Especialidade Médica
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Cardiologia, Neurologia, Pediatria..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hospital"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hospital/Clínica Principal
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nome do hospital ou clínica onde trabalha"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p>
          <strong>Dica:</strong> Mantenha suas informações profissionais atualizadas
          para facilitar a identificação em relatórios e análises.
        </p>
      </div>
    </div>
  );
};
