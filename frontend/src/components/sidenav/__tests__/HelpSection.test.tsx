import { render, screen } from '@testing-library/react';
import { HelpSection } from '../HelpSection';
import { BrowserRouter } from 'react-router-dom';

describe('HelpSection', () => {
  it('renders help section with link', () => {
    render(
      <BrowserRouter>
        <HelpSection />
      </BrowserRouter>
    );

    expect(screen.getByText('Ajuda')).toBeInTheDocument();
    const helpLink = screen.getByRole('link');
    expect(helpLink).toHaveAttribute('href', '/help');
  });
});
