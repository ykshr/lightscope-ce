import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const [origin, setOrigin] = useState('');
  const [generatedSnippet, setGeneratedSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateToken = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedSnippet('');

    try {
      const response = await fetch('/api/token/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ origin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate token');
      }

      const { token } = await response.json();

      const snippet = `<script defer src="http://localhost:3001/static/tracker.js" data-host="http://localhost:3001" data-token="${token}"></script>`;
      setGeneratedSnippet(snippet);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSnippet);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your website configuration and tracking snippets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Tracker Snippet</CardTitle>
          <CardDescription>
            Enter the exact origin (e.g., https://yourdomain.com) where your tracker will be
            installed. The generated token will only be valid for requests coming from this origin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Authorized Origin</Label>
            <Input
              id="origin"
              placeholder="https://example.com"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>

          {generatedSnippet && (
            <div className="space-y-2 pt-4">
              <Label>Your Tracker Snippet</Label>
              <div className="relative">
                <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                  <code>{generatedSnippet}</code>
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOrigin('')} disabled={isLoading}>
            Clear
          </Button>
          {generatedSnippet ? (
            <Button onClick={copyToClipboard}>Copy Snippet</Button>
          ) : (
            <Button onClick={generateToken} disabled={!origin || isLoading}>
              {isLoading ? 'Generating...' : 'Generate JWT Snippet'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
