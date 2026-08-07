import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { updateProfileName } from '@/features/settings/api/account';
import { accountBundleKey, useAccountBootstrap } from '@/features/settings/hooks/useAccountBootstrap';
import { useProfileStore } from '@/features/settings/store';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileSection() {
  const userId = useAuthStore((state) => state.user?.id);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bootstrap = useAccountBootstrap();
  const storedName = useProfileStore((state) => state.name);
  const storedEmail = useProfileStore((state) => state.email);
  const setProfile = useProfileStore((state) => state.setProfile);
  const { toast } = useToast();
  const [name, setName] = useState(storedName);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Keep the editable field in sync once the real Supabase-sourced name
  // hydrates (it arrives async, after this component's initial mount).
  useEffect(() => {
    setName(storedName);
  }, [storedName]);

  const dirty = name.trim() !== storedName.trim() && name.trim().length > 0;

  const handleSave = async () => {
    if (!userId || !dirty) return;
    setSaving(true);
    try {
      await updateProfileName(userId, { displayName: name.trim() });
      setProfile({ name: name.trim(), email: storedEmail });
      await queryClient.invalidateQueries({ queryKey: accountBundleKey(userId) });
      toast({ variant: 'success', title: 'Profile updated' });
    } catch {
      toast({
        variant: 'danger',
        title: "Couldn't update your profile",
        description: 'Check your connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 flex flex-col">
        <div className="gap-3 flex items-center">
          <Avatar className="size-14">
            <AvatarFallback className="text-body">
              {initials(name || storedName)}
            </AvatarFallback>
          </Avatar>
          <p className="text-caption text-foreground-tertiary">
            {bootstrap.isLoading ? 'Loading your profile…' : 'Synced with your LifyQ account.'}
          </p>
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="profile-name">Name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="gap-1.5 flex flex-col">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" type="email" value={storedEmail} disabled />
        </div>

        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={!dirty || saving}
          className="w-fit"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>

        <div className="mt-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleSignOut()}
            disabled={signingOut}
            className="w-fit"
          >
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
