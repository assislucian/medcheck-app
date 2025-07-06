import { motion } from 'framer-motion';

export function TestimonialsHeader() {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        O que dizem nossos usuários
      </h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">
        Veja como o MedCheck está transformando a gestão financeira de médicos e
        clínicas em todo o Brasil. Nossos clientes são nossa melhor referência.
      </p>
    </motion.div>
  );
}
