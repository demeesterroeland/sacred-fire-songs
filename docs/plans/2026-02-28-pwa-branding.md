# PWA Installability & Branding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Sacred Fire Songs installable as a standalone PWA with a hand-drawn flame+♪ icon, deep red-black branding, and a CSS-animated embers splash screen.

**Architecture:** Next.js 16 App Router's `app/manifest.ts` auto-generates the `/manifest.webmanifest` route and injects the `<link rel="manifest">` header. A minimal `public/sw.js` (registered via a client component) satisfies the browser installability criteria. PNG icons are generated from SVG via a one-time `sharp` script. The splash/loading screen uses `app/loading.tsx` with the same rising-embers animation already used in `FinishRegistrationForm`.

**Tech Stack:** Next.js 16 App Router · `MetadataRoute.Manifest` · `sharp` (devDep, icon generation) · Vanilla JS service worker · Tailwind CSS v4

**Stories:** 3.3.1 (installability) · 3.3.2 (branding)

**Branch:** `feat/userstory-3.3`

---

## Task 1: SVG Icon

**Files:**
- Create: `public/icons/icon.svg` — master icon (512×512 viewBox, organic flame + ♪)
- Replace: `public/favicon.svg` — same design at 32×32 scale

**Step 1: Create `public/icons/` directory and `icon.svg`**

```bash
mkdir -p public/icons
```

Create `public/icons/icon.svg` with this content:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="65%" r="55%">
      <stop offset="0%" stop-color="#3d0a0a"/>
      <stop offset="100%" stop-color="#080000"/>
    </radialGradient>
    <linearGradient id="flame" x1="0.5" y1="1" x2="0.5" y2="0">
      <stop offset="0%"   stop-color="#e83a00"/>
      <stop offset="45%"  stop-color="#ff6a1a"/>
      <stop offset="80%"  stop-color="#ffc040"/>
      <stop offset="100%" stop-color="#ffe89a"/>
    </linearGradient>
    <linearGradient id="inner-flame" x1="0.5" y1="1" x2="0.5" y2="0">
      <stop offset="0%"   stop-color="#ff8c00"/>
      <stop offset="100%" stop-color="#fffbe0"/>
    </linearGradient>
  </defs>

  <!-- Background rounded square -->
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>

  <!-- Outer flame (organic, slightly asymmetric) -->
  <path d="
    M256 420
    C220 420 170 390 155 340
    C140 290 162 248 175 215
    C188 182 192 158 180 120
    C195 140 200 158 205 140
    C210 122 215 95 230 72
    C238 58 248 46 256 38
    C264 46 274 58 282 72
    C297 95 302 122 307 140
    C312 158 317 140 332 120
    C320 158 324 182 337 215
    C350 248 372 290 357 340
    C342 390 292 420 256 420 Z
  " fill="url(#flame)" opacity="0.92"/>

  <!-- Inner flame highlight -->
  <path d="
    M256 390
    C235 390 205 370 196 335
    C187 300 200 272 210 248
    C218 228 220 210 214 185
    C224 198 228 210 232 200
    C236 190 240 165 250 148
    C252 143 254 138 256 134
    C258 138 260 143 262 148
    C272 165 276 190 280 200
    C284 210 288 198 298 185
    C292 210 294 228 302 248
    C312 272 325 300 316 335
    C307 370 277 390 256 390 Z
  " fill="url(#inner-flame)" opacity="0.7"/>

  <!-- Musical note stem (rises through flame) -->
  <line
    x1="268" y1="378"
    x2="268" y2="210"
    stroke="#ffe0a0"
    stroke-width="14"
    stroke-linecap="round"
    opacity="0.95"
  />

  <!-- Note flag (curves right, organic) -->
  <path
    d="M268 210 C308 225 312 268 290 280"
    stroke="#ffe0a0"
    stroke-width="12"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    opacity="0.95"
  />

  <!-- Note head (solid oval, slightly tilted) -->
  <ellipse
    cx="254" cy="375"
    rx="24" ry="18"
    transform="rotate(-20 254 375)"
    fill="#ffe0a0"
    opacity="0.95"
  />

  <!-- Ember sparks -->
  <circle cx="195" cy="155" r="5" fill="#ffc040" opacity="0.7"/>
  <circle cx="308" cy="130" r="4" fill="#ffdb80" opacity="0.6"/>
  <circle cx="175" cy="200" r="3" fill="#ff8c00" opacity="0.5"/>
  <circle cx="335" cy="190" r="3.5" fill="#ffd060" opacity="0.55"/>
  <circle cx="220" cy="90"  r="3"   fill="#ffe08a" opacity="0.5"/>
</svg>
```

**Step 2: Replace `public/favicon.svg`**

Replace the contents of `public/favicon.svg` with the same icon but scaled to 32×32. The simplest approach is to reference the 32px PNG (generated in Task 2), but for now update the SVG to use the new design:

```svg
<svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- identical to public/icons/icon.svg — browser renders at 32px -->
  <!-- (copy the full SVG content from public/icons/icon.svg) -->
</svg>
```

**Step 3: Commit**

```bash
git add public/icons/icon.svg public/favicon.svg
git commit -m "feat: [Story 3.3.2] Add hand-drawn flame+note SVG icon"
```

---

## Task 2: Generate PNG Icons via Sharp

**Files:**
- Create: `scripts/generate-icons.mjs`
- Create (generated): `public/icons/icon-16.png`, `icon-32.png`, `icon-180.png`, `icon-192.png`, `icon-512.png`

**Step 1: Install `sharp` as a devDependency**

```bash
npm install --save-dev sharp
```

**Step 2: Create `scripts/generate-icons.mjs`**

```js
// scripts/generate-icons.mjs
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public/icons/icon.svg');
const outDir = resolve(root, 'public/icons');

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: 'icon-16.png',  size: 16  },
  { name: 'icon-32.png',  size: 32  },
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

const svgBuffer = readFileSync(svgPath);

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(outDir, name));
  console.log(`✓ Generated ${name}`);
}
console.log('All icons generated.');
```

**Step 3: Run the generator**

```bash
node scripts/generate-icons.mjs
```

Expected output:
```
✓ Generated icon-16.png
✓ Generated icon-32.png
✓ Generated icon-180.png
✓ Generated icon-192.png
✓ Generated icon-512.png
All icons generated.
```

Verify files exist:
```bash
ls -lh public/icons/
```

**Step 4: Commit**

```bash
git add scripts/generate-icons.mjs public/icons/
git commit -m "feat: [Story 3.3.2] Add icon generation script and PNG icons"
```

---

## Task 3: Web App Manifest

**Files:**
- Create: `app/manifest.ts`

Next.js 16 App Router automatically serves `app/manifest.ts` at `/manifest.webmanifest` and injects `<link rel="manifest">` into every page's `<head>`.

**Step 1: Create `app/manifest.ts`**

```ts
// app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sacred Fire Songs',
    short_name: 'Sacred Fire',
    description: 'A digital songbook for medicine music ceremonies.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#080000',
    theme_color: '#1a0505',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
