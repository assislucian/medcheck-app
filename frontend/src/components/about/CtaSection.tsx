import { Button } from '@/components/ui/button';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para recuperar seus honorários?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais de saúde que já transformaram sua gestão financeira com o MedCheck. Comece hoje mesmo com nosso plano gratuito.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button asChild size="lg" variant="default" className="text-md rounded-md">
              <Link to="/register">Comece agora gratuitamente</Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-md">
              <Link to="/pricing">Ver planos e preços</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
