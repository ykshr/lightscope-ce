import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authClient from '@/helpers/auth';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    if (!token) {
      setError('Invalid or missing reset token.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      setError(error.message || 'Failed to reset password');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="text-sm text-green-500 text-center">
              Your password has been successfully reset.
            </div>
            <Button className="w-full" asChild>
              <Link to="/singin">Go to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="newPassword"
              >
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="confirmPassword"
              >
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" disabled={!token} isLoading={isLoading}>
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
