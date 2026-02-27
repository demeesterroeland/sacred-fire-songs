"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Flame, User, Compass, CheckCircle } from "lucide-react";

export function FinishRegistrationForm(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinishRegistrationFormContent {...props} />
    </Suspense>
  );
}

function FinishRegistrationFormContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
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

      router.push(next || "/explore");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
          background: #f45d1a;
          border-radius: 50%;
          box-shadow: 0 0 10px #d9481e, 0 0 20px #f45d1a;
          pointer-events: none;
          animation: ember-rise linear forwards;
        }
      `}</style>

      <div className={cn("relative z-10 w-full max-w-[420px] bg-[#1c222d] md:border md:border-[#2d3545] md:rounded-3xl p-6 md:p-8 md:shadow-2xl transition-all duration-300", className)} {...props}>
        {/* Header */}
        <div className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-0 mb-8 md:mb-10 mt-4 md:mt-0">
          <div className="w-12 h-12 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#b91c1c] to-[#ea580c] flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.3)] ring-1 ring-white/10 md:mb-6 flex-shrink-0">
            <Flame className="text-white w-6 h-6 md:w-10 md:h-10 fill-current" />
          </div>
          <div className="text-left md:text-center">
            <h1 className="text-white text-xl md:text-3xl font-bold md:mb-2 leading-tight">Welcome at the Fire</h1>
          </div>
        </div>

        {/* Finish Registration Form */}
        <form onSubmit={handleFinishRegistration} className="space-y-6 md:space-y-8">
          <div className="bg-[#141b24] border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-[15px] font-medium text-center mb-6 shadow-inner">
            Email successfully verified!
          </div>

          <div className="space-y-4">
            <p className="text-[#8e99aa] text-sm text-center leading-relaxed">
              The smoke has cleared, and your invitation is now official.
              The circle awaits—tell us how we shall call you as you join us by the fire.
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-white ml-1 tracking-wide uppercase opacity-70">What should we call you?</Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a657a] group-focus-within:text-[#d9481e] transition-colors pointer-events-none">
                <User className="w-5 h-5" />
              </div>
              <Input
                id="full-name"
                type="text"
                placeholder="Your Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-[#2d3545] rounded-xl py-3.5 md:py-4 pl-12 pr-4 text-white placeholder-[#5a657a] focus:outline-none focus:border-[#d9481e] transition-all text-[14px] md:text-[15px] h-auto"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-500/10 border border-red-500/20 p-2 rounded">{error}</p>}

          <Button
            type="submit"
            className="w-full h-auto bg-gradient-to-r from-[#d9481e] to-[#f45d1a] hover:brightness-110 active:scale-[0.98] text-white font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(217,72,30,0.4)] disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Finishing..." : "Finish Setup & Explore"}
            <Compass className="w-5 h-5" />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center md:text-left border-t border-[#2d3545] pt-6">
          <p className="text-[#8e99aa] text-[12px] leading-relaxed italic">
            &quot;May the song carry you home to the sacred fire.&quot;
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
