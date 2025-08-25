import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Shield, Gavel, Clock, AlertTriangle } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  open,
  onOpenChange,
  onAccept,
  showAcceptButton = false
}) => {
  const handleAccept = () => {
    onAccept?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="h-6 w-6 text-amber-600" />
            <DialogTitle className="text-2xl font-bold">Termos de Uso - MedCheck</DialogTitle>
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Vigência: 2025
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Versão 2.0 | Última atualização: 05 de janeiro de 2025 | Documento juridicamente vinculativo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm">
            {/* Seção 1: Definições e Interpretação */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold">1. DEFINIÇÕES E INTERPRETAÇÃO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>1.1.</strong> Para os fins destes Termos de Uso, as seguintes definições se aplicam:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>"MedCheck"</strong> ou <strong>"Plataforma"</strong>: Sistema informatizado de auditoria médica, gestão de demonstrativos TISS e análise de honorários CBHPM;</li>
                  <li><strong>"Usuário"</strong> ou <strong>"Médico"</strong>: Profissional médico devidamente inscrito no Conselho Regional de Medicina (CRM);</li>
                  <li><strong>"CBHPM"</strong>: Classificação Brasileira Hierarquizada de Procedimentos Médicos vigente;</li>
                  <li><strong>"TISS"</strong>: Troca de Informações na Saúde Suplementar conforme padrões ANS;</li>
                  <li><strong>"Dados Médicos"</strong>: Informações relacionadas a procedimentos, honorários e demonstrativos;</li>
                  <li><strong>"ANS"</strong>: Agência Nacional de Saúde Suplementar;</li>
                  <li><strong>"LGPD"</strong>: Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
                </ul>
              </div>
            </section>

            {/* Seção 2: Aceitação e Capacidade */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">2. ACEITAÇÃO E CAPACIDADE JURÍDICA</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>2.1.</strong> Ao acessar ou utilizar a Plataforma MedCheck, o Usuário declara e garante que:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) É médico devidamente inscrito e regular perante o CRM competente;</li>
                  <li>b) Possui plena capacidade civil para assumir obrigações contratuais;</li>
                  <li>c) Leu, compreendeu e aceita integralmente estes Termos de Uso;</li>
                  <li>d) Compromete-se a utilizar a Plataforma em conformidade com a legislação vigente.</li>
                </ul>
                <p><strong>2.2.</strong> O uso da Plataforma por menores de idade ou pessoas sem capacidade civil é expressamente vedado.</p>
              </div>
            </section>

            {/* Seção 3: Objeto e Funcionalidades */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">3. OBJETO E FUNCIONALIDADES</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>3.1.</strong> A Plataforma MedCheck oferece os seguintes serviços:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) <strong>Auditoria Automatizada CBHPM</strong>: Análise comparativa entre valores apresentados e tabela CBHPM vigente;</li>
                  <li>b) <strong>Gestão de Demonstrativos TISS</strong>: Upload, processamento e análise de demonstrativos de pagamento;</li>
                  <li>c) <strong>Sistema de Contestação Jurídica</strong>: Geração de documentos de contestação fundamentados na legislação ANS;</li>
                  <li>d) <strong>Dashboard Financeiro</strong>: Relatórios executivos de performance e análise de glosas;</li>
                  <li>e) <strong>Alertas de Prazo</strong>: Notificações para cumprimento de prazos legais de contestação;</li>
                  <li>f) <strong>Crosscheck de Procedimentos</strong>: Cruzamento entre guias autorizadas e demonstrativos recebidos.</li>
                </ul>
              </div>
            </section>

            {/* Seção 4: Obrigações do Usuário */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">4. OBRIGAÇÕES E RESPONSABILIDADES DO USUÁRIO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>4.1.</strong> O Usuário compromete-se a:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Utilizar a Plataforma exclusivamente para fins profissionais médicos legítimos;</li>
                  <li>b) Manter a confidencialidade de suas credenciais de acesso;</li>
                  <li>c) Fornecer informações verídicas, precisas e atualizadas;</li>
                  <li>d) Respeitar os direitos de propriedade intelectual da Plataforma;</li>
                  <li>e) Não utilizar a Plataforma para atividades ilícitas ou contrárias à ética médica;</li>
                  <li>f) Reportar imediatamente qualquer uso não autorizado de sua conta;</li>
                  <li>g) Manter seus dados de CRM atualizados e válidos.</li>
                </ul>
                <p><strong>4.2.</strong> É expressamente vedado ao Usuário:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Compartilhar credenciais de acesso com terceiros;</li>
                  <li>b) Tentar acessar áreas restritas ou dados de outros usuários;</li>
                  <li>c) Realizar engenharia reversa ou tentativas de violação de segurança;</li>
                  <li>d) Upload de documentos fraudulentos ou adulterados;</li>
                  <li>e) Utilizar a Plataforma para spam ou atividades comerciais não autorizadas.</li>
                </ul>
              </div>
            </section>

            {/* Seção 5: Proteção de Dados e Privacidade */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">5. PROTEÇÃO DE DADOS E PRIVACIDADE</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>5.1.</strong> O tratamento de dados pessoais pela Plataforma MedCheck observa rigorosamente:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018);</li>
                  <li>b) Código de Ética Médica do Conselho Federal de Medicina;</li>
                  <li>c) Resoluções da Agência Nacional de Saúde Suplementar (ANS);</li>
                  <li>d) Normas do Conselho Nacional de Saúde (CNS).</li>
                </ul>
                <p><strong>5.2.</strong> A Política de Privacidade, parte integrante destes Termos, detalha especificamente o tratamento de dados.</p>
              </div>
            </section>

            {/* Seção 6: Propriedade Intelectual */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">6. PROPRIEDADE INTELECTUAL</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>6.1.</strong> Todos os direitos de propriedade intelectual sobre a Plataforma MedCheck, incluindo mas não limitado a:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Códigos-fonte, algoritmos e sistemas;</li>
                  <li>b) Interface gráfica, design e layout;</li>
                  <li>c) Logomarcas, nomes e identidade visual;</li>
                  <li>d) Documentação técnica e manuais;</li>
                  <li>e) Metodologias de análise e cálculo;</li>
                </ul>
                <p>Pertencem exclusivamente ao MedCheck e são protegidos pela legislação de propriedade intelectual brasileira.</p>
                <p><strong>6.2.</strong> É concedida ao Usuário apenas licença limitada, não exclusiva e intransferível para uso da Plataforma.</p>
              </div>
            </section>

            {/* Seção 7: Limitação de Responsabilidade */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">7. LIMITAÇÃO DE RESPONSABILIDADE</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>7.1.</strong> A Plataforma MedCheck fornece ferramentas de apoio à gestão médica, mas:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Não substitui o julgamento profissional médico;</li>
                  <li>b) Não garante êxito em contestações ou recuperação de valores;</li>
                  <li>c) Não se responsabiliza por decisões tomadas com base nas análises;</li>
                  <li>d) Não oferece consultoria jurídica ou médica específica.</li>
                </ul>
                <p><strong>7.2.</strong> A responsabilidade do MedCheck limita-se ao valor mensal da assinatura paga pelo Usuário.</p>
              </div>
            </section>

            {/* Seção 8: Vigência e Rescisão */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">8. VIGÊNCIA E RESCISÃO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>8.1.</strong> Este contrato vigora por prazo indeterminado, podendo ser rescindido:</p>
                <ul className="space-y-2 ml-4">
                  <li>a) Pelo Usuário: A qualquer tempo, mediante cancelamento na plataforma;</li>
                  <li>b) Pelo MedCheck: Em caso de violação destes Termos, com notificação prévia de 30 dias.</li>
                </ul>
                <p><strong>8.2.</strong> Após a rescisão, os dados do Usuário serão mantidos pelo prazo legal necessário (5 anos para documentos médicos).</p>
              </div>
            </section>

            {/* Seção 9: Disposições Gerais */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">9. DISPOSIÇÕES GERAIS</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>9.1.</strong> <strong>Foro:</strong> Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias.</p>
                <p><strong>9.2.</strong> <strong>Lei Aplicável:</strong> Este contrato rege-se pela legislação brasileira.</p>
                <p><strong>9.3.</strong> <strong>Alterações:</strong> O MedCheck reserva-se o direito de alterar estes Termos, com comunicação prévia de 30 dias.</p>
                <p><strong>9.4.</strong> <strong>Validade:</strong> A invalidade de qualquer cláusula não afeta a validade do contrato como um todo.</p>
                <p><strong>9.5.</strong> <strong>Contato Legal:</strong> juridico@medcheck.com.br</p>
              </div>
            </section>

            {/* Informações Finais */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="font-semibold text-amber-800 dark:text-amber-200">Documento Juridicamente Vinculativo</p>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Este documento constitui acordo legal entre você e o MedCheck. Ao utilizar nossa plataforma, 
                você confirma ter lido, compreendido e aceito todos os termos aqui estabelecidos.
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p><strong>MedCheck Soluções em Auditoria Médica Ltda.</strong></p>
              <p>CNPJ: 00.000.000/0001-00 | São Paulo/SP</p>
              <p>Última atualização: 05 de janeiro de 2025 | Versão 2.0</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Documento válido | Versão 2.0 | 2025
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {showAcceptButton && (
                <Button onClick={handleAccept} variant="primary">
                  Aceitar Termos
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
