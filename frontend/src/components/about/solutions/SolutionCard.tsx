import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SolutionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
}

export function SolutionCard({ title, description, icon, index }: SolutionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="h-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-full bg-primary/10">{icon}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
