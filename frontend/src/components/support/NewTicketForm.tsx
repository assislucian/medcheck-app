import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { TicketCategory, TicketPriority } from './types';

interface NewTicketFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
  }) => Promise<void>;
  submitting: boolean;
}

/**
 * NewTicketForm Component
 *
 * Form for creating a new support ticket with title, description,
 * category, and priority fields.
 *
 * @param onSubmit - Function to handle form submission
 * @param submitting - Whether the form is currently submitting
 */
export const NewTicketForm = ({ onSubmit, submitting }: NewTicketFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical' as TicketCategory,
    priority: 'media' as TicketPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);

    // Only reset form if not using the submitting state to track submission
    if (!submitting) {
      setFormData({
        title: '',
        description: '',
        category: 'technical',
        priority: 'media',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar novo ticket de suporte</CardTitle>
        <CardDescription>
          Preencha as informações abaixo para abrir um novo chamado com nossa equipe de
          suporte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Resumo do problema ou solicitação"
              required
              disabled={submitting}
              aria-describedby="title-description"
            />
            <p id="title-description" className="text-xs text-muted-foreground">
              Forneça um título breve e descritivo para o seu problema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: TicketCategory) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Problema Técnico</SelectItem>
                  <SelectItem value="billing">Faturamento</SelectItem>
                  <SelectItem value="feature">Solicitação de Funcionalidade</SelectItem>
                  <SelectItem value="question">Dúvida Geral</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TicketPriority) =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={submitting}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descreva detalhadamente o problema ou solicitação..."
              rows={5}
              required
              disabled={submitting}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Inclua informações relevantes como: passos para reproduzir o problema,
              comportamento esperado vs. observado, e outras informações úteis
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>Criar Ticket</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
