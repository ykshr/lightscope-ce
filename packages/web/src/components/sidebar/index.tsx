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
  SidebarRail,
} from '@/components/ui/sidebar';

import OrganizationSwitcher from '@/components/sidebar/OrganizationSwitcher';
import User from '@/components/sidebar/User';

function SidebarItem(item: { href: string; icon: React.ElementType; name: string }) {
  const isActive = window.location.pathname === item.href;
  return (
    <SidebarMenuButton asChild isActive={isActive} className="py-5">
      <a href={item.href}>
        <item.icon />
        <span>{item.name}</span>
      </a>
    </SidebarMenuButton>
  );
}

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <OrganizationSwitcher />
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
        <User />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
