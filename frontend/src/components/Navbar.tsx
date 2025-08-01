import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserNavigation } from './navbar/UserNavigation';
import { GuestNavigation } from './navbar/GuestNavigation';
import { NotificationsMenu } from './navbar/NotificationsMenu';
import { HelpMenu } from './navbar/HelpMenu';
import { UserMenu } from './navbar/UserMenu';
import { MobileMenu } from './navbar/MobileMenu';

interface NavbarProps {
  isLoggedIn?: boolean;
  showBackButton?: boolean;
}

const Navbar = ({
  isLoggedIn: propIsLoggedIn,
  showBackButton = false,
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, getProfile } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = propIsLoggedIn !== undefined ? propIsLoggedIn : !!user;
  const [profileData, setProfileData] = useState({
    name: 'Usuário',
    specialty: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoggedIn && user) {
        try {
          const profile = await getProfile();
          if (profile) {
            let avatarUrl = '';
            if (
              profile.notification_preferences &&
              typeof profile.notification_preferences === 'object' &&
              'avatar_url' in profile.notification_preferences
            ) {
              // Fix error 1: Convert any non-string avatar_url to string
              const rawAvatarUrl = profile.notification_preferences.avatar_url;
              avatarUrl = rawAvatarUrl ? String(rawAvatarUrl) : '';
            }

            setProfileData({
              name: profile.name || 'Usuário',
              specialty: profile.specialty || '',
              email: profile.email || user.email || '',
              avatarUrl: avatarUrl,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);
        }
      }
    };

    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn, user, getProfile]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleGoBack}
                title="Voltar"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Button>
            ) : null}
            <Link to="/" className="flex items-center">
              <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
                MedCheck
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              <>
                <UserNavigation />
                <NotificationsMenu />
                <div className="border-l border-border h-6 mx-2" />
                <HelpMenu />
                <UserMenu
                  name={profileData.name}
                  email={profileData.email}
                  specialty={profileData.specialty}
                  avatarUrl={profileData.avatarUrl}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <GuestNavigation />
            )}
          </div>

          <div className="md:hidden flex items-center">
            {isLoggedIn && (
              <>
                {/* Fix error 2: Remove 'as' prop and use proper button with onClick */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative mr-2"
                  onClick={() => {}} // Notifications temporariamente desabilitadas
                >
                  <Bell size={18} />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    3
                  </Badge>
                  <span className="sr-only">Notificações</span>
                </Button>

                <ThemeToggle className="mr-2" />
              </>
            )}
            <button
              type="button"
              className="text-foreground p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isLoggedIn={isLoggedIn}
        isOpen={mobileMenuOpen}
        profileData={profileData}
        onLogout={handleLogout}
      />
    </nav>
  );
};

export default Navbar;
