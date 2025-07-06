import { render, screen } from '@testing-library/react';
import { NotificationsSection } from '../NotificationsSection';

describe('NotificationsSection', () => {
  it('renders notifications section', () => {
    render(<NotificationsSection />);
    expect(screen.getByText('Notificações')).toBeInTheDocument();
  });

  it('renders notifications button with badge', () => {
    render(<NotificationsSection />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Badge count
  });
});
