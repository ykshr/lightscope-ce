import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import authClient from '@/helpers/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SingUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgError, setOrgError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSingUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await authClient.signUp.email({ name: email, email, password });
    if (error) {
      setError(error.message || 'SingUp failed');
      return;
    }

    const orgs = await authClient.organization.list();

    if (orgs.data && orgs.data.length > 0) {
      // If the user already has an organization (e.g. from an invite), redirect to dashboard
      navigate('/');
    } else {
      // If no organization, show the create organization dialog
      setShowOrgDialog(true);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError(null);

    const { error } = await authClient.organization.create({
      name: orgName,
      slug: orgSlug || '',
    });
    if (error) {
      setOrgError(error.message || 'Failed to create organization');
      return;
    }

    setShowOrgDialog(false);
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SingUp</h1>
          <p className="text-muted-foreground text-sm">Create an account for LightScope</p>
        </div>

        <form onSubmit={handleSingUp} className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="text-primary hover:underline">
            Login
          </button>
        </div>
      </div>

      <Dialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
        {showOrgDialog && <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Create an Organization</DialogTitle>
            <DialogDescription>
              Get started by creating your first organization. You can invite members later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="orgName"
              >
                Organization Name
              </label>
              <Input
                id="orgName"
                placeholder="My Organization"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="orgSlug"
              >
                Organization Slug (Optional)
              </label>
              <Input
                id="orgSlug"
                placeholder="my-organization"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
              />
            </div>

            {orgError && <div className="text-sm text-destructive">{orgError}</div>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Skip for now
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>}
      </Dialog>
    </div>
  );
}
