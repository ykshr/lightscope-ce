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

interface Props {
  org: {
    name: string;
    slug: string;
    id: string;
  };
}

export default function General({ org }: Props) {
  const [newName, setNewName] = useState(org.name);
  const [newSlug, setNewSlug] = useState(org.slug || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isChanged = newName !== org.name || newSlug !== (org.slug || '');

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    const { error } = await authClient.organization.update({
      organizationId: org.id,
      data: { name: newName, slug: newSlug || undefined },
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
              <TableHead>Display Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </TableCell>
              <TableCell>
                <Input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="Slug"
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  <Button size="sm" disabled={!isChanged || isUpdating} onClick={handleUpdate}>
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
