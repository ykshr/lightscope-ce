import { SidebarTrigger } from '@/components/ui/sidebar';
import { ReactNode } from 'react';

interface HeaderProps {
  children: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  return (
    <header className="flex-none px-6 py-5 border-b">
      <div className="w-full flex items-center justify-between gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
