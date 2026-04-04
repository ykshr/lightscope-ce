import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
      data: { name: newName, slug: org.slug },
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
          General settings for {org.name}. {!isAdmin && 'You need to be an admin to edit.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={!isAdmin || isUpdating}
                />
              </TableCell>
              <TableCell>
                <Input value={org.slug} disabled />
              </TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    disabled={!isAdmin || !isChanged || isUpdating}
                    onClick={handleUpdate}
                  >
                    Save
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}
