import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import authClient from '@/helpers/auth';
import { Props } from './type';

export default function DangerZone({ org }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteOrg = async () => {
    if (!org?.id) return;
    if (
      confirm('Are you sure you want to delete this organization? This action cannot be undone.')
    ) {
      setIsDeleting(true);
      const { error } = await authClient.organization.delete({
        organizationId: org.id,
      });
      if (error) {
        alert(error.message || 'Failed to delete organization');
        setIsDeleting(false);
      } else {
        await authClient.organization.setActive({ organizationId: null });
        setIsDeleting(false);
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
          <Button variant="destructive" onClick={handleDeleteOrg} isLoading={isDeleting}>
            Delete Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
