// components/common/JoinCircleModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import Link from 'next/link';

interface JoinCircleModalProps {
  open: boolean;
  onClose: () => void;
  context?: 'add-song' | 'general';
}

const COPY = {
  'add-song': {
    title: 'Bring your songs to the fire',
    body: 'Your song is ready. Create an account to share it with the circle — your work will be waiting for you.',
  },
  general: {
    title: 'Join the circle',
    body: 'Create a free account to contribute to the Sacred Fire songbook.',
  },
};

export function JoinCircleModal({ open, onClose, context = 'general' }: JoinCircleModalProps) {
  const copy = COPY[context];

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950/95 border border-amber-500/30 backdrop-blur-xl text-white">
        <DialogHeader className="items-center gap-3 pt-2 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-7 h-7 text-amber-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            {copy.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-gray-400 text-center text-sm leading-relaxed px-4">
          {copy.body}
        </p>

        <div className="flex flex-col gap-3 pt-2 pb-2 px-4">
          <Button
            asChild
            className="w-full bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold"
          >
            <Link href="/auth/sign-up" onClick={onClose}>
              Create Account
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href="/auth/login" onClick={onClose}>
              Log In
            </Link>
          </Button>
          <button
            onClick={onClose}
            className="text-xs text-gray-600 hover:text-gray-500 text-center pt-1"
          >
            Continue browsing
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
