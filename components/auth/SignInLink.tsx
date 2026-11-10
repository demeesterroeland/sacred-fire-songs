import Link from 'next/link';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';

/**
 * The one "Sign in" button: the accent primary Button as a link. The header and every popup that
 * sends a guest to the login page use this, so the button never looks different from place to place.
 */
export function SignInLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Button asChild className={className}>
      <Link {...props} />
    </Button>
  );
}
