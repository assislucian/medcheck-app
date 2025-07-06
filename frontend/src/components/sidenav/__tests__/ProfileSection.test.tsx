import { render, screen } from '@testing-library/react';
import { ProfileSection } from '../ProfileSection';
import { BrowserRouter } from 'react-router-dom';

describe('ProfileSection', () => {
  const mockProfileData = {
    name: 'John Doe',
    specialty: 'Cardiologist',
    crm: '12345',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ProfileSection profileData={mockProfileData} />
      </BrowserRouter>
    );
  };

  it('renders user name', () => {
    renderComponent();
    expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
  });

  it('renders specialty when provided', () => {
    renderComponent();
    expect(screen.getByText(mockProfileData.specialty)).toBeInTheDocument();
  });

  it('renders CRM when provided', () => {
    renderComponent();
    expect(screen.getByText(`CRM ${mockProfileData.crm}`)).toBeInTheDocument();
  });

  it('renders avatar with fallback initials', () => {
    renderComponent();
    const avatar = screen.getByRole('img', { name: 'Avatar' });
    expect(avatar).toBeInTheDocument();
  });

  it('renders view profile link', () => {
    renderComponent();
    const profileLink = screen.getByRole('link', { name: /ver perfil/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/profile');
  });
});
