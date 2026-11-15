import LegalPage from '@/components/legal/LegalPage';
import { getServerT } from '@/lib/i18n/server';
import { TERMS_SECTIONS } from '@/lib/legal/sections';

// The operator's name and contact email come from the server environment: read them on every request, not at build.
export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  const t = await getServerT();
  return <LegalPage title={t('auth.tos.terms')} sections={TERMS_SECTIONS} t={t} />;
}
