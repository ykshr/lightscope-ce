import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import authClient from '@/helpers/auth';
import { Building, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Organization() {
  const { isMobile } = useSidebar();
  const { data: organizations, isPending } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleSetActiveOrg = async (organizationId: string | null) => {
    await authClient.organization.setActive({ organizationId });
  };

  return (
    <>
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
                    <span className="truncate text-xs">{activeOrganization?.metadata?.plan}</span>
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
                    key={org.id}
                    onClick={() => handleSetActiveOrg(org.id)}
                    className="gap-2 p-2"
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem className="gap-2 p-2" onSelect={() => setOpenAddDialog(true)}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add Organization</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarMenuItem>
      </SidebarMenu>

      <AddOrganizationDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
    </>
  );
}

function AddOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await authClient.organization.create({ name, slug });
    if (error) {
      setError(error.message || 'Failed to create organization');
      return;
    }

    setName('');
    setSlug('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="slug">
              Slug (Unique ID)
            </label>
            <Input
              id="slug"
              placeholder="my-organization"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Display Name
            </label>
            <Input
              id="name"
              placeholder="My Organization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
