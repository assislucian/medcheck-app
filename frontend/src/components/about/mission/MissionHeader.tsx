import { motion } from 'framer-motion';

export function MissionHeader() {
  return (
    <motion.div
      className="text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <h1 className="text-4xl md:text-5xl font-bold mb-6">Nossa Missão</h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Transformar a gestão de honorários médicos através da tecnologia, devolvendo aos
        profissionais de saúde o valor justo pelo seu trabalho e permitindo que se
        dediquem ao que realmente importa: cuidar de seus pacientes.
      </p>
    </motion.div>
  );
}
