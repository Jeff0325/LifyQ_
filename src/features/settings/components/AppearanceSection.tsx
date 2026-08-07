import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/layouts/components/ThemeToggle';
import {
  type Density,
  usePreferencesStore,
} from '@/stores/usePreferencesStore';

const DENSITY_LABELS: Record<Density, string> = {
  comfortable: 'Comfortable',
  compact: 'Compact',
};

export function AppearanceSection() {
  const density = usePreferencesStore((state) => state.density);
  const setDensity = usePreferencesStore((state) => state.setDensity);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        <div className="gap-2 flex items-center justify-between">
          <div>
            <p className="font-medium text-body-sm text-foreground">Theme</p>
            <p className="text-caption text-foreground-tertiary">
              Light, dark, or match your system.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="gap-2 flex items-center justify-between">
          <div>
            <p className="font-medium text-body-sm text-foreground">Density</p>
            <p className="text-caption text-foreground-tertiary">
              How tightly content is spaced.
            </p>
          </div>
          <Select
            value={density}
            onValueChange={(v) => setDensity(v as Density)}
          >
            <SelectTrigger className="w-36" aria-label="Density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">
                {DENSITY_LABELS.comfortable}
              </SelectItem>
              <SelectItem value="compact">{DENSITY_LABELS.compact}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
