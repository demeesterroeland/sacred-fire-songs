"use client";

import { Monitor, FileText, Music2, Type, WifiOff, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useUserPreferences } from "@/context/UserPreferencesContext";

interface PreferenceRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
  notSupported?: boolean;
}

function PreferenceRow({
  icon, label, description, checked, onCheckedChange,
  disabled, comingSoon, notSupported,
}: PreferenceRowProps) {
  return (
    <div className={`flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{label}</p>
            {comingSoon && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            {description}
            {notSupported && (
              <span className="text-amber-500 block mt-1">Not supported by your browser</span>
            )}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#f45d1a] shrink-0"
      />
    </div>
  );
}

export default function PreferencesSettings() {
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <section className="bg-slate-800/40 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-3xl space-y-4">
      <h2 className="text-xl font-bold text-white mb-6">App Preferences</h2>

      {/* Keep Screen Awake — functional */}
      <PreferenceRow
        icon={<Monitor className="w-5 h-5" />}
        label="Keep Screen Awake"
        description="Prevent the screen from dimming while viewing lyrics."
        checked={preferences.keepScreenAwake && isSupported}
        onCheckedChange={(v) => setPreference("keepScreenAwake", v)}
        disabled={!isSupported}
        notSupported={!isSupported}
      />

      {/* Auto-scroll Lyrics — disabled */}
      <PreferenceRow
        icon={<FileText className="w-5 h-5" />}
        label="Auto-scroll Lyrics"
        description="Automatically scroll through a song during performance."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Default Chord Display — disabled */}
      <PreferenceRow
        icon={<Music2 className="w-5 h-5" />}
        label="Show Chords by Default"
        description="Always show chord annotations when opening a song."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Font Size — disabled */}
      <PreferenceRow
        icon={<Type className="w-5 h-5" />}
        label="Large Stage Font"
        description="Increase text size for better readability on stage."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Offline Mode — disabled */}
      <PreferenceRow
        icon={<WifiOff className="w-5 h-5" />}
        label="Offline Mode"
        description="Cache songs locally for use without an internet connection."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />

      {/* Browser Theme Color — disabled */}
      <PreferenceRow
        icon={<Palette className="w-5 h-5" />}
        label="Use Browser Theme Color"
        description="Tint the browser chrome to match the app's color on mobile."
        checked={false}
        onCheckedChange={() => {}}
        disabled
        comingSoon
      />
    </section>
  );
}
