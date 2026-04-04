import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROXY_URL } from '@/helpers/env';
import { fetchPost } from '@/helpers/fetch';
import { useState } from 'react';
import { Props } from './type';

export default function Trackers({}: Props) {
  const [origin, setOrigin] = useState('');
  const [generatedSnippet, setGeneratedSnippet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateToken = async () => {
    setIsLoading(true);
    setError('');
    setGeneratedSnippet('');

    try {
      const { token } = await fetchPost('/tracker/generate', { origin });
      const snippet = `<script defer src="${PROXY_URL}/static/tracker.js" data-host="${PROXY_URL}" data-token="${token}"></script>`;
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
  );
}
