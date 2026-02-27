"use client";

import { useEffect, useState } from "react";
import { Info, Code, Rocket } from "lucide-react";

export default function EnvironmentBanner() {
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  const isLocal = process.env.NODE_ENV === "development";
  
  const env = vercelEnv === "preview" ? "preview" : isLocal ? "development" : null;

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
    <div className={`${config.bg} ${config.text} px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest z-[100] sticky top-0 shadow-lg`}>
      {config.icon}
      <span>{config.label}</span>
      <span className="opacity-50 mx-1">|</span>
      <span className="font-medium normal-case tracking-normal opacity-90">
        Changes on this site will not affect Production data.
      </span>
    </div>
  );
}
