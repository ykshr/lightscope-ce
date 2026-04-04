import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import authClient from '@/helpers/auth';
import { Building, ChevronsUpDown } from 'lucide-react';

export default function Organization() {
  const { isMobile } = useSidebar();
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSetActiveOrg = async (organizationId: string | null) => {
    if (organizationId !== 'none' || organizationId != null) {
      await authClient.organization.setActive({ organizationId });
      return;
    }
    await authClient.organization.setActive({ organizationId: null });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isPending ? (
          <SidebarMenuButton disabled>
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="py-5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Building className="size-4" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate">{activeOrganization?.name || 'Not selected'}</span>
                  <span className="truncate text-xs">
                    {activeOrganization?.metadata?.plan || 'free'}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="end"
              side={isMobile ? 'top' : 'right'}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organization
              </DropdownMenuLabel>
              {organizations?.map((org) => (
                <DropdownMenuItem
                  key={org.name}
                  onClick={() => handleSetActiveOrg(org.id)}
                  className="gap-2 p-2"
                >
                  {org.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
