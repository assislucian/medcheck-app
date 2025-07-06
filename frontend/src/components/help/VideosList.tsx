import { Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoTutorial } from '@/types/help';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideosListProps {
  videos: VideoTutorial[];
  onShowAll?: () => void;
}

export const VideosList = ({ videos, onShowAll }: VideosListProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Vídeos Tutoriais</h2>
        {onShowAll && (
          <Button variant="outline" onClick={onShowAll}>
            Ver todos os vídeos
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="object-cover w-full h-full rounded-t-lg"
                />
              </AspectRatio>
              <Button
                size="icon"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/90 hover:bg-primary"
                onClick={() => window.open(video.url, '_blank')}
              >
                <Play className="h-6 w-6" />
              </Button>
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{video.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{video.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
