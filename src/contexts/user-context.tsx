"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";

interface UserInfo {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  // Computed user info that combines profile and auth metadata
  const getUserInfo = useCallback((authUser: User | null, userProfile: Profile | null): UserInfo | null => {
    if (!authUser) return null;

    const metadata = authUser.user_metadata;

    return {
      id: authUser.id,
      email: userProfile?.email || authUser.email || null,
      fullName: userProfile?.full_name || metadata?.full_name || metadata?.name || null,
      avatarUrl: userProfile?.avatar_url || metadata?.avatar_url || metadata?.picture || null,
    };
  }, []);

  // Fetch profile for a user
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error: profileError } = await supabaseAny
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.warn("Profile fetch warning:", profileError.message);
      } else if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn("Profile fetch failed:", err);
    }
  }, []);

  // Handle session change
  const handleSession = useCallback((session: Session | null) => {
    console.log("[Auth] Session changed:", session?.user?.email || "no user");

    if (session?.user) {
      setUser(session.user);
      setIsLoading(false);
      // Fetch profile in background
      fetchProfile(session.user.id);
    } else {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;
    let hasReceivedEvent = false;

    console.log("[Auth] Setting up auth listener...");

    // Listen for auth state changes - this is the primary source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        console.log("[Auth] Auth state changed:", event);
        hasReceivedEvent = true;

        if (event === 'INITIAL_SESSION') {
          // This fires immediately with the current session from cookies
          handleSession(session);
        } else if (event === 'SIGNED_IN') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user);
          }
        }
      }
    );

    // Fallback timeout - if INITIAL_SESSION doesn't fire within 3 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted && !hasReceivedEvent) {
        console.warn("[Auth] Fallback timeout - no auth event received");
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      setUser(null);
      setProfile(null);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (err) {
      console.error("Sign out error:", err);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  const userInfo = getUserInfo(user, profile);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        userInfo,
        isLoading,
        error,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
