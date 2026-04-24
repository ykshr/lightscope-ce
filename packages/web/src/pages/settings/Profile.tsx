import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import authClient from '@/helpers/auth';
import { useSession } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const user = session?.user;

  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const isChanged = newName !== user?.name;

  const handleUpdate = async () => {
    setIsUpdating(true);
    setError('');
    const { error } = await authClient.updateUser({
      name: newName,
    });
    if (error) {
      setError(error.message || 'Failed to update');
    }
    setIsUpdating(false);
  };

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/signin';
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Assuming a standard delete endpoint or method. If not present, this is a placeholder UI.
      alert('Delete account logic to be implemented. (e.g., authClient.deleteUser())');
    }
  };

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Manage your personal settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (readonly)</Label>
            <Input id="email" value={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              readOnly={isUpdating}
            />
          </div>
          <div className="flex gap-2 items-center justify-end">
            <Button size="sm" disabled={!isChanged || isUpdating} onClick={handleUpdate}>
              Save
            </Button>
          </div>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Manage your preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 pt-4">
            <Label>Theme</Label>
            <Select
              value={theme}
              onValueChange={(val: 'system' | 'light' | 'dark') => setTheme(val)}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Account actions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border rounded-md">
            <div>
              <p className="font-medium text-sm">Log out of account</p>
              <p className="text-xs text-muted-foreground">Sign out of this browser.</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-md">
            <div>
              <p className="font-medium text-sm text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
