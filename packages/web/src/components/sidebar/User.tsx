import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import authClient from '@/helpers/auth';
import { UserIcon } from 'lucide-react';

export default function User() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isPending || !user?.email ? (
          <SidebarMenuButton disabled className="py-6">
            <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        ) : (
          <SidebarMenuButton asChild className="py-6">
            <a href="/settings" className="flex items-center gap-3 w-full">
              <UserIcon className="shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </a>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
