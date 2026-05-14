import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from './constants';

interface SidebarCtx {
  collapsed: boolean;
  toggle: () => void;
  set: (v: boolean) => void;
}

const Ctx = createContext<SidebarCtx | null>(null);

function readInitial(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEYS.sidebar);
    if (stored === 'collapsed') return true;
    if (stored === 'expanded') return false;
  } catch {
    /* storage blocked */
  }
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 880px)').matches) {
    return true;
  }
  return false;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.sidebar, collapsed ? 'collapsed' : 'expanded');
    } catch {
      /* storage blocked */
    }
  }, [collapsed]);

  const toggle = useCallback(() => setCollapsed((v) => !v), []);

  return <Ctx.Provider value={{ collapsed, toggle, set: setCollapsed }}>{children}</Ctx.Provider>;
}

export function useSidebar(): SidebarCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSidebar debe usarse dentro de <SidebarProvider>');
  return v;
}
