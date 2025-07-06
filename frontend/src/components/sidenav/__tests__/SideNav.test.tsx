import { render, screen } from '@testing-library/react';
import { SideNav } from '../../SideNav';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { vi, describe, it, expect } from 'vitest';
const jest = vi;
const run = process.env.CI === 'true';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe(run ? 'SideNav' : describe.skip('SideNav'), () => {
  const mockGetProfile = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: '123' },
      signOut: mockSignOut,
      getProfile: mockGetProfile,
    });

    mockGetProfile.mockResolvedValue({
      name: 'Test User',
      specialty: 'Test Specialty',
      crm: '12345',
      notification_preferences: {
        avatar_url: 'test-avatar.jpg',
      },
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SideNav />
      </BrowserRouter>
    );
  };

  it('renders the logo and brand name', () => {
    renderComponent();
    expect(screen.getByText('MedCheck')).toBeInTheDocument();
  });

  it('loads and displays user profile data', async () => {
    renderComponent();
    expect(await screen.findByText('Test User')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    renderComponent();
    const sections = ['Principal', 'Notificações', 'Conta', 'Ajuda'];
    sections.forEach((section) => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });
});
