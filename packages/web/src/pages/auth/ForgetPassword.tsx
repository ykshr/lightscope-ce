import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authClient from '@/helpers/auth';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message || 'Failed to request password reset');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Forget Password</h1>
          <p className="text-muted-foreground text-sm">Enter your email to reset your password</p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="text-sm text-green-500 text-center">
              A password reset link has been sent to your email.
            </div>
            <Button className="w-full" asChild>
              <Link to="/singin">Back to Sign In</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
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

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Request Reset Link
            </Button>
          </form>
        )}

        <div className="text-center text-sm">
          Remember your password?{' '}
          <Link to="/singin" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
