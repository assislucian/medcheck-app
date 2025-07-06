import { PublicLayout } from '@/components/layout/PublicLayout';
import { Shield, ShieldCheck } from 'lucide-react'; // Updated import
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPage = () => {
  return (
    <PublicLayout
      title="Política de Privacidade"
      description="Nossa política de privacidade e proteção de dados"
    >
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />{' '}
                {/* Updated icon */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">
                    Compromisso com sua Privacidade
                  </h2>
                  <p className="text-muted-foreground">
                    O MedCheck está comprometido com a proteção da sua privacidade. Esta
                    política descreve como coletamos, usamos e protegemos suas
                    informações pessoais em conformidade com a Lei Geral de Proteção de
                    Dados (LGPD - Lei nº 13.709/2018).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Dados que Coletamos</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Informações de cadastro (nome, email, CRM)</li>
                    <li>• Dados profissionais para auditoria médica</li>
                    <li>• Registros de uso da plataforma</li>
                    <li>• Informações de pagamento (processadas de forma segura)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Proteção de Dados</h2>
                  <p className="text-muted-foreground mb-4">
                    Implementamos medidas técnicas e organizacionais para proteger seus
                    dados:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Criptografia de dados sensíveis</li>
                    <li>• Controles de acesso rigorosos</li>
                    <li>• Monitoramento contínuo de segurança</li>
                    <li>• Backups regulares e seguros</li>
                    <li>• Conformidade com padrões internacionais de segurança</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground mb-4">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Acessar seus dados</li>
              <li>• Corrigir dados incompletos ou desatualizados</li>
              <li>• Solicitar a exclusão de seus dados</li>
              <li>• Revogar seu consentimento</li>
              <li>• Ser informado sobre o compartilhamento de seus dados</li>
            </ul>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Contato do DPO</h2>
            <p className="text-muted-foreground">
              Para exercer seus direitos ou esclarecer dúvidas sobre nossa política de
              privacidade, entre em contato com nosso Encarregado de Proteção de Dados
              (DPO) através do email: dpo@medcheck.com.br
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPage;
