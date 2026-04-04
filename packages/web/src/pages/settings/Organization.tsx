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

export default function Organization() {
  // Organization hooks
  const { data: activeOrganization, isPending: isActiveOrganizationPending } =
    authClient.useActiveOrganization();

  return (
    <div className="space-y-10">
      {isActiveOrganizationPending && <div>Loading organization...</div>}
      {!isActiveOrganizationPending && (
        <>
          <General org={activeOrganization} />
          <Members org={activeOrganization} />
          <Trackers org={activeOrganization} />
          <DangerZone org={activeOrganization} />
        </>
      )}
    </div>
  );
}

function General(org: any) {
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
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>General settings for your organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {org ? (
              <TableRow>
                <TableCell>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </TableCell>
                <TableCell>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Slug"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 items-center">
                    <Button size="sm" disabled={!isChanged || isUpdating} onClick={handleUpdate}>
                      Save
                    </Button>
                    {error && <span className="text-xs text-destructive">{error}</span>}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Members(org: any) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState('');
  const { members, isPending: isMembersPending, reFetchMembers } = useFetchMembers(org.id);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>Manage members for {org.name}.</CardDescription>
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
              <DialogDescription>Invite a new member to {org.name}.</DialogDescription>
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
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
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
  );
}

function Trackers(org: any) {
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

  return (
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
  );
}

function DangerZone(org: any) {
  const handleDeleteOrg = async () => {
    if (!org?.id) return;
    if (
      confirm('Are you sure you want to delete this organization? This action cannot be undone.')
    ) {
      const { error } = await authClient.organization.delete({
        organizationId: org.id,
      });
      if (error) {
        alert(error.message || 'Failed to delete organization');
      } else {
        await authClient.organization.setActive({ organizationId: null });
      }
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible organization actions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-md">
          <div>
            <p className="font-medium text-sm text-destructive">Delete organization</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete this organization and all data.
            </p>
          </div>
          <Button variant="destructive" onClick={handleDeleteOrg}>
            Delete Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
