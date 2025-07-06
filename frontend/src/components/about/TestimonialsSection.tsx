import { TestimonialCard } from './testimonials/TestimonialCard';
import { TestimonialsHeader } from './testimonials/TestimonialsHeader';
import { motion } from 'framer-motion';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Dra. Mariana Costa',
      role: 'Cardiologista',
      content:
        'O MedCheck transformou minha prática médica. Recuperei mais de R$15.000 em honorários que teriam sido perdidos e agora tenho mais tempo para me dedicar aos meus pacientes.',
      avatar: '/testimonial-1.jpg',
    },
    {
      name: 'Dr. Ricardo Mendes',
      role: 'Ortopedista',
      content:
        'Antes do MedCheck, eu perdia horas verificando demonstrativos de pagamento. Agora o sistema faz tudo automaticamente e me alerta sobre discrepâncias. É uma ferramenta essencial para qualquer médico.',
      avatar: '/testimonial-2.jpg',
    },
    {
      name: 'Dra. Carla Rodrigues',
      role: 'Dermatologista',
      content:
        'A interface do MedCheck é incrivelmente fácil de usar. Em poucas semanas, identifiquei e recuperei valores significativos que haviam sido incorretamente glosados.',
      avatar: '/testimonial-3.jpg',
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl mx-auto px-4">
        <TestimonialsHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
