"use client";

import { useEffect, useRef } from "react";
import { Code, Rocket } from "lucide-react";

export default function EnvironmentBanner() {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const isLocal = process.env.NODE_ENV === "development";
  const bannerRef = useRef<HTMLDivElement>(null);

  const env = vercelEnv === "preview" ? "preview" : isLocal ? "development" : null;

  // Set CSS variable so sidebar can offset itself below the banner
  useEffect(() => {
    if (!env || !bannerRef.current) return;
    const height = bannerRef.current.offsetHeight;
    document.documentElement.style.setProperty('--env-banner-height', `${height}px`);
    return () => {
      document.documentElement.style.removeProperty('--env-banner-height');
    };
  }, [env]);

  if (!env) return null;

  const config = {
    preview: {
      bg: "bg-amber-500",
      text: "text-black",
      label: "Preview Environment",
      icon: <Rocket className="w-4 h-4" />,
    },
    development: {
      bg: "bg-blue-600",
      text: "text-white",
      label: "Local Development",
      icon: <Code className="w-4 h-4" />,
    },
  }[env as "preview" | "development"];

  return (
    <div ref={bannerRef} className={`${config.bg} ${config.text} px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest z-[100] sticky top-0 shadow-lg`}>
      {config.icon}
      <span>{config.label}</span>
      <span className="opacity-50 mx-1">|</span>
      <span className="font-medium normal-case tracking-normal opacity-90">
        Changes on this site will not affect Production data.
      </span>
    </div>
  );
}
