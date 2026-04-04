import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import authClient from '@/helpers/auth';
import { PROXY_URL } from '@/helpers/env';
import { fetchPost } from '@/helpers/fetch';
import { useState } from 'react';
import useFetchMembers from './useFetchMembers';

function OrganizationRow({ org, isActive, onSetActive, onDelete }: any) {
  const [name, setName] = useState(org.name);
  const [slug, setSlug] = useState(org.slug || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isChanged = name !== org.name || slug !== (org.slug || '');

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    const { error } = await authClient.organization.update({
      organizationId: org.id,
      data: { name, slug: slug || undefined },
    });
    if (error) {
      setError(error.message || 'Failed to update');
    }
    setIsUpdating(false);
  };

  return (
    <TableRow>
      <TableCell>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSetActive(org.id)}
          disabled={isActive}
        >
          {isActive ? 'Active' : 'Set Active'}
        </Button>
      </TableCell>
      <TableCell>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </TableCell>
      <TableCell>
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2 items-center">
          {error && <span className="text-xs text-destructive">{error}</span>}
          <Button size="sm" disabled={!isChanged || isUpdating} onClick={handleUpdate}>
            Save
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(org.id)}>
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function Organization() {
  const [origin, setOrigin] = useState('');
  const [generatedSnippet, setGeneratedSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateToken = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedSnippet('');

    try {
      const { token } = await fetchPost('/tracker/generate', { origin });
      const snippet = `<script defer src="${PROXY_URL}/static/tracker.js" data-host="${PROXY_URL}" data-token="${token}"></script>`;
      setGeneratedSnippet(snippet);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSnippet);
  };

  // Organization hooks
  const { data: organizations, isPending: isOrganizationsPending } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const {
    members,
    isPending: isMembersPending,
    reFetchMembers,
  } = useFetchMembers(activeOrganization?.id);

  const handleDeleteOrg = async (orgId: string) => {
    if (
      confirm('Are you sure you want to delete this organization? This action cannot be undone.')
    ) {
      const { error } = await authClient.organization.delete({
        organizationId: orgId,
      });
      if (error) {
        alert(error.message || 'Failed to delete organization');
      } else {
        // If we deleted the active organization, set active to null
        if (activeOrganization?.id === orgId) {
          await authClient.organization.setActive({ organizationId: null });
        }
      }
    }
  };

  // Create organization state
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgCreateError, setOrgCreateError] = useState('');

  // Invite member state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState('');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgCreateError('');
    const { error } = await authClient.organization.create({
      name: orgName,
      slug: orgSlug || '',
    });
    if (error) {
      setOrgCreateError(error.message || 'Failed to create organization');
    } else {
      setShowCreateOrgDialog(false);
      setOrgName('');
      setOrgSlug('');
    }
  };

  const handleSetActiveOrg = async (organizationId: string) => {
    if (organizationId === 'none') {
      await authClient.organization.setActive({ organizationId: null });
    } else {
      await authClient.organization.setActive({ organizationId });
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    const { error } = await authClient.organization.inviteMember({
      email: inviteEmail,
      role: inviteRole as 'member' | 'admin' | 'owner',
    });
    if (error) {
      setInviteError(error.message || 'Failed to invite member');
    } else {
      setShowInviteDialog(false);
      reFetchMembers();
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (!error) reFetchMembers();
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });
    if (!error) reFetchMembers();
  };

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Organization Management</CardTitle>
          <CardDescription>Manage your organizations and active workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {isOrganizationsPending ? (
            <div>Loading organizations...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations?.map((org) => (
                  <OrganizationRow
                    key={org.id}
                    org={org}
                    isActive={activeOrganization?.id === org.id}
                    onSetActive={handleSetActiveOrg}
                    onDelete={handleDeleteOrg}
                  />
                ))}
                {organizations?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No organizations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
            <DialogTrigger asChild>
              <Button>Create Organization</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create an Organization</DialogTitle>
                <DialogDescription>Enter the details for your new organization.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Name</Label>
                  <Input
                    id="orgName"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Slug (optional)</Label>
                  <Input
                    id="orgSlug"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                  />
                </div>
                {orgCreateError && <div className="text-sm text-destructive">{orgCreateError}</div>}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateOrgDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      {activeOrganization && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage members for {activeOrganization.name}.</CardDescription>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to {activeOrganization.name}.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">Email</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteError && <div className="text-sm text-destructive">{inviteError}</div>}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Invite</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {isMembersPending ? (
              <div>Loading members...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members?.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(val) => handleUpdateRole(member.id, val)}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {members?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No members found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generate Tracker Snippet</CardTitle>
          <CardDescription>
            Enter the exact origin (e.g., https://yourdomain.com) where your tracker will be
            installed. The generated token will only be valid for requests coming from this origin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Authorized Origin</Label>
            <Input
              id="origin"
              placeholder="https://example.com"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>

          {generatedSnippet && (
            <div className="space-y-2 pt-4">
              <Label>Your Tracker Snippet</Label>
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                  <code>{generatedSnippet}</code>
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOrigin('')} disabled={isLoading}>
            Clear
          </Button>
          {generatedSnippet ? (
            <Button onClick={copyToClipboard}>Copy Snippet</Button>
          ) : (
            <Button onClick={generateToken} disabled={!origin || isLoading}>
              {isLoading ? 'Generating...' : 'Generate JWT Snippet'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
