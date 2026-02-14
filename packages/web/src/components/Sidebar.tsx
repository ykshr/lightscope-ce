import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  List,
  Newspaper,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');

    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (!e.matches) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleMediaChange(mql);

    mql.addEventListener('change', handleMediaChange);
    return () => mql.removeEventListener('change', handleMediaChange);
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <a href="/">
            <img
              src="/LittleScope_logo.png"
              alt="LittleScope Logo"
              className="w-7 h-7"
            />
          </a>
          {isOpen && (
            <h1 className="text-base font-bold leading-tight tracking-tight">
              LittleScope
            </h1>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem
            icon={LayoutDashboard}
            label="Overview"
            href="/"
            isOpen={isOpen}
          />
          <SidebarItem
            icon={List}
            label="Ranking"
            href="/ranking"
            isOpen={isOpen}
          />
          <SidebarItem
            icon={Newspaper}
            label="Article"
            href="/article"
            isOpen={isOpen}
          />
          <SidebarItem
            icon={Settings}
            label="Settings"
            href="/settings"
            isOpen={isOpen}
          />
        </nav>
      </div>
      <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer">
        <LogOut size={18} />
        {isOpen && (
          <p className="text-sm font-medium leading-normal">Log out</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`relative border-r border-border ${isOpen ? 'w-50' : 'w-20'}`}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-10 z-50 h-6 w-6 rounded-full border bg-background"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </Button>
        <SidebarContent />
      </aside>
    </>
  );
};

const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isOpen,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  href: string;
  isOpen: boolean;
}) => {
  const active = window.location.pathname === href;
  return (
    <a
      className={`flex items-center gap-3 px-3 py-3 rounded-lg
        ${
          active
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      href={href}
    >
      <Icon size={18} />
      {isOpen && <span className="text-sm font-medium">{label}</span>}
    </a>
  );
};
export default Sidebar;
