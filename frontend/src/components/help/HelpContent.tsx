import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, PlayCircle } from 'lucide-react';

interface ContentSectionProps {
  onShowGuides: () => void;
  onShowVideos: () => void;
  onContactSupport: () => void;
}

export const HelpContent = ({
  onShowGuides,
  onShowVideos,
  onContactSupport,
}: ContentSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Primeiros Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Conheça o básico para começar a usar o MedCheck.
          </p>
          <Button variant="outline" className="w-full" onClick={onShowGuides}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver Guias
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tutoriais em Vídeo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Aprenda com nossos vídeos explicativos passo a passo.
          </p>
          <Button variant="outline" className="w-full" onClick={onShowVideos}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Assistir Agora
          </Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Suporte Técnico</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Entre em contato com nossa equipe de suporte.
          </p>
          <Button variant="outline" className="w-full" onClick={onContactSupport}>
            <FileText className="mr-2 h-4 w-4" />
            Contatar Suporte
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
