import { createContext, useContext, useEffect, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

// Tema OSCURO forzado. El club usa únicamente el tema oscuro; el modo claro
// quedó deshabilitado. Se mantiene la API (theme/toggle/set) por compatibilidad
// con los consumidores existentes, pero el DOM siempre permanece en oscuro
// (sin atributo data-theme = tokens oscuros por defecto).
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.removeAttribute('data-theme');
  }, []);

  const value: ThemeCtx = {
    theme: 'dark',
    toggle: () => {},
    set: () => {},
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return v;
}
