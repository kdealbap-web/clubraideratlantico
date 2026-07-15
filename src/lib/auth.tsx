import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { ROUTES } from './constants';
import type { Member, Rol } from '../types';

interface AuthCtx {
  loading: boolean;
  session: Session | null;
  user: User | null;
  member: Member | null;
  signInPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

const ADMIN_ROLES: Rol[] = ['ADMINISTRADOR', 'LIDER'];
const EDITOR_ROLES: Rol[] = ['ADMINISTRADOR', 'LIDER', 'EDITOR'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  const loadMember = useCallback(async (email: string | null | undefined) => {
    if (!email) {
      setMember(null);
      return;
    }
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) {
      setMember(null);
      return;
    }
    setMember((data as Member) ?? null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      loadMember(data.session?.user.email).finally(() => {
        if (active) setLoading(false);
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      loadMember(s?.user.email);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadMember]);

  const signInPassword = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signUpPassword = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<{ error: string | null }> => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMember(null);
  }, []);

  const value = useMemo<AuthCtx>(() => {
    const rol = member?.rol;
    return {
      loading,
      session,
      user: session?.user ?? null,
      member,
      signInPassword,
      signUpPassword,
      resetPassword,
      updatePassword,
      signOut,
      isAdmin: rol ? ADMIN_ROLES.includes(rol) && member.estado === 'activo' : false,
      isEditor: rol ? EDITOR_ROLES.includes(rol) && member.estado === 'activo' : false,
    };
  }, [loading, session, member, signInPassword, signUpPassword, resetPassword, updatePassword, signOut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return v;
}
