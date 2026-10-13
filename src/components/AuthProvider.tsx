"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
}>({ user: null, isLoading: false, loading: false, isAuthenticated: false });
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    const {
      data: { subscription },
    } = createClient().auth.onAuthStateChange((_event, session) =>
      setUser(session?.user || null),
    );
    return () => subscription.unsubscribe();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        loading: false,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
