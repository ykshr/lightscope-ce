import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import ResponsiveModal from '@/components/common/ResponsiveModal';
import Settings from '@/components/sidebar/Settings';
import authClient from '@/helpers/auth';

export default function User() {
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const fallbackString = !isPending && user?.email ? getAvatarFallback(user.email) : '';

  // const signOut = async () => {
  //   await authClient.signOut();
  //   window.location.href = '/singin';
  // };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {isPending || !user?.email ? (
            <SidebarMenuButton size="lg" disabled>
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 gap-1 text-left">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </SidebarMenuButton>
          ) : (
            <ResponsiveModal
              trigger={
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  onClick={() => setOpen(true)}
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{fallbackString}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </SidebarMenuButton>
              }
              title="Settings"
              description="Open settings menu"
              open={open}
              onOpenChange={setOpen}
            >
              <Settings />
            </ResponsiveModal>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}

const getAvatarFallback = (email?: string | null) => {
  if (!email) return;

  const namePart = email.split('@')[0];

  const parts = namePart.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return namePart.substring(0, 2).toUpperCase();
};
