import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Telefone deve ter pelo menos 10 dígitos',
    }),
  hospital: z
    .string()
    .min(2, 'Hospital deve ter pelo menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  specialty: z.string().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const useProfileForm = () => {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      hospital: '',
      specialty: '',
      bio: '',
    },
  });

  // Carrega os dados do perfil quando o hook monta
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const profile = await response.json();
          form.reset({
            name: profile.nome || '',
            email: profile.email || '',
            phone: profile.phone || '',
            hospital: profile.hospital || '',
            specialty: profile.specialty || '',
            bio: profile.bio || '',
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar dados do perfil');
      }
    };

    loadProfile();
  }, [form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    try {
      await updateProfile({
        nome: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        hospital: data.hospital || undefined,
        specialty: data.specialty || undefined,
        bio: data.bio || undefined,
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    loading,
  };
};
