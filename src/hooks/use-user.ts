"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";

interface UserInfo {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);

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
    // Prevent double initialization in StrictMode
    if (initAttemptedRef.current) return;
    initAttemptedRef.current = true;

    isMountedRef.current = true;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // Check if component is still mounted
        if (!isMountedRef.current) return;

        if (authError) {
          // Ignore abort errors - they're normal in React StrictMode
          if (authError.name === 'AbortError' ||
              authError.message?.includes('aborted') ||
              authError.message?.includes('AbortError')) {
            setIsLoading(false);
            return;
          }
          console.error("Error getting user:", authError);
          setError(authError);
          setIsLoading(false);
          return;
        }

        setUser(user);

        if (user) {
          // Fetch profile
          try {
            const { data: profileData, error: profileError } = await supabaseAny
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (!isMountedRef.current) return;

            if (profileError && profileError.code !== 'PGRST116') {
              // PGRST116 = no rows returned, which is expected if profile doesn't exist
              console.error("Error fetching profile:", profileError);
            }

            if (profileData) {
              setProfile(profileData);
            } else {
              // If no profile exists, create one with auth metadata
              const metadata = user.user_metadata;
              const newProfile = {
                id: user.id,
                email: user.email,
                full_name: metadata?.full_name || metadata?.name || null,
                avatar_url: metadata?.avatar_url || metadata?.picture || null,
              };

              const { data: createdProfile } = await supabaseAny
                .from("profiles")
                .insert(newProfile)
                .select()
                .single();

              if (isMountedRef.current && createdProfile) {
                setProfile(createdProfile);
              }
            }
          } catch (profileErr) {
            // Profile fetch errors shouldn't block the user session
            console.error("Profile error:", profileErr);
          }
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error) {
          if (err.name === 'AbortError' || err.message?.includes('aborted')) {
            setIsLoading(false);
            return;
          }
        }
        if (isMountedRef.current) {
          console.error("Error in getInitialSession:", err);
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return;

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            // Fetch profile on sign in
            const { data: profileData } = await supabaseAny
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (!isMountedRef.current) return;

            if (profileData) {
              setProfile(profileData);
            } else {
              // Create profile if doesn't exist
              const metadata = session.user.user_metadata;
              const newProfile = {
                id: session.user.id,
                email: session.user.email,
                full_name: metadata?.full_name || metadata?.name || null,
                avatar_url: metadata?.avatar_url || metadata?.picture || null,
              };

              const { data: createdProfile } = await supabaseAny
                .from("profiles")
                .insert(newProfile)
                .select()
                .single();

              if (isMountedRef.current && createdProfile) {
                setProfile(createdProfile);
              }
            }
          } catch (err) {
            console.error("Error in auth state change:", err);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Sign out error:", signOutError);
        throw signOutError;
      }

      // Clear local state
      setUser(null);
      setProfile(null);

      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error("Error signing out:", err);
      // Force redirect even if error
      window.location.href = '/login';
    }
  }, []);

  const userInfo = getUserInfo(user, profile);

  return {
    user,
    profile,
    userInfo,
    isLoading,
    error,
    signOut,
    isAuthenticated: !!user,
  };
}
