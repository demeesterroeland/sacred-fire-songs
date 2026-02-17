import UnderConstruction from '@/components/common/feedback/UnderConstruction';
import { useUserPreferences } from '@/context/UserPreferencesContext';

export default function SettingsPage() {
  const { preferences, setPreference } = useUserPreferences();
  const { isSupported } = useWakeLock();

  return (
    <main className="flex-1 bg-gray-950">
      <UnderConstruction
        title="Account Settings"
        description="Your personal sacred space is being prepared. Settings will be available soon."
      />
    </main>
  );
}
