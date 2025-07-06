import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { z } from 'zod';

const demoRequestSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  company: z.string().optional(),
});

type DemoRequestData = z.infer<typeof demoRequestSchema>;

export function DemoRequestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DemoRequestData>({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = demoRequestSchema.parse(formData);

      // Here we would typically send this to a backend endpoint
      console.log('Demo request:', validatedData);

      toast.success('Solicitação enviada com sucesso! Em breve entraremos em contato.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Por favor, verifique os dados informados.');
      } else {
        toast.error('Erro ao enviar solicitação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        className="w-full"
        required
      />

      <Input
        type="email"
        placeholder="Email profissional"
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        className="w-full"
        required
      />

      <Input
        type="tel"
        placeholder="Telefone/WhatsApp"
        value={formData.phone}
        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
        className="w-full"
        required
      />

      <Input
        placeholder="Empresa (opcional)"
        value={formData.company}
        onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
        className="w-full"
      />

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Solicitar Demonstração'}
      </Button>
    </form>
  );
}
