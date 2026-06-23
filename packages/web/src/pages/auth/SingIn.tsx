import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import authClient from '@/helpers/auth';
import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

interface AuthContext {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

export default function SingIn() {
  const { email, setEmail } = useOutletContext<AuthContext>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSingIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message || 'SingIn failed');
      setIsLoading(false);
      return;
    }

    const { data: organizations } = await authClient.organization.list();
    if (organizations && organizations.length > 0) {
      await authClient.organization.setActive({
        organizationId: organizations[0].id,
      });
    }

    window.location.href = '/';
  };

  const handleSocialSignIn = async (provider: 'google' | 'apple' | 'microsoft') => {
    setError(null);
    const { error } = await authClient.signIn.social({ provider, callbackURL: '/' });
    if (error) {
      setError(error.message || `Sign in with ${provider} failed`);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">SingIn</h1>
          <p className="text-muted-foreground text-sm">Welcome back to LightScope</p>
        </div>

        <form onSubmit={handleSingIn} className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              htmlFor="email"
            >
              Email
            </label>
            <Input
              data-testid="email-input"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor="password"
              >
                Password
              </label>
              <Link to="/forget-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              data-testid="password-input"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button data-testid="submit-btn" type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2" /> : null}
            Sign In
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn('google')}
          >
            Sign in with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn('apple')}
          >
            Sign in with Apple
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleSocialSignIn('microsoft')}
          >
            Sign in with Microsoft
          </Button>
        </div>

        <div className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline">
            SingUp
          </Link>
        </div>
      </div>
    </div>
  );
}
