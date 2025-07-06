import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface BenefitItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
}

export function BenefitItem({ title, description, icon, index }: BenefitItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="flex items-start">
        <div className="mr-4 p-2 rounded-full bg-primary/10">{icon}</div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
