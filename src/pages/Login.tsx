import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BrandMark } from '@/components/shared/BrandMark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

type Mode = 'login' | 'signup' | 'forgot';

/**
 * Real Supabase Auth — email/password Log In, Sign Up, and Forgot
 * Password, all against `useAuthStore`'s `signIn`/`signUp`/
 * `resetPassword`/`updatePassword`. `supabase.auth.signInWithOAuth({
 * provider: 'google' | 'apple' })` is the exact same-shape addition for
 * Google/Apple Sign-In later — this screen wouldn't need to change, just
 * one more button.
 */
export function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const isPasswordRecovery = useAuthStore((state) => state.isPasswordRecovery);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setRecoveryError(null);

    if (newPassword.length < 8) {
      setRecoveryError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords don’t match.');
      return;
    }

    setRecoverySubmitting(true);
    const result = await updatePassword(newPassword);
    setRecoverySubmitting(false);

    if (result.error) {
      setRecoveryError(result.error);
      return;
    }
    navigate(ROUTES.home, { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Enter your email to reset your password.');
        return;
      }
      setSubmitting(true);
      const { error: resetError } = await resetPassword(email.trim());
      setSubmitting(false);
      if (resetError) setError(resetError);
      else setResetSent(true);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Enter an email and password to continue.');
      return;
    }
    setSubmitting(true);
    const result =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Sign-up with email confirmation required leaves no active session —
    // `onAuthStateChange` never fires `isAuthenticated: true` until the
    // user clicks the confirmation link, so there's nowhere to navigate
    // to yet.
    if (mode === 'signup' && !useAuthStore.getState().isAuthenticated) {
      setConfirmationSent(true);
      return;
    }

    // AuthLayout decides Home vs. /onboarding from the real Supabase
    // session/settings the moment it mounts — this screen doesn't need to
    // know which.
    navigate(ROUTES.home, { replace: true });
  };

  if (isPasswordRecovery) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-10 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
        <div className="gap-8 flex w-full max-w-sm flex-col">
          <div className="gap-2 flex flex-col items-center text-center">
            <BrandMark className="size-10" />
            <h1 className="font-semibold text-h2 text-foreground">
              Set a new password
            </h1>
            <p className="text-body-sm text-foreground-secondary">
              Choose a new password for your account.
            </p>
          </div>

          <form
            onSubmit={(e) => void handleUpdatePassword(e)}
            className="gap-4 flex flex-col"
          >
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>

            {recoveryError && (
              <p role="alert" className="text-body-sm text-danger">
                {recoveryError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={recoverySubmitting}
            >
              {recoverySubmitting ? 'Please wait…' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-10 text-center pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
        <div className="gap-3 flex max-w-sm flex-col items-center">
          <BrandMark className="size-10" />
          <h1 className="font-semibold text-h2 text-foreground">
            Check your email
          </h1>
          <p className="text-body-sm text-foreground-secondary">
            We sent a confirmation link to <strong>{email}</strong>. Open it
            to activate your account, then come back and log in.
          </p>
          <Button
            className="mt-2"
            onClick={() => {
              setConfirmationSent(false);
              setMode('login');
            }}
          >
            Back to Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-10 pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
      <div className="gap-8 flex w-full max-w-sm flex-col">
        <div className="gap-2 flex flex-col items-center text-center">
          <BrandMark className="size-10" />
          <h1 className="font-semibold text-h2 text-foreground">
            {mode === 'login' && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-body-sm text-foreground-secondary">
            {mode === 'login' && 'Log in to pick up where you left off.'}
            {mode === 'signup' && "Let's get LifyQ set up for you."}
            {mode === 'forgot' &&
              "We'll email you a link to set a new password."}
          </p>
        </div>

        {mode !== 'forgot' && (
          <div
            role="radiogroup"
            aria-label="Login or sign up"
            className="gap-0.5 p-0.5 flex items-center rounded-lg border border-border bg-surface"
          >
            {(['login', 'signup'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mode === value}
                onClick={() => {
                  setMode(value);
                  setError(null);
                }}
                className={cn(
                  'px-3 py-2 duration-base ease-standard font-medium flex flex-1 items-center justify-center rounded-md text-body-sm transition-colors',
                  mode === value
                    ? 'bg-brand-600 text-foreground-on-brand'
                    : 'text-foreground-secondary hover:bg-surface-raised',
                )}
              >
                {value === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
        )}

        {resetSent ? (
          <p className="text-center text-body-sm text-foreground-secondary">
            If an account exists for <strong>{email}</strong>, a reset link
            is on its way.
          </p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="gap-4 flex flex-col">
            <div className="gap-1.5 flex flex-col">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="gap-1.5 flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError(null);
                      }}
                      className="text-caption text-brand-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-body-sm text-danger">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? 'Please wait…'
                : mode === 'login'
                  ? 'Log In'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
            </Button>

            {mode === 'forgot' && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                Back to Log In
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
