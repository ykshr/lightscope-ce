import { TeamSwitcher } from '@/components/OrganizationSwitcher';
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
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  List,
  Newspaper,
} from 'lucide-react';
import * as React from 'react';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
};

function SidebarItem(item: { href: string; icon: React.ElementType; name: string }) {
  const isActive = window.location.pathname === item.href;
  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <a href={item.href}>
        <item.icon />
        <span>{item.name}</span>
      </a>
    </SidebarMenuButton>
  );
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
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
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
