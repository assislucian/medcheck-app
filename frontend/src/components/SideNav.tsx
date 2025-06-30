import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MainNavigation } from './sidenav/MainNavigation';
import { NotificationsSection } from './sidenav/NotificationsSection';
import { AccountSection } from './sidenav/AccountSection';
import { HelpSection } from './sidenav/HelpSection';
import { FooterSection } from './sidenav/FooterSection';

interface SideNavProps {
  className?: string;
}

export function SideNav({ className }: SideNavProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <div className={cn('pb-12 h-full flex flex-col', className)}>
      <div className="py-4 px-3">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary rounded-md p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-6 w-6 text-primary-foreground"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <span className="font-bold text-xl">MedCheck</span>
        </Link>
      </div>

      <MainNavigation />
      <NotificationsSection />
      <AccountSection />
      <HelpSection />
      <FooterSection onSignOut={handleSignOut} />
    </div>
  );
}
