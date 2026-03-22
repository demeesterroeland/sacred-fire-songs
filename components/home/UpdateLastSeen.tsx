'use client';

import { useEffect } from 'react';
import { updateLastSeen } from '@/app/actions/updateLastSeen';

export default function UpdateLastSeen() {
  useEffect(() => {
    updateLastSeen();
  }, []);
  return null;
}
