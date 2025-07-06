import { render, screen } from '@testing-library/react';
import { AccountSection } from '../AccountSection';
import { BrowserRouter } from 'react-router-dom';

describe('AccountSection', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AccountSection />
      </BrowserRouter>
    );
  };

  it('renders account section', () => {
    renderComponent();
    expect(screen.getByText('Conta')).toBeInTheDocument();
  });

  it('renders profile and settings links', () => {
    renderComponent();
    expect(screen.getByRole('link', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configurações/i })).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    renderComponent();
    const profileLink = screen.getByRole('link', { name: /perfil/i });
    const settingsLink = screen.getByRole('link', { name: /configurações/i });

    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });
});
