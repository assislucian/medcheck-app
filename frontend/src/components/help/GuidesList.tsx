import { Book } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Guide } from '@/types/help';

interface GuidesListProps {
  guides: Guide[];
  onShowAll?: () => void;
}

export const GuidesList = ({ guides, onShowAll }: GuidesListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Guias</h2>
        {onShowAll && (
          <Button variant="outline" onClick={onShowAll}>
            Ver todos os guias
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <Book className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{guide.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
