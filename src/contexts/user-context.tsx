"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
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
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

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

  useEffect(() => {
    if (isInitialized) return;

    let isMounted = true;
    const supabase = createClient();

    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        if (!session?.user) {
          setIsLoading(false);
          setIsInitialized(true);
          return;
        }

        // Set user immediately from session
        setUser(session.user);

        // Fetch profile
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const supabaseAny = supabase as any;
          const { data: profileData, error: profileError } = await supabaseAny
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.warn("Profile fetch warning:", profileError.message);
          } else if (isMounted && profileData) {
            setProfile(profileData);
          }
        } catch (profileErr) {
          console.warn("Profile fetch failed:", profileErr);
        }

        // Validate user in background
        supabase.auth.getUser().catch(() => {});
      } catch (err) {
        if (!isMounted) return;
        if (err instanceof Error && (err.name === 'AbortError' || err.message?.includes('aborted'))) {
          // Ignore abort errors
        } else {
          console.error("Session error:", err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);

          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const supabaseAny = supabase as any;
            const { data: profileData } = await supabaseAny
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (isMounted && profileData) {
              setProfile(profileData);
            }
          } catch (err) {
            console.error("Profile fetch on sign in:", err);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]);

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
