'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;           // Mobile drawer open state
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void; // Toggles drawer on mobile
  headerCount?: number;
  setHeaderCount: (count: number | undefined) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerCount, setHeaderCount] = useState<number | undefined>(undefined);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{
      isOpen,
      setIsOpen,
      toggleSidebar,
      headerCount,
      setHeaderCount
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
