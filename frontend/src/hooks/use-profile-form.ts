import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useProfile } from '@/hooks/use-profile';
import { toast } from 'sonner';
import { useEffect } from 'react';

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
  hospital: z.string().min(2, 'Hospital deve ter pelo menos 2 caracteres'),
  specialty: z.string().optional(),
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
      hospital: '',
      specialty: '',
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
          name: profile.nome || '',
          email: profile.email || '',
          phone: profile.phone || '',
          crm: profile.crm || '',
          hospital: profile.hospital || '',
          specialty: profile.specialty || '',
          bio: profile.bio || '',
        });
      }
    })();
  }, [fetchProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile({
        nome: data.name,
        email: data.email,
        phone: data.phone,
        crm: data.crm,
        hospital: data.hospital,
        specialty: data.specialty,
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
