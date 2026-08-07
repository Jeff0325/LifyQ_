import { PageContainer } from '@/components/shared/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJarvisPageContext } from '@/features/assistant/hooks/useJarvisPageContext';
import {
  AllergiesSection,
  HealthEventsSection,
  MedicinesSection,
  VitalsSection,
} from '@/features/health';

export function Health() {
  useJarvisPageContext('Health', 'your health records', 'health-medicine');
  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <h2 className="font-semibold text-h2 text-foreground">Health</h2>

      <Tabs defaultValue="medicines">
        <TabsList className="sm:w-fit w-full overflow-x-auto">
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
          <TabsTrigger value="events">Vaccinations & Visits</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
        </TabsList>

        <TabsContent value="medicines">
          <MedicinesSection />
        </TabsContent>
        <TabsContent value="events">
          <HealthEventsSection />
        </TabsContent>
        <TabsContent value="vitals">
          <VitalsSection />
        </TabsContent>
        <TabsContent value="allergies">
          <AllergiesSection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