```

**Step 2: Verify manifest is served**

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/manifest.webmanifest | head -20
```

Expected: JSON with `name`, `icons`, `display: "standalone"`.

**Step 3: Commit**

```bash
git add app/manifest.ts
git commit -m "feat: [Story 3.3.1] Add PWA web app manifest"
```

---

## Task 4: Service Worker + Registrar Component

**Files:**
- Create: `public/sw.js`
- Create: `components/providers/ServiceWorkerRegistrar.tsx`

The browser only considers an app installable if a service worker is registered. The SW itself can be minimal — no caching required for 3.3.1 (offline caching is Story 4.5.1).

**Step 1: Create `public/sw.js`**

```js
// public/sw.js
const CACHE = 'sfs-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Minimal fetch handler — pass through to network.
// Caching strategy (offline fallback) is deferred to Story 4.5.1.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
```

**Step 2: Create `components/providers/ServiceWorkerRegistrar.tsx`**

```tsx
// components/providers/ServiceWorkerRegistrar.tsx
'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => console.error('[SW] Registration failed:', err));
    }
  }, []);

  return null;
}
```

**Step 3: Commit**

```bash
git add public/sw.js components/providers/ServiceWorkerRegistrar.tsx
git commit -m "feat: [Story 3.3.1] Add minimal service worker and registrar component"
```

---

## Task 5: Update `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

Add:
1. `apple-touch-icon`, `theme-color`, and `apple-mobile-web-app` meta tags via the `metadata` export.
2. `<ServiceWorkerRegistrar>` component import inside `<body>`.

**Step 1: Read current `app/layout.tsx`** (already read — lines 1–88)

**Step 2: Update the `metadata` export (lines 20–26)**

Replace:
```ts
export const metadata: Metadata = {
  title: getSiteTitle(),
  description: "A digital songbook for medicine music ceremonies.",
  icons: {
    icon: "/favicon.svg",
  },
};
```

