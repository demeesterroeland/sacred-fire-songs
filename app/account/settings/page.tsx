'use client';

import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <main className="flex-1 bg-gray-950 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-12">
        <header>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure your digital songbook performance and experience.</p>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-200 border-b border-gray-800 pb-2">Display & Performance</h2>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-gray-700 transition-colors group">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 group-hover:scale-110 transition-transform">
                  visibility
                </span>
                <h3 className="font-medium text-white">Keep Screen Awake</h3>
              </div>
              <p className="text-sm text-gray-400">
                Prevent the screen from dimming or sleeping while viewing lyrics.
                {!isSupported && <span className="text-amber-500 block mt-1">(Not supported by your browser)</span>}
              </p>
            </div>

            <Switch
              checked={preferences.keepScreenAwake && isSupported}
              onCheckedChange={(checked: boolean) => setPreference('keepScreenAwake', checked)}
              disabled={!isSupported}
              className="data-[state=checked]:bg-red-600"
            />
          </div>
        </section>

        <section className="pt-12">
          <p className="text-xs text-center text-gray-600 italic">
            "Keep the fire burning, the heart singing, and the screen shining."
          </p>
        </section>
      </div>
    </main>
  );
}
