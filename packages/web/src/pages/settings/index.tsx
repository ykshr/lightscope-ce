import Page from '@/components/page/Page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Organization from '@/pages/settings/organization';
import Profile from '@/pages/settings/Profile';

export default function Settings() {
  const header = <></>;

  return (
    <Page header={header}>
      <Tabs defaultValue="profile" orientation="horizontal">
        <TabsList className="bg-transparent p-5">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Profile />
        </TabsContent>
        <TabsContent value="organization">
          <Organization />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
