import LegalPage from '@/components/legal/LegalPage';
import { getServerT } from '@/lib/i18n/server';
import { PRIVACY_SECTIONS } from '@/lib/legal/sections';

// The operator's name and contact email come from the server environment: read them on every request, not at build.
export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
  const t = await getServerT();
  return <LegalPage title={t('auth.tos.privacy')} sections={PRIVACY_SECTIONS} t={t} />;
}
