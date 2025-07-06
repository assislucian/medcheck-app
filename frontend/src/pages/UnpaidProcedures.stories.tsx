import { PrazoBadge } from './UnpaidProcedures';

export default {
  title: 'UnpaidProcedures/PrazoBadge',
  component: PrazoBadge,
};

export const PrazoOk = () => <PrazoBadge dias={10} />;
export const PrazoCritico = () => <PrazoBadge dias={3} />;
export const PrazoExpirado = () => <PrazoBadge dias={0} />;

PrazoOk.storyName = 'Prazo OK (verde)';
PrazoCritico.storyName = 'Prazo Crítico (amarelo)';
PrazoExpirado.storyName = 'Prazo Expirado (vermelho)';
