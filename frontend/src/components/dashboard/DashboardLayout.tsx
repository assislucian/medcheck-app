import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppSidebar } from '@/components/sidebar/AppSidebar';

interface DashboardLayoutProps {
  isMobile: boolean;
  children: React.ReactNode;
}

export function DashboardLayout({ isMobile, children }: DashboardLayoutProps) {
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex-1">
          <div className="pt-16 px-4 pb-4">{children}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppSidebar />
      <div className="flex-1 ml-[280px]">
        <div className="p-8">{children}</div>
      </div>
    </>
  );
}
