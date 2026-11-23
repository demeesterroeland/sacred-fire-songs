"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Flame, User, Compass, CheckCircle } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { errorMessage } from "@/lib/errors/errorCode";
import { safeNextPath } from '@/lib/auth/safeNext';

export function FinishRegistrationForm(props: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useLocale();
  return (
    <Suspense fallback={<div>{t('common.loading')}</div>}>
      <FinishRegistrationFormContent {...props} />
    </Suspense>
  );
}

function FinishRegistrationFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useLocale();
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const handleFinishRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Update the profile with the full name
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Notify other components like Sidebar to refresh auth state
      window.dispatchEvent(new Event("auth-role-change"));

      router.push(safeNextPath(next, "/"));
    } catch (error: unknown) {
      setError(errorMessage(error, t, 'auth.error.default'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Fire Embers Effect */}
      <FireEmbers />

      <style jsx global>{`
        @keyframes ember-rise {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }
          20% { opacity: 1; }
          100% {
            transform: translateY(-100vh) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        .ember {
          position: absolute;
          bottom: -10px;
          background: var(--accent);
          border-radius: 50%;
          pointer-events: none;
          animation: ember-rise linear forwards;
        }
      `}</style>

      <div className={cn("relative z-10 w-full max-w-[420px] bg-bg md:border md:border-line md:bg-surface md:rounded-panel p-6 md:p-8", className)} {...props}>
        {/* Header */}
        <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 mb-8 md:mb-10 mt-4 md:mt-0">
          <div className="size-12 md:size-20 rounded-pill bg-accent-soft text-accent flex items-center justify-center md:mb-6 shrink-0">
            <Flame className="size-6 md:size-10 fill-current" />
          </div>
          <div className="text-left md:text-center">
            <h1 className="text-fg text-title font-bold md:mb-2">{t('auth.heading')}</h1>
          </div>
        </div>

        {/* Finish Registration Form */}
        <form onSubmit={handleFinishRegistration} className="space-y-6 md:space-y-8">
          <div className="bg-surface-2 border border-line-strong p-4 rounded-control text-fg text-body font-medium text-center mb-6">
            {t('auth.finishRegistration.emailVerified')}
          </div>

          <div className="space-y-4">
            <p className="text-fg-muted text-sm text-center leading-relaxed">
              {t('auth.finishRegistration.description')}
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-meta font-semibold text-fg-muted ml-1">{t('auth.finishRegistration.nameLabel')}</Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none">
                <User className="size-5" />
              </div>
              <Input
                id="full-name"
                type="text"
                placeholder={t('field.fullName.placeholder')}
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full min-h-tap bg-transparent border-line-strong rounded-control py-3.5 md:py-4 pl-12 pr-4 text-fg placeholder:text-fg-muted text-body h-auto"
              />
            </div>
          </div>

          {error && <p role="alert" className="text-meta text-danger text-center border border-danger p-2 rounded-control">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? t('auth.finishRegistration.submitting') : t('auth.finishRegistration.submit')}
            <Compass />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center md:text-left border-t border-line pt-6">
          <p className="text-fg-muted text-caption leading-relaxed italic">
            &quot;{t('app.tagline')}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}

function FireEmbers() {
  const [embers, setEmbers] = useState<{ id: number; left: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers((prev) => [
        ...prev.slice(-40), // Keep max 40 embers
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 2,
        },
      ]);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="ember"
          style={{
            left: `${ember.left}%`,
            width: `${ember.size}px`,
            height: `${ember.size}px`,
            animationDuration: `${ember.duration}s`,
            animationDelay: `${ember.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
