import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/ThemeToggle";

export const GuestNavigation = () => {
  const location = useLocation();

  const handleAboutClick = (e: React.MouseEvent) => {
    if (location.pathname === '/about') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground">Produto</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/about"
                      onClick={handleAboutClick}
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium text-primary">
                        Quem Somos
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Conheça a história e a missão do MedCheck - desenvolvido por médicos para médicos
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/how-it-works"
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      )}
                    >
                      <div className="text-sm font-medium leading-none">Como Funciona</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Veja como nossa plataforma automatiza a auditoria médica
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/pricing"
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      )}
                    >
                      <div className="text-sm font-medium leading-none">Planos</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Escolha o plano ideal para as suas necessidades
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/contact" className={cn(navigationMenuTriggerStyle(), "text-foreground/80 hover:text-foreground cursor-pointer")}>
              Contato
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <div className="hidden md:block border-l border-border h-6 mx-2" />
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" asChild className="text-sm hidden md:flex">
          <Link to="/login">Entrar</Link>
        </Button>
        <Button asChild variant="default" className="rounded-md">
          <Link to="/register">Começar agora</Link>
        </Button>
      </div>
    </>
  );
};
