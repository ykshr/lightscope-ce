import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/helpers/auth/betterAuth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SingUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSingUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) {
      setError(error.message || 'SingUp failed');
    } else {
      // Reload or navigate to dashboard. Better auth signs you in automatically.
      window.location.href = '/';
    }
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
              htmlFor="name"
            >
              Name
            </label>
            <Input
              id="name"
              placeholder="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
    </div>
  );
}
