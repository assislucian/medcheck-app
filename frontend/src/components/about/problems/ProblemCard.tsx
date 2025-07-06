import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface ProblemCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
}

export function ProblemCard({ title, description, icon, index }: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="h-full border-none shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <div className="mr-4 p-3 rounded-full bg-muted">{icon}</div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
