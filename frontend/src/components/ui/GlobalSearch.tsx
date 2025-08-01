import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { Button } from './button';
import { Badge } from './badge';
import {
  Search,
  FileText,
  FileBarChart,
  FileX,
  History,
  HelpCircle,
  User,
  Settings,
  LayoutDashboard,
  Brain,
  Calculator,
  BarChart3,
  Bell,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  category: string;
}

interface GlobalSearchProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ trigger, className }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Itens de busca estruturados
  const searchItems: SearchItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Visão geral e métricas principais',
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: '/dashboard',
      category: 'Principal',
    },
    {
      id: 'guides',
      title: 'Guias Médicas',
      description: 'Gestão de guias TISS',
      icon: <FileText className="h-4 w-4" />,
      href: '/guides',
      category: 'Operacional',
    },
    {
      id: 'demonstratives',
      title: 'Demonstrativos',
      description: 'Análise de demonstrativos',
      icon: <FileBarChart className="h-4 w-4" />,
      href: '/demonstratives',
      category: 'Operacional',
    },
    {
      id: 'unpaid-procedures',
      title: 'Glosas Pendentes',
      description: 'Gestão de contestações',
      icon: <FileX className="h-4 w-4" />,
      href: '/unpaid-procedures',
      category: 'Crítico',
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Relatórios customizados',
      icon: <BarChart3 className="h-4 w-4" />,
      href: '/reports',
      category: 'Análise',
    },
    // Temporariamente removido
    // {
    //   id: 'notifications',
    //   title: 'Activity Log',
    //   description: 'Log de atividades do sistema',
    //   icon: <Activity className="h-4 w-4" />,
    //   href: '/notifications',
    //   category: 'Sistema',
    // },
    {
      id: 'help',
      title: 'Suporte',
      description: 'Ajuda e documentação',
      icon: <HelpCircle className="h-4 w-4" />,
      href: '/help',
      category: 'Suporte',
    },
    {
      id: 'profile',
      title: 'Perfil',
      description: 'Dados pessoais e configurações',
      icon: <User className="h-4 w-4" />,
      href: '/profile',
      category: 'Conta',
    },
  ];

  // Atalho de teclado Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      navigate(href);
    },
    [navigate]
  );

  // Agrupar itens por categoria
  const groupedItems = searchItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, SearchItem[]>
  );

  return (
    <>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setOpen(true)} className={className}>
          {trigger}
        </div>
      ) : (
        <Button
          variant="outline"
          className={cn(
            'relative justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
            className
          )}
          onClick={() => setOpen(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline-flex">Buscar...</span>
          <span className="inline-flex lg:hidden">Buscar</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      )}

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Digite para buscar páginas, ações e configurações..."
          className="h-12"
        />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Search className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Nenhum resultado encontrado</p>
                <p className="text-xs text-muted-foreground">
                  Tente usar termos diferentes ou navegue pelas categorias
                </p>
              </div>
            </div>
          </CommandEmpty>

          {Object.entries(groupedItems).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.description}`}
                  onSelect={() => handleSelect(item.href)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>

        {/* Footer com dicas */}
        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Use as setas para navegar</span>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
              <span>para selecionar</span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
