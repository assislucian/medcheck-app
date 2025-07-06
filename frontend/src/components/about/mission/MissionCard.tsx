import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface MissionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
}

export function MissionCard({ title, description, icon, index }: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-300">
        <CardContent className="pt-6 px-6 pb-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-3 rounded-full bg-primary/10">{icon}</div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
