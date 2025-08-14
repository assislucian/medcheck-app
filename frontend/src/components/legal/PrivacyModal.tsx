import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Database, UserCheck, Eye, FileText, AlertTriangle, Clock, Mail } from 'lucide-react';

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
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
            <Shield className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-2xl font-bold">Política de Privacidade - MedCheck</DialogTitle>
            <Badge variant="outline" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              LGPD Compliant
            </Badge>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Versão 3.0 | Última atualização: 05 de janeiro de 2025 | Conforme LGPD (Lei nº 13.709/2018)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 text-sm">
            {/* Seção 1: Identificação do Controlador */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">1. IDENTIFICAÇÃO DO CONTROLADOR DE DADOS</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>Razão Social:</strong> MedCheck Soluções em Auditoria Médica Ltda.</p>
                <p><strong>CNPJ:</strong> 00.000.000/0001-00</p>
                <p><strong>Endereço:</strong> [Endereço Completo], São Paulo/SP</p>
                <p><strong>E-mail:</strong> privacidade@medcheck.com.br</p>
                <p><strong>DPO (Encarregado):</strong> dpo@medcheck.com.br</p>
                <p><strong>Base Legal:</strong> Art. 7º, incisos I, V e IX da LGPD</p>
              </div>
            </section>

            {/* Seção 2: Dados Pessoais Coletados */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">2. DADOS PESSOAIS COLETADOS</h3>
              </div>
              <div className="pl-7 space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2.1. Dados de Identificação:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Nome completo do médico</li>
                    <li>• Número do CRM e UF de registro</li>
                    <li>• Endereço de e-mail profissional</li>
                    <li>• Especialidade médica</li>
                    <li>• Telefone de contato (opcional)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">2.2. Dados Profissionais e Financeiros:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Demonstrativos de pagamento (padrão TISS)</li>
                    <li>• Guias de procedimentos médicos</li>
                    <li>• Valores de honorários e procedimentos</li>
                    <li>• Códigos CBHPM de procedimentos realizados</li>
                    <li>• Informações de convênios e operadoras</li>
                    <li>• Dados de pacientes (quando necessário para contestações)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">2.3. Dados Técnicos e de Navegação:</h4>
                  <ul className="space-y-1 ml-4">
                    <li>• Endereço IP e localização aproximada</li>
                    <li>• Informações do dispositivo e navegador</li>
                    <li>• Logs de acesso e uso da plataforma</li>
                    <li>• Cookies técnicos e funcionais</li>
                    <li>• Métricas de performance e uso</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200 text-xs">
                    <strong>Dados Sensíveis:</strong> Não coletamos dados de saúde dos pacientes. 
                    Processamos apenas informações financeiro-administrativas necessárias para auditoria médica.
                  </p>
                </div>
              </div>
            </section>

            {/* Seção 3: Finalidades do Tratamento */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">3. FINALIDADES DO TRATAMENTO DE DADOS</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>3.1.</strong> Os dados pessoais são tratados exclusivamente para as seguintes finalidades:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>a) Prestação de Serviços (Art. 7º, V - LGPD):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Auditoria automatizada de honorários CBHPM</li>
                      <li>- Análise de demonstrativos TISS</li>
                      <li>- Geração de relatórios financeiros</li>
                      <li>- Sistema de contestação de glosas</li>
                    </ul>
                  </li>
                  <li><strong>b) Cumprimento de Obrigação Legal (Art. 7º, II - LGPD):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Manutenção de registros conforme ANS</li>
                      <li>- Atendimento à fiscalização do CRM</li>
                      <li>- Cumprimento de obrigações contábeis e fiscais</li>
                    </ul>
                  </li>
                  <li><strong>c) Legítimo Interesse (Art. 7º, IX - LGPD):</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Segurança da informação e prevenção à fraude</li>
                      <li>- Melhoria dos serviços prestados</li>
                      <li>- Suporte técnico e atendimento</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            {/* Seção 4: Base Legal */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">4. BASE LEGAL PARA O TRATAMENTO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>4.1.</strong> O tratamento de dados pessoais fundamenta-se nas seguintes bases legais:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Art. 7º, I - Consentimento:</strong> Para comunicações promocionais e newsletters</li>
                  <li><strong>Art. 7º, V - Execução de Contrato:</strong> Para prestação dos serviços contratados</li>
                  <li><strong>Art. 7º, II - Cumprimento de Obrigação Legal:</strong> Para atendimento às exigências regulatórias</li>
                  <li><strong>Art. 7º, IX - Legítimo Interesse:</strong> Para segurança e melhoria dos serviços</li>
                </ul>
                <p><strong>4.2.</strong> Para dados sensíveis (quando aplicável), utilizamos exclusivamente as bases do Art. 11 da LGPD.</p>
              </div>
            </section>

            {/* Seção 5: Compartilhamento de Dados */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold">5. COMPARTILHAMENTO E TRANSFERÊNCIA DE DADOS</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>5.1.</strong> Os dados pessoais podem ser compartilhados com:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>a) Prestadores de Serviços:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Provedores de infraestrutura em nuvem (AWS, Google Cloud)</li>
                      <li>- Serviços de backup e segurança</li>
                      <li>- Processadores de pagamento</li>
                      <li>- Sempre sob Contrato de Tratamento de Dados (DPA)</li>
                    </ul>
                  </li>
                  <li><strong>b) Autoridades Competentes:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Conselho Regional de Medicina (CRM)</li>
                      <li>- Agência Nacional de Saúde Suplementar (ANS)</li>
                      <li>- Autoridades judiciárias (quando legalmente exigido)</li>
                    </ul>
                  </li>
                </ul>
                <p><strong>5.2.</strong> <strong>Transferência Internacional:</strong> Dados podem ser processados em servidores localizados fora do Brasil, sempre com garantias adequadas conforme Arts. 33-36 da LGPD.</p>
              </div>
            </section>

            {/* Seção 6: Segurança dos Dados */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">6. MEDIDAS DE SEGURANÇA E PROTEÇÃO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>6.1.</strong> Implementamos as seguintes medidas técnicas e organizacionais:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Medidas Técnicas:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Criptografia AES-256 para dados em repouso</li>
                      <li>- TLS 1.3 para dados em trânsito</li>
                      <li>- Autenticação multifator (MFA)</li>
                      <li>- Monitoramento 24/7 de segurança</li>
                      <li>- Backups criptografados diários</li>
                      <li>- Testes de penetração regulares</li>
                    </ul>
                  </li>
                  <li><strong>Medidas Organizacionais:</strong>
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>- Treinamento regular da equipe em LGPD</li>
                      <li>- Políticas de acesso baseadas no princípio do menor privilégio</li>
                      <li>- Processo formal de resposta a incidentes</li>
                      <li>- Auditorias de segurança anuais</li>
                      <li>- Classificação e inventário de dados</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </section>

            {/* Seção 7: Retenção de Dados */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">7. PERÍODO DE RETENÇÃO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>7.1.</strong> Os dados pessoais são mantidos pelos seguintes períodos:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Dados de Cadastro:</strong> Durante a vigência do contrato + 5 anos</li>
                  <li><strong>Demonstrativos Médicos:</strong> 20 anos (conforme Resolução CFM nº 1.821/2007)</li>
                  <li><strong>Dados Financeiros:</strong> 5 anos (conforme legislação contábil)</li>
                  <li><strong>Logs de Acesso:</strong> 6 meses (para fins de segurança)</li>
                  <li><strong>Cookies Técnicos:</strong> 12 meses ou conforme configuração</li>
                </ul>
                <p><strong>7.2.</strong> Após os prazos, os dados são eliminados de forma segura e irreversível.</p>
              </div>
            </section>

            {/* Seção 8: Direitos do Titular */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold">8. DIREITOS DOS TITULARES DE DADOS</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>8.1.</strong> Conforme Art. 18 da LGPD, você tem os seguintes direitos:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>a) Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                  <li><strong>b) Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
                  <li><strong>c) Anonimização/Bloqueio:</strong> Para dados desnecessários ou excessivos</li>
                  <li><strong>d) Eliminação:</strong> Exclusão de dados tratados com consentimento</li>
                  <li><strong>e) Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  <li><strong>f) Informação:</strong> Sobre compartilhamento com terceiros</li>
                  <li><strong>g) Revogação do Consentimento:</strong> Quando aplicável</li>
                  <li><strong>h) Oposição:</strong> Ao tratamento baseado em legítimo interesse</li>
                </ul>
                <p><strong>8.2.</strong> <strong>Como Exercer:</strong> Envie solicitação para dpo@medcheck.com.br com documento de identificação.</p>
                <p><strong>8.3.</strong> <strong>Prazo de Resposta:</strong> 15 dias, prorrogáveis por mais 15 dias.</p>
              </div>
            </section>

            {/* Seção 9: Cookies e Tecnologias Similares */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold">9. COOKIES E TECNOLOGIAS SIMILARES</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>9.1.</strong> Utilizamos cookies nas seguintes categorias:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Cookies Essenciais:</strong> Necessários para funcionamento básico (sessão, autenticação)</li>
                  <li><strong>Cookies Funcionais:</strong> Melhoram a experiência do usuário (preferências, idioma)</li>
                  <li><strong>Cookies Analíticos:</strong> Para métricas de uso e performance (com consentimento)</li>
                </ul>
                <p><strong>9.2.</strong> Você pode gerenciar cookies nas configurações do navegador.</p>
              </div>
            </section>

            {/* Seção 10: Incidentes de Segurança */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold">10. INCIDENTES DE SEGURANÇA</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>10.1.</strong> Em caso de incidente de segurança que possa gerar risco aos direitos dos titulares:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Comunicaremos à ANPD em até 72 horas</li>
                  <li>• Notificaremos os titulares afetados quando necessário</li>
                  <li>• Implementaremos medidas corretivas imediatas</li>
                  <li>• Documentaremos o incidente e as ações tomadas</li>
                </ul>
              </div>
            </section>

            {/* Seção 11: Contato e DPO */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">11. CANAL DE COMUNICAÇÃO E DPO</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>11.1.</strong> <strong>Encarregado de Proteção de Dados (DPO):</strong></p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Nome:</strong> [Nome do DPO]</li>
                  <li><strong>E-mail:</strong> dpo@medcheck.com.br</li>
                  <li><strong>Telefone:</strong> (11) 9999-9999</li>
                  <li><strong>Endereço:</strong> [Endereço do DPO]</li>
                </ul>
                <p><strong>11.2.</strong> Para dúvidas sobre esta Política: privacidade@medcheck.com.br</p>
              </div>
            </section>

            {/* Seção 12: Alterações */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold">12. ALTERAÇÕES DESTA POLÍTICA</h3>
              </div>
              <div className="pl-7 space-y-3 text-muted-foreground">
                <p><strong>12.1.</strong> Esta Política pode ser atualizada periodicamente. Alterações serão:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Comunicadas por e-mail com 30 dias de antecedência</li>
                  <li>• Publicadas na plataforma com destaque</li>
                  <li>• Disponibilizadas para consulta histórica</li>
                </ul>
                <p><strong>12.2.</strong> O uso continuado implica aceitação das alterações.</p>
              </div>
            </section>

            {/* Informações de Conformidade */}
            <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <p className="font-semibold text-green-800 dark:text-green-200">Conformidade LGPD Certificada</p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Esta Política de Privacidade está em total conformidade com a Lei Geral de Proteção de Dados 
                (LGPD - Lei nº 13.709/2018) e é auditada regularmente por especialistas em proteção de dados.
              </p>
            </div>

            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p><strong>MedCheck Soluções em Auditoria Médica Ltda.</strong></p>
              <p>CNPJ: 00.000.000/0001-00 | São Paulo/SP</p>
              <p>DPO: dpo@medcheck.com.br | Privacidade: privacidade@medcheck.com.br</p>
              <p>Última atualização: 05 de janeiro de 2025 | Versão 3.0</p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              LGPD Compliant | Versão 3.0 | 2025
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              {showAcceptButton && (
                <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
                  Aceitar Política
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
