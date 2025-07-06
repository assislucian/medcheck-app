import { useState } from 'react';
import { PublicLayout } from '@/layout/PublicLayout';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Send,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulando envio do formulário
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Contato | MedCheck"
      description="Entre em contato com a equipe do MedCheck para saber mais sobre nossa plataforma de auditoria médica automatizada."
      showBackButton={true}
    >
      <motion.div
        className="py-16 px-6 bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Entre em Contato</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos prontos para esclarecer suas dúvidas e mostrar como o MedCheck
              pode transformar a gestão financeira da sua prática médica.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Informações de contato */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold mb-6">Informações de Contato</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Endereço</h3>
                      <p className="text-muted-foreground">
                        Av. Paulista, 1000, Bela Vista
                        <br />
                        São Paulo - SP, 01310-100
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Telefone</h3>
                      <p className="text-muted-foreground">+55 (11) 4000-7000</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">contato@medcheck.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Suporte</h3>
                      <p className="text-muted-foreground">suporte@medcheck.com.br</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="font-medium mb-4">Siga-nos</h3>
                  <div className="flex items-center space-x-4">
                    <a
                      href="#"
                      className="bg-background p-2 rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-background p-2 rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-background p-2 rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="bg-background p-2 rounded-full border border-border hover:bg-muted transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulário de contato */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="bg-card rounded-xl p-8 border border-border">
                <h2 className="text-2xl font-semibold mb-6">Envie uma Mensagem</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome completo
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        E-mail
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium mb-1"
                      >
                        Assunto
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Assunto da mensagem"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-1"
                      >
                        Mensagem
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Digite sua mensagem aqui..."
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Enviando...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Mapa */}
          <div className="mt-16">
            <div className="bg-muted rounded-xl border border-border overflow-hidden h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0976521945293!2d-46.655103724941!3d-23.56150393759689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1682624414682!5m2!1spt-BR!2sbr"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização MedCheck"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </PublicLayout>
  );
};

export default Contact;
