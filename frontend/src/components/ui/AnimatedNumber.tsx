import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  /** Valor final a ser animado. */
  value: number;
  /** Função de formatação → recebe valor numérico (float) e devolve string */
  format?: (val: number) => string;
  className?: string;
  /** Duração da animação em segundos */
  duration?: number;
}

/**
 * AnimatedNumber – contagem suave de 0 → value (Count-Up)
 * Usa framer-motion spring para resultados fluidos.
 */
export const AnimatedNumber = ({
  value,
  format = (v) => v.toLocaleString('pt-BR'),
  className,
  duration = 0.6,
}: AnimatedNumberProps) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration, stiffness: 90, damping: 20 });
  const animated = useTransform(spring, (latest) => format(latest));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span className={cn(className)}>{animated}</motion.span>;
};
