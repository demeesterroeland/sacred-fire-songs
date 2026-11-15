import type { ReactNode } from 'react';
import { readOperator } from '@/lib/legal/operator';
import type { LegalSection } from '@/lib/legal/sections';
import type { TranslateFn } from '@/lib/i18n';
import type { TranslationKey } from '@/messages/en';

interface LegalPageProps {
  title: string;
  sections: LegalSection[];
  t: TranslateFn;
}

/**
 * A legal page: title, the Draft note, who runs this server, then the sections. A server component: the operator
 * details are read from the server environment on each request.
 */
export default function LegalPage({ title, sections, t }: LegalPageProps) {
  const operator = readOperator();
  const k = (key: string) => t(key as TranslationKey);

  let operatorBody: ReactNode;
  if (!operator.name && !operator.email) {
    operatorBody = <p>{k('legal.operator.none')}</p>;
  } else {
    operatorBody = (
      <>
        {operator.name && <p>{t('legal.operator.nameLine', { name: operator.name })}</p>}
        <p>
          {operator.email ? (
            <>
              {k('legal.operator.contactLine')}{' '}
              <a href={`mailto:${operator.email}`} className="font-medium text-fg underline underline-offset-4">{operator.email}</a>
            </>
          ) : (
            k('legal.operator.noEmail')
          )}
        </p>
      </>
    );
  }

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12" data-testid="legal-page">
      <h1 className="text-title font-semibold tracking-tight text-fg md:text-display">{title}</h1>
      <p role="note" data-testid="legal-draft" className="mt-4 rounded-panel border border-line-strong bg-surface p-3 text-meta text-fg">
        {k('legal.draft')}
      </p>

      <section className="mt-8 space-y-2 text-body text-fg-muted">
        <h2 className="text-row font-semibold text-fg">{k('legal.operator.title')}</h2>
        {operatorBody}
      </section>

      {sections.map((s) => (
        <section key={s.id} className="mt-8 space-y-2 text-body text-fg-muted">
          <h2 className="text-row font-semibold text-fg">{k(s.titleKey)}</h2>
          {s.paragraphKeys.map((p) => (
            <p key={p}>{k(p)}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
