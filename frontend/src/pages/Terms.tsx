import { PublicLayout } from '@/components/layout/PublicLayout';
import { FileText, ShieldCheck, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TermsPage = () => {
  return (
    <PublicLayout
      title="Termos de Uso"
      description="Termos e condições de uso do MedCheck"
    >
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>

        <div className="space-y-8 max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Aceitação dos Termos</h2>
                  <p className="text-muted-foreground">
                    Ao acessar e utilizar o MedCheck, você concorda com estes termos de
                    uso e todas as leis e regulamentos aplicáveis. Se você não concordar
                    com algum destes termos, está proibido de usar o serviço.
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
                  <h2 className="text-xl font-semibold mb-3">Uso do Serviço</h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • O serviço é destinado apenas a profissionais de saúde
                      habilitados
                    </li>
                    <li>• Você é responsável pela precisão dos dados inseridos</li>
                    <li>• É proibido usar o serviço para fins ilícitos</li>
                    <li>• A conta é pessoal e intransferível</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-3">Responsabilidades</h2>
                  <p className="text-muted-foreground mb-4">
                    O MedCheck é uma ferramenta de apoio à auditoria médica. O usuário
                    reconhece que:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• A decisão final sobre procedimentos é do profissional</li>
                    <li>• Deve verificar a precisão das informações geradas</li>
                    <li>• É responsável pela confidencialidade de sua conta</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              Todo o conteúdo disponível no MedCheck, incluindo mas não se limitando a
              textos, gráficos, logos, ícones, imagens, clipes de áudio, downloads
              digitais e compilações de dados, é de propriedade do MedCheck ou de seus
              fornecedores de conteúdo e protegido por leis brasileiras e internacionais
              de propriedade intelectual.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">Modificações</h2>
            <p className="text-muted-foreground">
              O MedCheck reserva-se o direito de modificar estes termos a qualquer
              momento. Alterações significativas serão comunicadas aos usuários. O uso
              continuado do serviço após as alterações constitui aceitação dos novos
              termos.
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default TermsPage;
