import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
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
  const [error, setError] = useState('');
  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

  const handleUpdateRole = async (memberId: string, role: string) => {
    setError('');
    const { error } = await authClient.organization.updateMemberRole({
      memberId,
      role,
    });
    if (error) {
      setError(error.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      setError('');
      const { error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberId,
      });
      if (error) {
        setError(error.message || 'Failed to remove member');
      }
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (confirm('Are you sure you want to cancel this invitation?')) {
      setError('');
      const { error } = await authClient.organization.cancelInvitation({
        invitationId,
      });
      if (error) {
        setError(error.message || 'Failed to cancel invitation');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Manage members. {!isAdmin && 'You need to be an admin to edit.'}
          </CardDescription>
        </div>
        <InviteDialog name={org.name} isAdmin={isAdmin} />
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
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}

function InviteDialog({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'owner'>('member');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error } = await authClient.organization.inviteMember({ email, role });
    if (!error) {
      setEmail('');
      setRole('member');
      setShowDialog(false);
    } else {
      setError(error.message || 'An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!isAdmin}>
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>Invite a new member to {name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteEmail">Email</Label>
            <Input
              id="inviteEmail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteRole">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as 'member' | 'admin' | 'owner')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
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