With:
```ts
export const metadata: Metadata = {
  title: getSiteTitle(),
  description: "A digital songbook for medicine music ceremonies.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg',       type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-180.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Sacred Fire',
  },
};
```

**Step 3: Add `<meta name="theme-color">` and `<ServiceWorkerRegistrar>` to the layout body**

In the `<head>` block (after line 39), add:
```tsx
<meta name="theme-color" content="#1a0505" />
```

In the `<body>` block, add `<ServiceWorkerRegistrar />` right after the opening `<body>` tag:
```tsx
<body ...>
  <ServiceWorkerRegistrar />
  <EnvironmentBanner />
  ...
```

Also add the import at the top of the file:
```ts
import ServiceWorkerRegistrar from "@/components/providers/ServiceWorkerRegistrar";
```

**Step 4: Verify**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes without errors. Check that `manifest.webmanifest` appears in the build output.

**Step 5: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: [Story 3.3.2] Add PWA meta tags and service worker registrar to layout"
```

---

## Task 6: Splash / Loading Screen

**Files:**
- Create: `app/loading.tsx`

Next.js 16 App Router uses `app/loading.tsx` as a `<Suspense>` fallback for all routes under `app/`. On PWA launch, this is the first visual — making it the ideal branded splash screen.

The design replicates the `FireEmbers` animation from `components/finish-registration-form.tsx`: rising orange/red glowing particles on a dark background, with the app icon and name centred.

**Step 1: Create `app/loading.tsx`**

```tsx
// app/loading.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Ember {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Loading() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmbers((prev) => [
        ...prev.slice(-40),
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
    <div className="fixed inset-0 bg-[#080000] flex flex-col items-center justify-center z-50">
      {/* Rising embers */}
      <div className="fixed inset-0 pointer-events-none">
        {embers.map((ember) => (
          <div
            key={ember.id}
            className="loading-ember"
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

      {/* Centred brand */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <Image
          src="/icons/icon-192.png"
          alt="Sacred Fire Songs"
          width={96}
          height={96}
          className="rounded-2xl shadow-[0_0_40px_rgba(220,60,0,0.4)]"
          priority
        />
        <h1 className="text-2xl font-semibold tracking-wide text-amber-100">
          Sacred Fire Songs
        </h1>
        <p className="text-sm text-amber-900/80 tracking-widest uppercase">
          Medicine Music
        </p>
      </div>

      {/* Keyframe styles — defined inline so this file is self-contained */}
      <style>{`
        @keyframes loading-ember-rise {
          0%   { transform: translateY(0)      scale(1)   rotate(0deg);   opacity: 0; }
          20%  { opacity: 0.8; }
          80%  { opacity: 0.4; }
          100% { transform: translateY(-100vh) scale(0.3) rotate(360deg); opacity: 0; }
        }
        .loading-ember {
          position: absolute;
          bottom: -10px;
          background: #f45d1a;
          border-radius: 50%;
          box-shadow: 0 0 10px #d9481e, 0 0 20px #f45d1a;
          pointer-events: none;
          animation: loading-ember-rise linear forwards;
        }
      `}</style>
    </div>
  );
}
```

**Step 2: Verify**

```bash
npm run dev
```

Navigate to any route while on a slow connection, or force a slow network in DevTools — the loading screen should appear with rising embers.

**Step 3: Commit**

```bash
git add app/loading.tsx
git commit -m "feat: [Story 3.3.2] Add branded splash/loading screen with ember animation"
```

---

## Manual Verification Checklist (Stories 3.3.1 & 3.3.2)

Run `npm run dev`, open in Chrome on Android or use Chrome DevTools → Application panel.

- [ ] **Manifest detected**: DevTools → Application → Manifest shows name, icons, display: standalone
- [ ] **Service worker registered**: DevTools → Application → Service Workers shows `sw.js` as active
- [ ] **Install prompt**: On a real device (or Lighthouse simulation), the browser offers "Add to Home Screen"
- [ ] **Standalone launch**: After installing, tapping the icon opens the app without browser chrome
- [ ] **App icon**: Home screen shows the flame+♪ icon with name "Sacred Fire Songs"
- [ ] **Theme color**: Status bar in Android shows `#1a0505` dark red
- [ ] **Apple**: On iOS Safari, Add to Home Screen shows the 180px icon and "Sacred Fire" name
- [ ] **Loading screen**: Visible with rising embers when navigating to any route while loading
- [ ] **Build passes**: `npm run build` completes without errors
- [ ] **Lighthouse PWA score**: Run Lighthouse → PWA audit, should score ≥ 90

```bash
npm run build
```
