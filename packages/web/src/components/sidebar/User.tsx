import NewOrganizationDialog from '@/components/sidebar/NewOrganizationDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useSession } from '@/hooks/useAuth';
import { ChevronsUpDown, Plus, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function User() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { data: session, isPending: isPendingSession } = useSession();
  const user = session?.user;
  const { data: organizations, isPending: isPendingOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleSetActiveOrg = async (organizationId: string | null) => {
    if (!organizationId) return;
    await authClient.organization.setActive({ organizationId });
  };

  const isPending = isPendingSession || isPendingOrganizations;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          {isPending ? (
            <SidebarMenuButton disabled className="py-6">
              <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
              <div className="grid flex-1 gap-1 text-left">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </SidebarMenuButton>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="py-5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <UserIcon className="shrink-0" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate">{user?.name}</span>
                    <span className="truncate text-xs">{activeOrganization?.name}</span>
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
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Organization</DropdownMenuLabel>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Active</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup
                          value={activeOrganization?.id}
                          onValueChange={handleSetActiveOrg}
                        >
                          {organizations?.map((org) => (
                            <DropdownMenuRadioItem value={org.id}>{org.name}</DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                        {organizations?.length === 0 && (
                          <DropdownMenuItem>
                            <div>No organizations found</div>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setOpenAddDialog(true)}>
                          <Plus className="size-4" />
                          <div>Add new organization</div>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem onSelect={() => navigate('/settings/organization')}>
                    <div>Settings</div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Profile</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => navigate('/settings/profile')}>
                    <div>Settings</div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      <NewOrganizationDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
    </>
  );
}
