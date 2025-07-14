import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useProfileForm } from '@/hooks/use-profile-form';
import { BasicInfoFields } from '../form-fields/BasicInfoFields';
import { ProfessionalFields } from '../form-fields/ProfessionalFields';
import { Save, RotateCcw, Loader } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface ProfileFormProps {
  loading?: boolean; // Deprecated: agora usa o loading interno do hook
}

export const ProfileForm = ({ loading: externalLoading }: ProfileFormProps) => {
  const { form, onSubmit, loading } = useProfileForm();

  // Usa o loading interno do hook, mas mantém compatibilidade com o externo
  const isLoading = loading || externalLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-700">
              Nome Completo
            </Label>
            <Input
              id="name"
              {...form.register('name')}
              className="border-neutral-200 focus:border-neutral-300 focus:ring-neutral-200"
            />
            {form.errors?.name && (
              <p className="text-sm text-error-600">{form.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              className="border-neutral-200 focus:border-neutral-300 focus:ring-neutral-200"
            />
            {form.errors?.email && (
              <p className="text-sm text-error-600">{form.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-neutral-700">
              Telefone
            </Label>
            <Input
              id="phone"
              {...form.register('phone')}
              className="border-neutral-200 focus:border-neutral-300 focus:ring-neutral-200"
            />
            {form.errors?.phone && (
              <p className="text-sm text-error-600">{form.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospital" className="text-neutral-700">
              Hospital Principal
            </Label>
            <Input
              id="hospital"
              {...form.register('hospital')}
              className="border-neutral-200 focus:border-neutral-300 focus:ring-neutral-200"
            />
            {form.errors?.hospital && (
              <p className="text-sm text-error-600">{form.errors.hospital.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-neutral-700">
            Bio
          </Label>
          <Textarea
            id="bio"
            {...form.register('bio')}
            className="min-h-[100px] border-neutral-200 focus:border-neutral-300 focus:ring-neutral-200"
          />
          {form.errors?.bio && (
            <p className="text-sm text-error-600">{form.errors.bio.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-neutral-800 hover:bg-neutral-900 text-white"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
