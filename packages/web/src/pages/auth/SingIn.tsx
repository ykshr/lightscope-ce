import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import authClient from '@/helpers/auth';
import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface AuthContext {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

export default function SingIn() {
  const { email, setEmail } = useOutletContext<AuthContext>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSingIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setError(error.message || 'SingIn failed');
      return;
    }

    window.location.href = '/';
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
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{' '}
          <button onClick={() => navigate('/signup')} className="text-primary hover:underline">
            SingUp
          </button>
        </div>
      </div>
    </div>
  );
}
