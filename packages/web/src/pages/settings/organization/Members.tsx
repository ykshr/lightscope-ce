import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useState } from 'react';
import { Props } from './type';

export default function Members({ org, me }: Props) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState('');
  const [updateError, setUpdateError] = useState('');

  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

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
      setInviteEmail('');
      setInviteRole('member');
    }
  };

  function clearErrors() {
    setInviteError('');
    setUpdateError('');
  }

  const handleUpdateRole = async (memberId: string, role: string) => {
    clearErrors();
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });
    if (error) {
      setUpdateError(error.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      clearErrors();
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (error) {
        setUpdateError(error.message || 'Failed to remove member');
      }
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      clearErrors();
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) {
        setUpdateError(error.message || 'Failed to cancel invitation');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage members for {org.name}. {!isAdmin && 'You need to be an admin to edit.'}
          </CardDescription>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={!isAdmin}>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {org.members.map((member) => (
              <MemberTableRow
                member={{
                  id: member.id,
                  email: member.user?.email || 'unknown email',
                  role: member.role,
                  status: 'member',
                }}
                isEditable={isAdmin}
                handleUpdateRole={handleUpdateRole}
                handleRemoveMember={handleRemoveMember}
              />
            ))}
            {org.invitations.map((invitation) => (
              <MemberTableRow
                member={{
                  id: invitation.id,
                  email: invitation.email,
                  role: invitation.role,
                  status: invitation.status,
                }}
                isEditable={isAdmin}
                handleRemoveMember={handleCancelInvitation}
              />
            ))}
          </TableBody>
        </Table>
        {inviteError && <span className="text-xs text-destructive">{inviteError}</span>}
        {updateError && <span className="text-xs text-destructive">{updateError}</span>}
      </CardContent>
    </Card>
  );
}

type Row = {
  member: { id: string; email: string; role: string; status: string };
  isEditable: boolean;
  handleUpdateRole?: (id: string, role: string) => void;
  handleRemoveMember?: (id: string) => void;
};

function MemberTableRow({ member, isEditable, handleUpdateRole, handleRemoveMember }: Row) {
  const { id, email, role, status } = member;
  const isMember = status === 'member';
  return (
    <TableRow key={id}>
      <TableCell>{email}</TableCell>
      <TableCell>
        <Select
          value={role}
          onValueChange={(val) => handleUpdateRole?.(id, val)}
          disabled={!isEditable || !handleUpdateRole}
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
      <TableCell>{status}</TableCell>
      <TableCell>
        <Button
          variant={isMember ? 'destructive' : 'outline'}
          size="sm"
          onClick={() => handleRemoveMember?.(id)}
          disabled={!isEditable || !handleRemoveMember}
        >
          {isMember ? 'Remove' : 'Cancel'}
        </Button>
      </TableCell>
    </TableRow>
  );
}
