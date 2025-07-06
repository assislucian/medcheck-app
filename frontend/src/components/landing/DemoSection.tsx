import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DemoRequestForm } from '@/components/DemoRequestForm';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function DemoSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDemoForm, setShowDemoForm] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const handleRequestDemo = () => {
    setShowDemoForm(true);

    // Example of using the mock supabase client
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('id', '1')
        .single();

      if (error) {
        console.error('Error fetching demo data:', error);
      } else {
        console.log('Demo data fetched:', data);
      }
    };

    fetchData();
  };

  return (
    <section id="demo" className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Veja o MedCheck em ação</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra como nossa plataforma simplifica a auditoria e aumenta seus
            recebimentos em apenas alguns minutos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-video bg-black/5 rounded-lg overflow-hidden border shadow-md">
            {isVideoPlaying ? (
              <iframe
                className="w-full h-full absolute inset-0"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="MedCheck Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-primary mb-4">
                  <PlayCircle
                    className="h-16 w-16 cursor-pointer hover:scale-110 transition-transform"
                    onClick={handlePlayVideo}
                  />
                </div>
                <p className="font-medium">Assistir demonstração</p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            {showDemoForm ? (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Solicite uma demonstração</h3>
                  <DemoRequestForm />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Pronto para experimentar?</h3>
                <p className="text-muted-foreground">
                  Nossa equipe pode mostrar como o MedCheck se adapta à sua prática
                  médica e ajuda a recuperar valores glosados indevidamente.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                    <span>Demonstração personalizada para sua especialidade</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                    <span>Análise gratuita de um demonstrativo real</span>
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-primary" />
                    <span>Consultoria com especialista em reembolsos médicos</span>
                  </li>
                </ul>
                <Button size="lg" onClick={handleRequestDemo}>
                  Solicitar demonstração
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
