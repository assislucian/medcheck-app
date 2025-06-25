import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { SPECIALTIES } from '@/constants/specialties';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Telefone deve ter pelo menos 10 dígitos',
    }),
  crm: z.string(),
  specialty: z.string().refine((val) => SPECIALTIES.includes(val), {
    message: 'Selecione uma especialidade válida',
  }),
  hospital: z.string().min(2, 'Hospital deve ter pelo menos 2 caracteres'),
  bio: z.string().min(10, 'Biografia deve ter pelo menos 10 caracteres'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
  const { fetchProfile, updateProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      crm: '',
      specialty: '',
      hospital: '',
      bio: '',
    },
  });

  // Carrega os dados do perfil assim que o hook monta e popula o formulário
  // Não bloqueia a renderização inicial; o formulário mostrará skeletons enquanto carrega
  useEffect(() => {
    (async () => {
      const profile = await fetchProfile();
      if (profile) {
        form.reset({
          name: profile.name ?? '',
          email: profile.email ?? '',
          phone: (profile as any).phone ?? '',
          crm: profile.crm ?? '',
          specialty: profile.specialty ?? '',
          hospital: (profile as any).hospital ?? '',
          bio: (profile as any).bio ?? '',
        });
      }
    })();
  }, [fetchProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        crm: data.crm,
        specialty: data.specialty,
        hospital: data.hospital,
        bio: data.bio,
      });
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  return {
    form,
    onSubmit,
  };
};
