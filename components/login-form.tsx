"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Mail, Lock, Sparkles, Flame, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { authNoticeKey } from "@/lib/auth/notice";
import { errorMessage } from "@/lib/errors/errorCode";
import { safeNextPath } from '@/lib/auth/safeNext';
import { authPageHref } from '@/lib/auth/authBack';
import {
  AuthCard,
  AuthHeader,
  AuthNotice,
  authFooterClass,
  authIconClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from '@/components/auth/AuthShell';

export function LoginForm(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Suspense>
      <LoginFormContent {...props} />
    </Suspense>
  );
}

function LoginFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useLocale();
  const [mode, setMode] = useState<'magic-link' | 'password'>('magic-link');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  // A code from the redirect (never text from the address): known codes give a sentence, others the default one.
  const messageKey = authNoticeKey(searchParams.get("message"));

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`,
        },
      });
      if (error) throw error;
      setSuccess(t('auth.login.magicLinkSent'));
    } catch (error: unknown) {
      setError(errorMessage(error, t, 'common.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      window.dispatchEvent(new Event("auth-role-change"));
      router.push(safeNextPath(next));
    } catch (error: unknown) {
      setError(errorMessage(error, t, 'common.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard className={className} {...props}>
      <AuthHeader
        icon={<Flame className="fill-current" />}
        title={t('auth.login.heading')}
        description={mode === 'magic-link' ? t('auth.login.magicLinkHint') : t('auth.login.passwordHint')}
      />

      {(messageKey || success) && (
        <div className="mb-6">
          <AuthNotice tone="info">{messageKey ? t(messageKey) : success}</AuthNotice>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={mode === 'magic-link' ? handleMagicLink : handlePasswordLogin} className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className={authLabelClass}>{t('field.email.label')}</Label>
          <div className="group relative">
            <div className={authIconClass}>
              <Mail className="size-5" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder={t('field.email.placeholder')}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
        </div>

        {mode === 'password' && (
          <div className="space-y-2">
            <Label htmlFor="password" className={authLabelClass}>{t('field.password')}</Label>
            <div className="group relative">
              <div className={authIconClass}>
                <Lock className="size-5" />
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder={t('field.password.placeholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(authInputClass, 'pr-24')}
              />
              <Link
                href={authPageHref('forgot-password', { next, email })}
                className="absolute right-0 top-1/2 flex min-h-tap -translate-y-1/2 items-center border-l border-line pl-4 pr-4 text-caption font-medium text-fg-muted hover:text-accent"
              >
                {t('auth.login.forgotShort')}
              </Link>
            </div>
          </div>
        )}

        {error && <AuthNotice tone="error">{error}</AuthNotice>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? (mode === 'magic-link' ? t('auth.login.submitting.magicLink') : t('auth.login.submitting'))
            : (mode === 'magic-link' ? t('auth.login.sendMagicLink') : t('auth.login.submit'))}
          {mode === 'magic-link' ? <Sparkles /> : <ArrowRight />}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center text-line md:my-8">
        <div className="flex-1 border-t border-current"></div>
        <span className="px-4 text-caption font-semibold text-fg-muted">{t('common.or')}</span>
        <div className="flex-1 border-t border-current"></div>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-col space-y-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMode(mode === 'magic-link' ? 'password' : 'magic-link')}
          className="w-full"
        >
          {mode === 'magic-link' ? (
            <>
              <Lock />
              {t('auth.login.switchToPassword')}
            </>
          ) : (
            <>
              <Sparkles />
              {t('auth.login.switchToMagicLink')}
            </>
          )}
        </Button>
      </div>

      {/* Terms and Privacy Footer */}
      <div className="mt-8 text-center md:text-left">
        <p className="text-caption leading-relaxed text-fg-muted">
          {t('auth.tos.signIn')}{" "}
          <Link href="/terms" className="font-bold text-fg hover:underline">
            {t('auth.tos.terms')}
          </Link>{" "}
          {t('auth.tos.and')}{" "}
          <Link href="/privacy" className="font-bold text-fg hover:underline">
            {t('auth.tos.privacy')}
          </Link>
        </p>
      </div>

      {/* Toggle View Link */}
      <div className={authFooterClass}>
        <p>
          {t('auth.login.noAccount')}
          <Link href={authPageHref('sign-up', { next })} className={cn(authLinkClass, 'ml-1')}>
            {t('auth.login.joinTheCircle')}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
