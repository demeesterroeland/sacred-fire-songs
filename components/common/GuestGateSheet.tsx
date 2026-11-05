'use client';

import { BottomSheet, BottomSheetContent } from '@/components/ui/bottom-sheet';
import GuestGate from '@/components/common/GuestGate';
import { useLocale } from '@/context/LocaleContext';
import { guestGateKeys, type GuestGateFeature } from '@/lib/auth/guestGate';

/**
 * The GuestGate for an inline action (save a favourite, add to a playlist) on a screen
 * guests may otherwise use: the same card as the full-screen gate, in a bottom sheet.
 * Sign-in returns to the current path + query.
 */
export default function GuestGateSheet({
  feature,
  open,
  onOpenChange,
}: {
  feature: GuestGateFeature;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useLocale();
  const next = open && typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent title={t(guestGateKeys(feature).title)} hideTitle>
        <div className="p-4">
          <GuestGate feature={feature} next={next} variant="card" />
        </div>
      </BottomSheetContent>
    </BottomSheet>
  );
}
