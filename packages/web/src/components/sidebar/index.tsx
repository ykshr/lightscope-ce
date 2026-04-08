import { LayoutDashboard, List, Newspaper } from 'lucide-react';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

import OrganizationSwitcher from '@/components/sidebar/Organization';
import User from '@/components/sidebar/User';

function SidebarItem(item: { href: string; icon: React.ElementType; name: string }) {
  const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} className="py-5">
        <Link to={item.href}>
          <item.icon />
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export default function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`flex items-center gap-3 px-2 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/LittleScope_logo.png"
              alt="LittleScope Logo"
              className="min-w-7 w-7 h-7 object-contain"
            />
          </Link>
          {!isCollapsed && (
            <h1 className="text-base font-bold leading-tight tracking-tight whitespace-nowrap overflow-hidden">
              LittleScope
            </h1>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarItem href="/" icon={LayoutDashboard} name="Overview" />
            <SidebarItem href="/ranking" icon={List} name="Ranking" />
            <SidebarItem href="/article" icon={Newspaper} name="Article" />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <OrganizationSwitcher />
        <User />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
