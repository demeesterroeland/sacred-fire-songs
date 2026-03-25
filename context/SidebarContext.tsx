'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isOpen: boolean;           // Mobile drawer open state
  setIsOpen: (open: boolean) => void;
  toggleSidebar: () => void; // Toggles drawer on mobile
  headerCount?: number;
  setHeaderCount: (count: number | undefined) => void;
  searchFiltersOpen: boolean;
  setSearchFiltersOpen: (open: boolean) => void;
  hasActiveSearchFilters: boolean;
  setHasActiveSearchFilters: (active: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerCount, setHeaderCount] = useState<number | undefined>(undefined);
  const [searchFiltersOpen, setSearchFiltersOpen] = useState(false);
  const [hasActiveSearchFilters, setHasActiveSearchFilters] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <SidebarContext.Provider value={{
      isOpen,
      setIsOpen,
      toggleSidebar,
      headerCount,
      setHeaderCount,
      searchFiltersOpen,
      setSearchFiltersOpen,
      hasActiveSearchFilters,
      setHasActiveSearchFilters
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
