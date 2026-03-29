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
import { fetchPost } from '@/helpers/fetch';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

function ProfileTab() {
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/signin';
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Assuming a standard delete endpoint or method. If not present, this is a placeholder UI.
      alert('Delete account logic to be implemented. (e.g., authClient.deleteUser())');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Manage your personal settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" defaultValue={user?.name || ''} readOnly />
            <p className="text-xs text-muted-foreground">
              Name change functionality requires backend support.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2 pt-4">
            <Label>Theme Preference</Label>
            <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border rounded-md">
            <div>
              <p className="font-medium text-sm">Log out of account</p>
              <p className="text-xs text-muted-foreground">Sign out of this browser.</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-md">
            <div>
              <p className="font-medium text-sm text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsDialog({}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
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
      const snippet = `<script defer src="http://localhost:3001/static/tracker.js" data-host="http://localhost:3001" data-token="${token}"></script>`;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const { data: organizations, isPending: isOrganizationsPending } =
    authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [isMembersPending, setIsMembersPending] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!activeOrganization) {
        setMembers([]);
        return;
      }
      setIsMembersPending(true);
      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId: activeOrganization.id,
        },
      });
      if (data && !error) {
        setMembers(data.members || []);
      }
      setIsMembersPending(false);
    }
    fetchMembers();
  }, [activeOrganization?.id, refreshTrigger]);

  // Update organization state
  const [showUpdateOrgDialog, setShowUpdateOrgDialog] = useState(false);
  const [updateOrgName, setUpdateOrgName] = useState('');
  const [updateOrgSlug, setUpdateOrgSlug] = useState('');
  const [orgUpdateError, setOrgUpdateError] = useState('');

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgUpdateError('');
    if (!activeOrganization) return;
    const { error } = await authClient.organization.update({
      organizationId: activeOrganization.id,
      data: {
        name: updateOrgName,
        slug: updateOrgSlug || undefined,
      },
    });
    if (error) {
      setOrgUpdateError(error.message || 'Failed to update organization');
    } else {
      setShowUpdateOrgDialog(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!activeOrganization) return;
    if (
      confirm('Are you sure you want to delete this organization? This action cannot be undone.')
    ) {
      const { error } = await authClient.organization.delete({
        organizationId: activeOrganization.id,
      });
      if (error) {
        alert(error.message || 'Failed to delete organization');
      } else {
        await authClient.organization.setActive({ organizationId: null });
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
      triggerRefresh();
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (!error) triggerRefresh();
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });
    if (!error) triggerRefresh();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="flex flex-col md:flex-row gap-6 w-full"
      >
        <TabsList className="flex-col h-auto items-start justify-start gap-2 w-full md:w-48 bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="w-full justify-start text-left data-[state=active]:bg-muted"
          >
            My Profile
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className="w-full justify-start text-left data-[state=active]:bg-muted"
          >
            Organization
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="w-full justify-start text-left data-[state=active]:bg-muted"
          >
            Members
          </TabsTrigger>
          <TabsTrigger
            value="tracker"
            className="w-full justify-start text-left data-[state=active]:bg-muted"
          >
            Tracker Snippet
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 w-full min-w-0">
          <TabsContent value="profile" className="m-0 border-0 p-0">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="organization" className="m-0 border-0 p-0">
            {/* Organization Management Card Start */}
            <Card>
              <CardHeader>
                <CardTitle>Organization Management</CardTitle>
                <CardDescription>Manage your organizations and active workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Active Organization</Label>
                  {isOrganizationsPending ? (
                    <div>Loading organizations...</div>
                  ) : (
                    <Select
                      value={activeOrganization?.id || 'none'}
                      onValueChange={handleSetActiveOrg}
                    >
                      <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations?.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUpdateOrgName(activeOrganization?.name || '');
                      setUpdateOrgSlug(activeOrganization?.slug || '');
                      setShowUpdateOrgDialog(true);
                    }}
                  >
                    Edit Organization
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteOrg}>
                    Delete Organization
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
                  <DialogTrigger asChild>
                    <Button>Create Organization</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create an Organization</DialogTitle>
                      <DialogDescription>
                        Enter the details for your new organization.
                      </DialogDescription>
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
                      {orgCreateError && (
                        <div className="text-sm text-destructive">{orgCreateError}</div>
                      )}
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
            <Dialog open={showUpdateOrgDialog} onOpenChange={setShowUpdateOrgDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Organization</DialogTitle>
                  <DialogDescription>Modify your organization details.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateOrg} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="updateOrgName">Name</Label>
                    <Input
                      id="updateOrgName"
                      required
                      value={updateOrgName}
                      onChange={(e) => setUpdateOrgName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="updateOrgSlug">Slug (optional)</Label>
                    <Input
                      id="updateOrgSlug"
                      value={updateOrgSlug}
                      onChange={(e) => setUpdateOrgSlug(e.target.value)}
                    />
                  </div>
                  {orgUpdateError && (
                    <div className="text-sm text-destructive">{orgUpdateError}</div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUpdateOrgDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Update</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="members" className="m-0 border-0 p-0">
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
                        {inviteError && (
                          <div className="text-sm text-destructive">{inviteError}</div>
                        )}
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
          </TabsContent>
          <TabsContent value="tracker" className="m-0 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Generate Tracker Snippet</CardTitle>
                <CardDescription>
                  Enter the exact origin (e.g., https://yourdomain.com) where your tracker will be
                  installed. The generated token will only be valid for requests coming from this
                  origin.
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
