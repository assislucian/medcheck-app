import { render, screen } from '@testing-library/react';
import { MainNavigation } from '../MainNavigation';
import { BrowserRouter } from 'react-router-dom';

describe('MainNavigation', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MainNavigation />
      </BrowserRouter>
    );
  };

  it('renders the main navigation section', () => {
    renderComponent();
    expect(screen.getByText('Principal')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    renderComponent();
    const expectedItems = [
      'Dashboard',
      'Uploads',
      'Histórico',
      'Relatórios',
      'Comparativo',
      'Planos',
    ];

    expectedItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('renders navigation links with correct hrefs', () => {
    renderComponent();
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});
