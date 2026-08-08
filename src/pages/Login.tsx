import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { BrandMark } from '@/components/shared/BrandMark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { DURATION, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

type Mode = 'login' | 'signup' | 'forgot';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A11.998 11.998 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.61l3.99 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

/**
 * Real Supabase Auth — email/password Log In, Sign Up, and Forgot
 * Password, plus Google via `useAuthStore.signInWithGoogle`. Apple
 * Sign-In later is the exact same shape (`signInWithOAuth({ provider:
 * 'apple' })`) — this screen wouldn't need to change, just one more
 * button.
 */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const isPasswordRecovery = useAuthStore((state) => state.isPasswordRecovery);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // `Welcome`'s "Get Started" vs. "I already have an account" buttons pass
  // which mode to open in via router state — otherwise a first-time visitor
  // tapping "Get Started" would land on a screen that says "Welcome back",
  // which is exactly backwards for someone who's never used the app.
  const [mode, setMode] = useState<Mode>(
    () => (location.state as { mode?: Mode } | null)?.mode ?? 'login',
  );
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

  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleSubmitting(true);
    const result = await signInWithGoogle();
    // On success the browser navigates away to Google's consent screen
    // before this ever resolves — this only fires on failure to start.
    setGoogleSubmitting(false);
    if (result.error) setError(result.error);
  };

  // The signup confirmation link redirects here with `?verified=true` (see
  // `useAuthStore.signUp`'s `emailRedirectTo`). Supabase auto-exchanges the
  // token in the URL for a session before this component ever mounts, so by
  // the time we render, the account is already confirmed — this just shows
  // that explicitly instead of dropping the user on the bare login form.
  const [emailVerified, setEmailVerified] = useState(
    () => searchParams.get('verified') === 'true',
  );
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSearchParams(
        (params) => {
          params.delete('verified');
          return params;
        },
        { replace: true },
      );
    }
    // Only ever needs to run once, on mount — the query param is consumed
    // immediately above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Switches auth mode and wipes the form — otherwise a value typed for
   * Log In silently carries over into Sign Up (and vice versa), which reads
   * as the two modes not actually being different screens. */
  const switchMode = (next: Mode) => {
    setMode(next);
    setEmail('');
    setPassword('');
    setError(null);
  };

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

  if (emailVerified) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-background px-6 py-10 text-center pt-[max(env(safe-area-inset-top),2.5rem)] pb-[max(env(safe-area-inset-bottom),2.5rem)]">
        <div className="gap-3 flex max-w-sm flex-col items-center">
          <BrandMark className="size-10" />
          <h1 className="font-semibold text-h2 text-foreground">
            Email verified
          </h1>
          <p className="text-body-sm text-foreground-secondary">
            Your account is confirmed and ready to go.
          </p>
          <Button
            className="mt-2"
            onClick={() => {
              setEmailVerified(false);
              if (isAuthenticated) {
                navigate(ROUTES.home, { replace: true });
              } else {
                switchMode('login');
              }
            }}
          >
            {isAuthenticated ? 'Continue to LifyQ' : 'Back to Log In'}
          </Button>
        </div>
      </div>
    );
  }

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
              switchMode('login');
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
            {(['login', 'signup'] as const).map((value) => {
              const active = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => switchMode(value)}
                  className="min-w-0 relative flex-1"
                >
                  {active && (
                    <motion.span
                      layoutId="login-mode-selected"
                      transition={{
                        duration: DURATION.moderate,
                        ease: EASE.standard,
                      }}
                      className="inset-0 absolute rounded-md bg-linear-to-br from-brand-600 to-brand-700 shadow-elevation-2"
                    />
                  )}
                  <span
                    className={cn(
                      'px-3 py-2 duration-base ease-standard font-medium relative flex items-center justify-center rounded-md text-body-sm transition-colors',
                      active
                        ? 'text-foreground-on-brand'
                        : 'text-foreground-secondary hover:bg-surface-raised',
                    )}
                  >
                    {value === 'login' ? 'Log In' : 'Sign Up'}
                  </span>
                </button>
              );
            })}
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
                        // Keeps the already-typed email (useful — that's
                        // what forgot-mode needs), only the password/error
                        // are cleared.
                        setMode('forgot');
                        setPassword('');
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
                onClick={() => switchMode('login')}
              >
                Back to Log In
              </Button>
            )}
          </form>
        )}

        {mode !== 'forgot' && (
          <>
            <div className="gap-3 flex items-center">
              <div className="h-px flex-1 bg-border" />
              <span className="text-caption text-foreground-tertiary">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={googleSubmitting}
              onClick={() => void handleGoogleSignIn()}
            >
              <GoogleIcon />
              {googleSubmitting ? 'Please wait…' : 'Continue with Google'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
