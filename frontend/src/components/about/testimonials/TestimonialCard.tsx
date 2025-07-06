import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QuoteIcon } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

export function TestimonialCard({ name, role, content, avatar }: TestimonialCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="h-full">
      <CardContent className="pt-6 flex flex-col h-full">
        <div className="mb-4 text-primary">
          <QuoteIcon className="h-8 w-8" />
        </div>

        <p className="text-muted-foreground mb-6 flex-grow">{content}</p>

        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
