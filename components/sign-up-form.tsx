"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Mail, Lock, ShieldCheck, Flame, ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { errorMessage } from "@/lib/errors/errorCode";
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

export function SignUpForm(props: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div>{t('common.loading')}</div>}>
      <SignUpFormContent {...props} />
    </Suspense>
  );
}
function SignUpFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const message = searchParams.get("message");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(t('settings.security.mismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?type=signup${next ? `&next=${encodeURIComponent(next)}` : ""}`,
        },
      });
      if (error) throw error;

      // Notify other components like Sidebar to refresh auth state
      window.dispatchEvent(new Event("auth-role-change"));

      router.push(`/auth/sign-up-success?email=${encodeURIComponent(email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    } catch (error: unknown) {
      setError(errorMessage(error, t, 'common.errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard className={className} {...props}>
      <AuthHeader icon={<Flame className="fill-current" />} title={t('auth.signUp.heading')} description={t('auth.signUp.description')} />

      {message && (
        <div className="mb-6">
          <AuthNotice tone="info">{message}</AuthNotice>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-1">
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

        <div className="space-y-1">
          <Label htmlFor="password" className={authLabelClass}>{t('field.password')}</Label>
          <div className="group relative">
            <div className={authIconClass}>
              <Lock className="size-5" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder={t('field.password.placeholder')}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="repeat-password" className={authLabelClass}>{t('field.repeatPassword')}</Label>
          <div className="group relative">
            <div className={authIconClass}>
              <ShieldCheck className="size-5" />
            </div>
            <Input
              id="repeat-password"
              type="password"
              placeholder={t('field.password.placeholder')}
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={authInputClass}
            />
          </div>
        </div>

        {error && <AuthNotice tone="error">{error}</AuthNotice>}

        <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? t('auth.signUp.submitting') : t('auth.signUp.submit')}
          <ArrowRight />
        </Button>
      </form>

      {/* Terms and Privacy Footer */}
      <div className="mt-8 text-center md:text-left">
        <p className="text-caption leading-relaxed text-fg-muted">
          {t('auth.tos.signUp')}{" "}
          <Link href="#" className="font-bold text-fg hover:underline">
            {t('auth.tos.terms')}
          </Link>{" "}
          {t('auth.tos.and')}{" "}
          <Link href="#" className="font-bold text-fg hover:underline">
            {t('auth.tos.privacy')}
          </Link>
        </p>
      </div>

      {/* Toggle View Link */}
      <div className={authFooterClass}>
        <p>
          {t('auth.signUp.hasAccount')}
          <Link href={authPageHref('login', { next })} className={cn(authLinkClass, 'ml-1')}>
            {t('auth.signUp.signIn')}
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
