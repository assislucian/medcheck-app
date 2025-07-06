import React from 'react';
import { Button } from './button';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '../../contexts/SidebarContext';

interface SidebarTriggerWrapperProps extends React.ComponentProps<typeof Button> {
  className?: string;
}

export const SidebarTriggerWrapper = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarTriggerWrapperProps
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebarContext();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});

SidebarTriggerWrapper.displayName = 'SidebarTriggerWrapper';
