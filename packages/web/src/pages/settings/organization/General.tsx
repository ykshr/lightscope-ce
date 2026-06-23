import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import authClient from '@/helpers/auth';
import { useState } from 'react';
import { Props } from './type';

export default function General({ org, me }: Props) {
  const [newName, setNewName] = useState(org.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

  const isChanged = newName !== org.name;

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    const { error } = await authClient.organization.update({
      organizationId: org.id,
      data: { name: newName },
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
        <CardDescription>
          General settings. {!isAdmin && 'You need to be an admin to edit.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="slug">ID (readonly)</Label>
          <Input id="slug" value={org.slug} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            readOnly={!isAdmin || isUpdating}
          />
        </div>
        <div className="flex gap-2 items-center justify-end">
          <Button size="sm" disabled={!isAdmin || !isChanged || isUpdating} onClick={handleUpdate}>
            {isUpdating && <Spinner className="mr-2" />}
            Save
          </Button>
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}
