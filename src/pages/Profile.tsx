import { PageContainer } from '@/components/shared/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AppearanceSection,
  NotificationsSection,
  PrivacySection,
  ProfileSection,
  SubscriptionSection,
} from '@/features/settings';

export function Profile() {
  return (
    <PageContainer size="sm" className="gap-4 flex flex-col">
      <h2 className="font-semibold text-h2 text-foreground">Profile</h2>

      <Tabs defaultValue="profile">
        <TabsList className="sm:w-fit w-full overflow-x-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSection />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSection />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSection />
        </TabsContent>
        <TabsContent value="subscription">
          <SubscriptionSection />
        </TabsContent>
        <TabsContent value="privacy">
          <PrivacySection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
