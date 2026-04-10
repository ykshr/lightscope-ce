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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchDelete, fetchPost } from '@/helpers/fetch';
import useTrackers from '@/pages/settings/organization/useTrackers';
import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { Props } from './type';

export default function Trackers({ org, me }: Props) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

  const { trackers, reFetchTrackers } = useTrackers(org.id);

  const handleRemoveToken = async (tokenId: string) => {
    if (confirm('Are you sure you want to remove this token?')) {
      setError('');
      setIsLoading(true);
      setError('');
      try {
        await fetchDelete(`/tracker/${tokenId}`);
        reFetchTrackers();
      } catch (err: any) {
        setError(err || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tracker tokens</CardTitle>
          <CardDescription>
            Manage tracker tokens. {!isAdmin && 'You need to be an admin to edit.'}
          </CardDescription>
        </div>
        <NewTokenDialog name={org.name} isAdmin={isAdmin} reFetchTrackers={reFetchTrackers} />
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origin</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>IsActive</TableHead>
              <TableHead>CreatedAt</TableHead>
              <TableHead>ExpiresAt</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trackers.map(({ id, origin, token, createdAt, expiresAt }) => (
              <TableRow key={id}>
                <TableCell className="max-w-[150px] truncate sm:max-w-[200px]" title={origin}>
                  {origin}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="max-w-[150px] truncate text-left sm:max-w-[250px]"
                      dir="rtl"
                      title={token}
                    >
                      {token}&lrm;
                    </span>
                    <CopyTokenButton token={token} />
                  </div>
                </TableCell>
                <TableCell>
                  {isActive(expiresAt) ? <Check color="green" /> : <X color="red" />}
                </TableCell>
                <TableCell>{createdAt.toLocaleString()}</TableCell>
                <TableCell>{expiresAt?.toLocaleString() || 'Never'}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveToken(id)}
                    disabled={!isAdmin || isLoading}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  );
}

function isActive(expiresAt?: Date | null) {
  if (!expiresAt) return true;
  const now = new Date();
  return now < expiresAt;
}

function NewTokenDialog({
  name,
  isAdmin,
  reFetchTrackers,
}: {
  name: string;
  isAdmin: boolean;
  reFetchTrackers: () => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [origin, setOrigin] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload: any = { origin };
      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).toISOString();
      }
      await fetchPost('/tracker/generate', payload);
      setIsLoading(false);
      setOrigin('');
      setExpiresAt('');
      setError('');
      setShowDialog(false);
      reFetchTrackers();
    } catch (err: any) {
      setError(err || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!isAdmin}>
          New Token
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Token</DialogTitle>
          <DialogDescription>
            Generate a new token to {name}. Enter the exact origin (e.g., https://yourdomain.com)
            where your tracker will be installed. The generated token will only be valid for
            requests coming from this origin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleNewToken} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              placeholder="https://example.com"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expires At (Optional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Generate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CopyTokenButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex w-20 items-center">
      <Button
        variant="ghost"
        size={copied ? 'sm' : 'icon'}
        className={`h-6 ${copied ? 'px-2' : 'w-6'} transition-all duration-200`}
        onClick={handleCopy}
        title="Copy token"
      >
        {copied ? (
          <>
            <Check className="mr-1 size-3 shrink-0 text-green-500" />
            <span className="text-xs text-green-500">Copied</span>
          </>
        ) : (
          <Copy className="size-3 shrink-0 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
