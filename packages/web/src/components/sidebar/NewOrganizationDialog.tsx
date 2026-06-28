import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import authClient from '@/helpers/auth';
import { useState } from 'react';

export default function NewOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const uuid = crypto.randomUUID();
    const { error } = await authClient.organization.create({ name, slug: uuid });

    setIsLoading(false);
    if (error) {
      setError(error.message || 'Failed to create organization');
      return;
    }

    setName('');
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
            <label className="text-sm font-medium" htmlFor="name">
              Display Name
            </label>
            <Input
              id="name"
              data-testid="org-name-input"
              placeholder="My Organization"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} data-testid="create-org-btn">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
