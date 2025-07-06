export function PricingFAQ() {
  return (
    <div className="max-w-2xl mx-auto bg-secondary/50 rounded-lg p-6 mt-10">
      <h3 className="text-xl font-bold mb-4">Perguntas Frequentes</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
          <p className="text-muted-foreground text-sm mt-1">
            Sim, você pode cancelar sua assinatura a qualquer momento. Para planos
            mensais, você terá acesso até o final do período pago.
          </p>
        </div>
        <div>
          <h4 className="font-medium">Como funciona o período de teste gratuito?</h4>
          <p className="text-muted-foreground text-sm mt-1">
            Oferecemos um período de teste gratuito de 7 dias para novos usuários, sem
            compromisso.
          </p>
        </div>
        <div>
          <h4 className="font-medium">
            Preciso fornecer dados do cartão para criar uma conta?
          </h4>
          <p className="text-muted-foreground text-sm mt-1">
            Não, você pode criar uma conta gratuita sem fornecer dados de pagamento.
            Apenas ao assinar um plano precisará informar seus dados.
          </p>
        </div>
      </div>
    </div>
  );
}
