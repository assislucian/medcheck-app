import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useProfileForm } from '@/hooks/use-profile-form';
import { BasicInfoFields } from '../form-fields/BasicInfoFields';
import { ProfessionalFields } from '../form-fields/ProfessionalFields';
import { Save, RotateCcw } from 'lucide-react';

export interface ProfileFormProps {
  loading?: boolean; // Deprecated: agora usa o loading interno do hook
}

export const ProfileForm = ({ loading: externalLoading }: ProfileFormProps) => {
  const { form, onSubmit, loading } = useProfileForm();

  // Usa o loading interno do hook, mas mantém compatibilidade com o externo
  const isLoading = loading || externalLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoFields form={form} />
        <ProfessionalFields form={form} />

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
