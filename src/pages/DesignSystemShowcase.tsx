import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  GripHorizontal,
  Inbox,
  Info,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import {
  FadeIn,
  SlideUp,
  StaggerItem,
  StaggerList,
} from '@/components/shared/motion';
import { ProgressRing } from '@/components/shared/ProgressRing';
import { PullToRefresh } from '@/components/shared/PullToRefresh';
import { Sparkline } from '@/components/shared/Sparkline';
import { Swipeable } from '@/components/shared/Swipeable';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  InteractiveCard,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/layouts/components/ThemeToggle';
import { useToast } from '@/hooks/useToast';

const SECTIONS = [
  'colors',
  'typography',
  'spacing',
  'elevation',
  'radius',
  'icons',
  'buttons',
  'cards',
  'inputs',
  'dropdowns',
  'checkboxes-radios-switches',
  'dialogs-sheets',
  'navigation',
  'toasts',
  'skeletons',
  'empty-error-states',
  'charts',
  'motion',
  'gestures',
] as const;

function SectionHeading({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description?: string;
}) {
  return (
    <div id={id} className="scroll-mt-20 pb-3 border-b border-border">
      <h2 className="font-semibold text-h1 text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 text-body-sm text-foreground-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

// Tailwind's scanner only picks up class names that appear as complete,
// literal substrings somewhere in the source — a template-literal like
// `bg-${token}` never produces the text "bg-brand-50", so it silently
// generates no CSS. Every color/radius/shadow utility used below is
// therefore spelled out in full in these lookup tables, not interpolated.
function Swatch({
  label,
  className,
  hex,
}: {
  label: string;
  className: string;
  hex?: string;
}) {
  return (
    <div className="gap-1.5 flex flex-col">
      <div
        className={`h-14 rounded-lg border border-border-subtle ${className}`}
      />
      <p className="font-medium text-caption text-foreground">{label}</p>
      {hex && <p className="text-caption text-foreground-tertiary">{hex}</p>}
    </div>
  );
}

const BRAND_SWATCHES = [
  { label: 'brand-50', className: 'bg-brand-50' },
  { label: 'brand-100', className: 'bg-brand-100' },
  { label: 'brand-200', className: 'bg-brand-200' },
  { label: 'brand-300', className: 'bg-brand-300' },
  { label: 'brand-400', className: 'bg-brand-400' },
  { label: 'brand-500', className: 'bg-brand-500' },
  { label: 'brand-600', className: 'bg-brand-600' },
  { label: 'brand-700', className: 'bg-brand-700' },
  { label: 'brand-800', className: 'bg-brand-800' },
  { label: 'brand-900', className: 'bg-brand-900' },
  { label: 'brand-950', className: 'bg-brand-950' },
];

const ACCENT_SWATCHES = [
  { label: 'accent-50', className: 'bg-accent-50' },
  { label: 'accent-100', className: 'bg-accent-100' },
  { label: 'accent-200', className: 'bg-accent-200' },
  { label: 'accent-300', className: 'bg-accent-300' },
  { label: 'accent-400', className: 'bg-accent-400' },
  { label: 'accent-500', className: 'bg-accent-500' },
  { label: 'accent-600', className: 'bg-accent-600' },
  { label: 'accent-700', className: 'bg-accent-700' },
  { label: 'accent-800', className: 'bg-accent-800' },
  { label: 'accent-900', className: 'bg-accent-900' },
  { label: 'accent-950', className: 'bg-accent-950' },
];

const SURFACE_SWATCHES = [
  { label: 'background', className: 'bg-background' },
  { label: 'surface', className: 'bg-surface' },
  { label: 'surface-raised', className: 'bg-surface-raised' },
  { label: 'border', className: 'bg-border' },
];

const STATUS_SWATCHES = [
  { label: 'success', className: 'bg-success' },
  { label: 'warning', className: 'bg-warning' },
  { label: 'danger', className: 'bg-danger' },
  { label: 'info', className: 'bg-info' },
];

const CHART_SWATCHES = [
  { label: 'chart-1', className: 'bg-chart-1' },
  { label: 'chart-2', className: 'bg-chart-2' },
  { label: 'chart-3', className: 'bg-chart-3' },
  { label: 'chart-4', className: 'bg-chart-4' },
  { label: 'chart-5', className: 'bg-chart-5' },
  { label: 'chart-6', className: 'bg-chart-6' },
  { label: 'chart-7', className: 'bg-chart-7' },
  { label: 'chart-8', className: 'bg-chart-8' },
];

const ELEVATION_SWATCHES = [
  { label: 'Level 1', className: 'shadow-elevation-1' },
  { label: 'Level 2', className: 'shadow-elevation-2' },
  { label: 'Level 3', className: 'shadow-elevation-3' },
  { label: 'Level 4', className: 'shadow-elevation-4' },
  { label: 'Level 5', className: 'shadow-elevation-5' },
];

const RADIUS_SWATCHES = [
  { label: 'rounded-sm (6px)', className: 'rounded-sm' },
  { label: 'rounded-md (10px)', className: 'rounded-md' },
  { label: 'rounded-lg (16px)', className: 'rounded-lg' },
  { label: 'rounded-xl (20px)', className: 'rounded-xl' },
  { label: 'rounded-2xl (28px)', className: 'rounded-2xl' },
  { label: 'rounded-full (pill)', className: 'rounded-full' },
];

export function DesignSystemShowcase() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [checked, setChecked] = React.useState<boolean | 'indeterminate'>(true);
  const [switchOn, setSwitchOn] = React.useState(true);
  const [radioValue, setRadioValue] = React.useState('comfortable');
  const { toast } = useToast();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Local header — intentionally outside AppShell/product nav. This
          route exists for design review only; see docs/27. */}
      <header className="top-0 h-14 px-4 backdrop-blur-xl sm:px-6 sticky z-40 flex items-center justify-between border-b border-border bg-background/80">
        <div className="gap-3 flex items-center">
          <Button asChild variant="ghost" size="icon">
            <Link to="/" aria-label="Back to app">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
          <h1 className="font-semibold text-h3">Design System</h1>
          <Badge variant="brand">Internal</Badge>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-6xl gap-10 px-4 py-10 sm:px-6 mx-auto flex">
        {/* In-page nav — desktop only */}
        <nav
          aria-label="Sections"
          className="top-20 w-44 gap-1 lg:flex sticky hidden h-fit shrink-0 flex-col"
        >
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="px-2 py-1.5 duration-base ease-standard rounded-md text-body-sm text-foreground-secondary capitalize transition-colors hover:bg-surface-raised hover:text-foreground"
            >
              {id.replaceAll('-', ' ')}
            </a>
          ))}
        </nav>

        <main className="min-w-0 gap-16 flex flex-1 flex-col">
          {/* COLORS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="colors"
              title="Color"
              description="Semantic tokens only — see docs/08_Design_System.md §2. Never a raw Tailwind palette utility in feature code."
            />
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Brand (indigo)
              </p>
              <div className="gap-3 sm:grid-cols-6 lg:grid-cols-11 grid grid-cols-4">
                {BRAND_SWATCHES.map((s) => (
                  <Swatch key={s.label} {...s} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Accent (coral) — streaks &amp; celebrations only
              </p>
              <div className="gap-3 sm:grid-cols-6 lg:grid-cols-11 grid grid-cols-4">
                {ACCENT_SWATCHES.map((s) => (
                  <Swatch key={s.label} {...s} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Surfaces &amp; text
              </p>
              <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
                {SURFACE_SWATCHES.map((s) => (
                  <Swatch key={s.label} {...s} />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Status
              </p>
              <div className="gap-3 sm:grid-cols-4 grid grid-cols-2">
                {STATUS_SWATCHES.map((s) => (
                  <Swatch key={s.label} {...s} />
                ))}
              </div>
            </div>
          </section>

          {/* TYPOGRAPHY */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="typography"
              title="Typography"
              description="Inter Variable. Fluid clamp() sizes, mobile → desktop. See docs/08 §3."
            />
            <div className="gap-3 flex flex-col">
              <p className="font-semibold text-display">
                Display — Welcome to LifyQ
              </p>
              <p className="font-semibold text-h1">
                Heading 1 — Your day at a glance
              </p>
              <p className="font-semibold text-h2">
                Heading 2 — Today&apos;s tasks
              </p>
              <p className="font-semibold text-h3">
                Heading 3 — Marathon Training
              </p>
              <p className="text-body">
                Body — The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-body-sm text-foreground-secondary">
                Body small — secondary metadata and helper text.
              </p>
              <p className="tracking-wide text-caption text-foreground-tertiary uppercase">
                Caption — timestamps &amp; tags
              </p>
              <p className="font-semibold text-h2 tabular-nums">
                1,204.50{' '}
                <span className="font-normal text-body-sm text-foreground-tertiary">
                  tabular-nums for stats/amounts
                </span>
              </p>
            </div>
          </section>

          {/* SPACING */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="spacing"
              title="Spacing"
              description="4px base unit, Tailwind's default scale — no custom overrides. See docs/08 §4."
            />
            <div className="gap-2 flex flex-col">
              {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
                <div key={n} className="gap-3 flex items-center">
                  <span className="w-12 text-caption text-foreground-tertiary">
                    {n * 4}px
                  </span>
                  <div
                    className={`h-3 rounded bg-brand-600`}
                    style={{ width: n * 16 }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ELEVATION */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="elevation"
              title="Elevation"
              description="Brand-tinted in light, deep black in dark (tokens.css). See docs/08 §6."
            />
            <div className="gap-6 sm:grid-cols-5 grid grid-cols-2">
              {ELEVATION_SWATCHES.map((s) => (
                <div
                  key={s.label}
                  className={`h-20 flex items-center justify-center rounded-lg bg-surface text-body-sm text-foreground-secondary ${s.className}`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          </section>

          {/* RADIUS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="radius"
              title="Border radius"
              description="See docs/08 §5."
            />
            <div className="gap-6 flex flex-wrap">
              {RADIUS_SWATCHES.map((s) => (
                <div key={s.label} className="gap-2 flex flex-col items-center">
                  <div className={`size-16 bg-brand-600 ${s.className}`} />
                  <p className="text-caption text-foreground-tertiary">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ICONS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="icons"
              title="Icons"
              description="Lucide, 1.5–2px stroke. 16 / 20 / 24 / 32px sizes. See docs/08 §8."
            />
            <div className="gap-6 flex items-end">
              {[16, 20, 24, 32].map((size) => (
                <div key={size} className="gap-2 flex flex-col items-center">
                  <Sparkles
                    style={{ width: size, height: size }}
                    className="text-brand-600"
                  />
                  <p className="text-caption text-foreground-tertiary">
                    {size}px
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* BUTTONS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading id="buttons" title="Buttons" />
            <div className="gap-3 flex flex-wrap items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className="gap-3 flex flex-wrap items-center">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </section>

          {/* CARDS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading id="cards" title="Cards" />
            <div className="gap-4 sm:grid-cols-2 grid grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Run a half-marathon</CardTitle>
                  <CardDescription>Goal · due Nov 2026</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProgressRing value={62} />
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="secondary">
                    View goal
                  </Button>
                </CardFooter>
              </Card>
              <InteractiveCard>
                <div className="gap-1.5 p-5 flex flex-col">
                  <p className="font-semibold text-h3">Interactive card</p>
                  <p className="text-body-sm text-foreground-secondary">
                    Hover/press feedback — for cards that open or navigate.
                  </p>
                </div>
              </InteractiveCard>
            </div>
          </section>

          {/* INPUTS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading id="inputs" title="Inputs &amp; textareas" />
            <div className="max-w-lg gap-4 grid">
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="ds-name">Name</Label>
                <Input id="ds-name" placeholder="Maya Chen" />
              </div>
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="ds-email">Email (invalid state)</Label>
                <Input
                  id="ds-email"
                  defaultValue="not-an-email"
                  aria-invalid="true"
                />
                <p className="text-caption text-danger">
                  Enter a valid email address.
                </p>
              </div>
              <div className="gap-1.5 flex flex-col">
                <Label htmlFor="ds-notes">Notes</Label>
                <Textarea id="ds-notes" placeholder="Add a description…" />
              </div>
            </div>
          </section>

          {/* DROPDOWNS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="dropdowns"
              title="Dropdowns"
              description="Select (forms) vs. Dropdown Menu (actions) — see docs/11 §3."
            />
            <div className="gap-4 flex flex-wrap items-center">
              <div className="w-48 gap-1.5 flex flex-col">
                <Label>Priority</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    <Settings aria-hidden="true" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Task</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <User aria-hidden="true" className="size-4" />
                    Assign
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell aria-hidden="true" className="size-4" />
                    Remind me
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive>
                    <Trash2 aria-hidden="true" className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>

          {/* CHECKBOXES / RADIOS / SWITCHES */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="checkboxes-radios-switches"
              title="Checkboxes, radio buttons &amp; switches"
            />
            <div className="gap-10 flex flex-wrap items-start">
              <div className="gap-2 flex items-center">
                <Checkbox
                  id="ds-checkbox"
                  checked={checked}
                  onCheckedChange={setChecked}
                />
                <Label htmlFor="ds-checkbox">Complete onboarding</Label>
              </div>
              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                {['comfortable', 'compact'].map((v) => (
                  <div key={v} className="gap-2 flex items-center">
                    <RadioGroupItem value={v} id={`ds-radio-${v}`} />
                    <Label htmlFor={`ds-radio-${v}`} className="capitalize">
                      {v}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="gap-2 flex items-center">
                <Switch
                  id="ds-switch"
                  checked={switchOn}
                  onCheckedChange={setSwitchOn}
                />
                <Label htmlFor="ds-switch">Notifications</Label>
              </div>
            </div>
          </section>

          {/* DIALOGS & SHEETS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="dialogs-sheets"
              title="Dialogs &amp; bottom sheets"
            />
            <div className="gap-3 flex flex-wrap">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create goal</DialogTitle>
                    <DialogDescription>
                      Centered modal — desktop/tablet default. See docs/10 §6.
                    </DialogDescription>
                  </DialogHeader>
                  <Input placeholder="Goal title" />
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setDialogOpen(false)}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Delete task…
              </Button>
              <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete this task?"
                description="This can't be undone."
                confirmLabel="Delete"
                destructive
                onConfirm={() => setConfirmOpen(false)}
              />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary">Open bottom sheet</Button>
                </SheetTrigger>
                <SheetContent side="bottom">
                  <SheetHeader>
                    <SheetTitle>Quick add</SheetTitle>
                    <SheetDescription>
                      Mobile-native slide-from-bottom pattern — docs/10 §6.
                    </SheetDescription>
                  </SheetHeader>
                  <Input placeholder="Call dentist tomorrow 3pm #health" />
                </SheetContent>
              </Sheet>
            </div>
          </section>

          {/* NAVIGATION */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="navigation"
              title="Navigation components"
              description="Tabs and Breadcrumb. Sidebar/BottomNav/TopBar live in src/layouts/components."
            />
            <Tabs defaultValue="overview" className="max-w-md">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent
                value="overview"
                className="text-body-sm text-foreground-secondary"
              >
                Overview panel content.
              </TabsContent>
              <TabsContent
                value="activity"
                className="text-body-sm text-foreground-secondary"
              >
                Activity panel content.
              </TabsContent>
              <TabsContent
                value="settings"
                className="text-body-sm text-foreground-secondary"
              >
                Settings panel content.
              </TabsContent>
            </Tabs>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#navigation">Goals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#navigation">
                    Marathon Training
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Long run — 18 miles</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="gap-3 flex items-center">
              <Avatar>
                <AvatarImage src="" alt="" />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
              <Separator orientation="vertical" className="h-8" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Sign out">
                    <LogOut aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* TOASTS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading id="toasts" title="Toasts" />
            <div className="gap-3 flex flex-wrap">
              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    variant: 'success',
                    title: 'Task completed',
                    description: '"Book flights" marked done.',
                  })
                }
              >
                Trigger success toast
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    variant: 'danger',
                    title: "Couldn't save",
                    description: 'Check your connection and try again.',
                    action: { label: 'Retry', onClick: () => {} },
                  })
                }
              >
                Trigger error toast
              </Button>
            </div>
          </section>

          {/* SKELETONS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading id="skeletons" title="Loading skeletons" />
            <div className="max-w-md gap-3 flex flex-col">
              <div className="gap-3 flex items-center">
                <Skeleton className="size-10 rounded-full" />
                <div className="gap-2 flex flex-1 flex-col">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </section>

          {/* EMPTY / ERROR STATES */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="empty-error-states"
              title="Empty &amp; error states"
            />
            <div className="gap-4 sm:grid-cols-2 grid rounded-xl border border-border">
              <EmptyState
                icon={Inbox}
                title="No notes yet"
                description="Capture your first thought — it takes five seconds."
                tone="brand"
                action={
                  <Button size="sm">
                    <Plus aria-hidden="true" />
                    New note
                  </Button>
                }
              />
              <div className="sm:border-l sm:border-t-0 border-t border-border">
                <ErrorState onRetry={() => {}} />
              </div>
            </div>
          </section>

          {/* CHARTS */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="charts"
              title="Charts"
              description="Sequential (brand hue) primitives ship now for Goals/Habits. The full categorical palette below is validated and reserved for the Analytics domain (Phase 3) — see docs/27."
            />
            <div className="gap-8 flex flex-wrap items-center">
              <ProgressRing value={78} size={72} />
              <div className="gap-2 flex items-center">
                <Sparkline
                  label="Steps, last 7 days"
                  data={[3, 5, 4, 6, 8, 7, 9]}
                  width={140}
                  height={40}
                />
                <span className="text-caption text-foreground-tertiary">
                  7-day trend
                </span>
              </div>
              <div className="max-w-xs gap-2 flex items-center">
                <Progress value={45} />
                <span className="text-caption text-foreground-tertiary tabular-nums">
                  45%
                </span>
              </div>
            </div>
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Categorical (reserved, adjacent-pairs safe — 3 leftmost slots
                also all-pairs safe)
              </p>
              <div className="gap-3 flex flex-wrap">
                {CHART_SWATCHES.map((s) => (
                  <Swatch key={s.label} {...s} />
                ))}
              </div>
            </div>
          </section>

          {/* MOTION */}
          <section className="gap-4 flex flex-col">
            <SectionHeading
              id="motion"
              title="Motion principles"
              description="Durations 100/180/250/400ms, standard/decelerate/accelerate easing, transform+opacity only. Respects prefers-reduced-motion globally via MotionConfig. See docs/08 §7 and docs/27."
            />
            <div className="gap-4 sm:grid-cols-3 grid">
              <FadeIn className="p-4 rounded-lg border border-border bg-surface text-body-sm">
                FadeIn — opacity only, always on even under reduced motion.
              </FadeIn>
              <SlideUp className="p-4 rounded-lg border border-border bg-surface text-body-sm">
                SlideUp — panels, sheets, page sections.
              </SlideUp>
              <StaggerList className="gap-2 flex flex-col">
                <StaggerItem className="p-2 rounded-lg border border-border bg-surface text-body-sm">
                  Item 1
                </StaggerItem>
                <StaggerItem className="p-2 rounded-lg border border-border bg-surface text-body-sm">
                  Item 2
                </StaggerItem>
                <StaggerItem className="p-2 rounded-lg border border-border bg-surface text-body-sm">
                  Item 3
                </StaggerItem>
              </StaggerList>
            </div>
            <div className="gap-2 flex items-center text-body-sm text-foreground-secondary">
              <Info aria-hidden="true" className="size-4 text-info" />
              Route transitions render via a plain Outlet, not an
              AnimatePresence cross-fade — see docs/28 for why that was tried
              and reverted.
            </div>
            <div className="gap-2 flex items-center text-body-sm text-success">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              All sections rendered.
            </div>
            <div className="gap-2 flex items-center text-body-sm text-warning">
              <AlertTriangle aria-hidden="true" className="size-4" />
              This route is internal tooling — not linked from product
              navigation.
            </div>
            <div className="gap-2 flex items-center text-body-sm text-foreground-secondary">
              <Calendar aria-hidden="true" className="size-4" />
              See docs/27_Design_System_Implementation.md for every decision
              recorded.
            </div>
          </section>

          {/* GESTURES */}
          <section className="gap-4 pb-24 flex flex-col">
            <SectionHeading
              id="gestures"
              title="Mobile gestures"
              description="Swipe-to-reveal and pull-to-refresh — architecture for future list screens (Tasks, Notes, ...), not wired to real data yet. See docs/28_Mobile_First_Architecture.md."
            />
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Swipeable — drag the row left or right
              </p>
              <Swipeable
                className="max-w-sm rounded-lg border border-border"
                leftAction={
                  <div className="px-4 flex h-full items-center bg-success text-foreground-on-brand">
                    <Archive aria-hidden="true" className="size-5" />
                  </div>
                }
                rightAction={
                  <div className="px-4 flex h-full items-center bg-danger text-foreground-on-brand">
                    <Trash2 aria-hidden="true" className="size-5" />
                  </div>
                }
                onSwipeLeft={() =>
                  toast({
                    variant: 'danger',
                    title: 'Swiped left',
                    description: 'A real row would delete here.',
                  })
                }
                onSwipeRight={() =>
                  toast({
                    variant: 'success',
                    title: 'Swiped right',
                    description: 'A real row would archive here.',
                  })
                }
              >
                <div className="gap-3 p-4 flex items-center bg-surface">
                  <GripHorizontal
                    aria-hidden="true"
                    className="size-4 text-foreground-tertiary"
                  />
                  <span className="text-body-sm text-foreground">
                    Book flights for the trip
                  </span>
                </div>
              </Swipeable>
            </div>
            <div>
              <p className="mb-2 font-medium text-body-sm text-foreground-secondary">
                Pull to refresh — drag down from the top
              </p>
              <PullToRefresh
                className="h-52 max-w-sm rounded-lg border border-border"
                onRefresh={() =>
                  new Promise<void>((resolve) => {
                    setTimeout(() => {
                      toast({ variant: 'success', title: 'Refreshed' });
                      resolve();
                    }, 900);
                  })
                }
              >
                <ul className="flex flex-col divide-y divide-border-subtle">
                  {['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5', 'Row 6'].map(
                    (row) => (
                      <li
                        key={row}
                        className="p-4 text-body-sm text-foreground-secondary"
                      >
                        {row}
                      </li>
                    ),
                  )}
                </ul>
              </PullToRefresh>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
