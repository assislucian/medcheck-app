import { calcularDiasParaContestar } from '../../utils/date';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrazoBadge, TruncatedCell } from '../UnpaidProcedures';

describe('calcularDiasParaContestar', () => {
  const realDateNow = Date.now;
  beforeAll(() => {
    // Fixa a data de "hoje" para 2024-06-10
    Date.now = () => new Date('2024-06-10T12:00:00Z').getTime();
  });
  afterAll(() => {
    Date.now = realDateNow;
  });

  it('retorna 30 para data de hoje', () => {
    expect(calcularDiasParaContestar('10/06/2024')).toBe(30);
    expect(calcularDiasParaContestar('2024-06-10')).toBe(30);
  });

  it('retorna 29 para ontem', () => {
    expect(calcularDiasParaContestar('09/06/2024')).toBe(29);
    expect(calcularDiasParaContestar('2024-06-09')).toBe(29);
  });

  it('retorna 0 para datas há mais de 30 dias', () => {
    expect(calcularDiasParaContestar('01/05/2024')).toBe(0);
    expect(calcularDiasParaContestar('2024-05-01')).toBe(0);
  });

  it('retorna 30 para datas futuras', () => {
    expect(calcularDiasParaContestar('20/06/2024')).toBe(30);
    expect(calcularDiasParaContestar('2024-06-20')).toBe(30);
  });

  it('lida com formatos inválidos', () => {
    expect(typeof calcularDiasParaContestar('invalida')).toBe('number');
  });
});

describe('PrazoBadge', () => {
  it('renderiza verde para dias > 5', () => {
    render(<PrazoBadge dias={10} />);
    expect(screen.getByText('10 dias')).toHaveClass('bg-green-600');
  });
  it('renderiza amarelo para 1 <= dias <= 5', () => {
    render(<PrazoBadge dias={3} />);
    expect(screen.getByText('3 dias')).toHaveClass('bg-yellow-400');
  });
  it('renderiza vermelho e Expirado para dias <= 0', () => {
    render(<PrazoBadge dias={0} />);
    expect(screen.getByText('Expirado')).toHaveClass('bg-red-600');
  });
});

describe('TruncatedCell', () => {
  it('mostra tooltip ao focar', async () => {
    render(<TruncatedCell text="Texto muito longo para truncar" />);
    const cell = screen.getByText(/Texto muito longo/);
    cell.focus();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
  });
});

describe('Acessibilidade', () => {
  it('permite navegação por teclado e foco visível', async () => {
    render(<PrazoBadge dias={2} />);
    const badge = screen.getByText('2 dias');
    badge.focus();
    expect(badge).toHaveFocus();
    // Simula tabulação
    userEvent.tab();
    expect(document.body).toHaveFocus();
  });
});
