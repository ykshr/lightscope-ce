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

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  const user = session?.user;

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
          <CardTitle>My Profile</CardTitle>
          <CardDescription>Manage your personal settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input id="displayName" defaultValue={user?.name || ''} readOnly />
            <p className="text-xs text-muted-foreground">
              Name change functionality requires backend support.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email || ''} readOnly />
          </div>
          <div className="space-y-2 pt-4">
            <Label>Theme Preference</Label>
            <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
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
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
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
