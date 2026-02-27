"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Mail, Lock, Sparkles, Flame, X, ArrowRight } from "lucide-react";

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
  const [mode, setMode] = useState<'magic-link' | 'password'>('magic-link');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const message = searchParams.get("message");

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
      setSuccess("Check your email for the magic link!");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
      router.push(next || "/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("relative w-full max-w-[420px] bg-[#1c222d] md:border md:border-[#2d3545] md:rounded-3xl p-6 md:p-8 md:shadow-2xl transition-all duration-300", className)} {...props}>
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 md:right-6 md:top-6 text-[#5a657a] hover:text-white transition-colors h-10 w-10 p-0"
        onClick={() => router.push('/')}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Header */}
      <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 mb-8 md:mb-10 mt-4 md:mt-0">
        <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#d9481e] to-[#f45d1a] flex items-center justify-center shadow-[0_0_20px_rgba(217,72,30,0.3)] md:mb-6 flex-shrink-0">
          <Flame className="text-white w-6 h-6 md:w-10 md:h-10 fill-current" />
        </div>
        <div className="text-left md:text-center">
          <h1 className="text-white text-xl md:text-3xl font-bold md:mb-2 leading-tight">Welcome back</h1>
          <p className="text-[#8e99aa] text-xs md:text-sm">
            {mode === 'magic-link'
              ? "Enter your email to receive a magic link or sign in with your password."
              : "Sign in with your email and password."}
          </p>
        </div>
      </div>

      {(message || success) && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-400 text-sm text-center">
          {message || success}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={mode === 'magic-link' ? handleMagicLink : handlePasswordLogin} className="space-y-4 md:space-y-6">
        <div className="space-y-2">
          <Label className="text-xs md:text-sm font-semibold text-white ml-1 tracking-wide uppercase opacity-70">Email address</Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
              <Mail className="w-5 h-5" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-4 text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
            />
          </div>
        </div>

        {mode === 'password' && (
          <div className="space-y-2">
            <Label className="text-xs md:text-sm font-semibold text-white ml-1 tracking-wide uppercase opacity-70">Password</Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-20 text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
              />
              <Link
                href={`/auth/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e99aa] hover:text-[#d9481e] text-xs font-medium transition-colors border-l border-[#2d3545] pl-4 h-5 flex items-center"
              >
                Forgot
              </Link>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}

        <Button
          type="submit"
          className="w-full h-auto bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading
            ? (mode === 'magic-link' ? "Sending..." : "Signing in...")
            : (mode === 'magic-link' ? "Send Magic Link" : "Sign In")}
          {mode === 'magic-link' ? <Sparkles className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-6 md:my-8 text-[#2d3545]">
        <div className="flex-1 border-t border-current"></div>
        <span className="px-4 text-[#8e99aa] text-[10px] md:text-xs uppercase tracking-widest font-semibold">Or</span>
        <div className="flex-1 border-t border-current"></div>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-col space-y-3">
        <Button
          variant="outline"
          onClick={() => setMode(mode === 'magic-link' ? 'password' : 'magic-link')}
          className="w-full h-auto bg-transparent border-[#2d3545] hover:bg-white/5 hover:text-white active:scale-[0.99] transition-all py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-[14px]"
        >
          {mode === 'magic-link' ? (
            <>
              <Lock className="w-5 h-5 text-[#8e99aa]" />
              Sign in with password
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-[#8e99aa]" />
              Send Magic Link
            </>
          )}
        </Button>
      </div>

      {/* Terms and Privacy Footer */}
      <div className="mt-8 text-center md:text-left">
        <p className="text-[#8e99aa] text-[12px] leading-relaxed">
          By signing in, you confirm that you agree to our{" "}
          <Link href="#" className="text-white font-bold hover:underline">
            Terms Of Service
          </Link>{" "}
          and have read our{" "}
          <Link href="#" className="text-white font-bold hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Toggle View Link */}
      <div className="mt-8 text-center pb-4 md:pb-0 border-t border-[#2d3545] pt-6">
        <p className="text-[#a0aec0] text-sm">
          Don&apos;t have an account?
          <Link
            href={`/auth/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-[#d9481e] hover:text-[#f45d1a] underline font-medium transition-colors ml-1"
          >
            Join the Circle
          </Link>
        </p>
      </div>
    </div>
  );
}
