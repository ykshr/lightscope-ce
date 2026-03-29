import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  List,
  LogOut,
  Newspaper,
  Settings,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import authClient from '@/helpers/auth';
import SettingsDialog from './user/Settings';
const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: organizations, isPending: isOrganizationsPending } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSetActiveOrg = async (organizationId: string) => {
    if (organizationId === 'none') {
      await authClient.organization.setActive({ organizationId: null });
    } else {
      await authClient.organization.setActive({ organizationId });
    }
  };

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
            <img src="/LittleScope_logo.png" alt="LittleScope Logo" className="w-7 h-7" />
          </a>
          {isOpen && (
            <h1 className="text-base font-bold leading-tight tracking-tight">LittleScope</h1>
          )}
        </div>
        <nav className="flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="Overview" href="/" isOpen={isOpen} />
          <SidebarItem icon={List} label="Ranking" href="/ranking" isOpen={isOpen} />
          <SidebarItem icon={Newspaper} label="Article" href="/article" isOpen={isOpen} />
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {isOpen ? (
          <div className="px-2">
            <Field>
              <FieldLabel>Organization</FieldLabel>
              <Select value={activeOrganization?.id || 'none'} onValueChange={handleSetActiveOrg}>
                <SelectTrigger className="w-full h-8 text-xs border-none shadow-none focus:ring-0 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(organizations || []).map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        ) : null}

        <div
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <Settings size={18} />
          {isOpen && <p className="text-sm font-medium leading-normal">Settings</p>}
        </div>

        <div
          onClick={async () => {
            await authClient.signOut();
            window.location.href = '/singin';
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          <LogOut size={18} />
          {isOpen && <p className="text-sm font-medium leading-normal">Log out</p>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`relative border-r border-border ${isOpen ? 'w-50' : 'w-20'}`}>
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
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
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
