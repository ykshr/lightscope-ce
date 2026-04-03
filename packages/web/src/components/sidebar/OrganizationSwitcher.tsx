import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import authClient from '@/helpers/auth';
import { ChevronsUpDown, Plus, AlertCircle } from 'lucide-react';

export default function OrganizationSwitcher() {
  const { isMobile } = useSidebar();
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgError, setOrgError] = useState<string | null>(null);

  const hasNoOrgs = !isPending && (!organizations || organizations.length === 0);

  const handleSetActiveOrg = async (organizationId: string | null) => {
    if (organizationId !== 'none' || organizationId != null) {
      await authClient.organization.setActive({ organizationId });
      return;
    }
    await authClient.organization.setActive({ organizationId: null });
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError(null);

    const { error } = await authClient.organization.create({
      name: orgName,
      slug: orgSlug || '',
    });
    if (error) {
      setOrgError(error.message || 'Failed to create organization');
      return;
    }

    setShowCreateDialog(false);
    setOrgName('');
    setOrgSlug('');
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <SidebarMenu>
        <SidebarMenuItem>
          {isPending ? (
            <SidebarMenuButton size="lg" disabled>
              <div className="grid flex-1 gap-1 text-left">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </SidebarMenuButton>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${hasNoOrgs ? 'border border-destructive/50 bg-destructive/10 hover:bg-destructive/20' : ''}`}
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {hasNoOrgs ? <AlertCircle className="size-4 text-destructive" /> : null}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {hasNoOrgs ? (
                      <>
                        <span className="truncate font-medium text-destructive">
                          未登録 (Unregistered)
                        </span>
                        <span className="truncate text-xs text-destructive/80">Please create an organization</span>
                      </>
                    ) : (
                      <>
                        <span className="truncate font-medium">
                          {activeOrganization?.name || 'Not selected'}
                        </span>
                        <span className="truncate text-xs">{activeOrganization?.metadata?.plan}</span>
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="start"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Organization
                </DropdownMenuLabel>
                {organizations?.map((org, index) => (
                  <DropdownMenuItem
                    key={org.name}
                    onClick={() => handleSetActiveOrg(org.id)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      {/* {<org.logo className="size-3.5 shrink-0" />} */}
                    </div>
                    {org.name}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DialogTrigger asChild>
                  <DropdownMenuItem className="gap-2 p-2" onSelect={(e) => e.preventDefault()}>
                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                      <Plus className="size-4" />
                    </div>
                    <div className="font-medium text-muted-foreground">Add Organization</div>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an Organization</DialogTitle>
          <DialogDescription>
            Enter the details for your new organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="orgName" className="text-sm font-medium">
              Organization Name
            </label>
            <Input
              id="orgName"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="My Organization"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="orgSlug" className="text-sm font-medium">
              Organization Slug (optional)
            </label>
            <Input
              id="orgSlug"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="my-organization"
            />
          </div>
          {orgError && <div className="text-sm text-destructive">{orgError}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
