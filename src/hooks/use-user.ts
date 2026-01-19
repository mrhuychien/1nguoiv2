"use client";

import { useEffect, useState, useRef } from "react";
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
  const isMountedRef = useRef(true);

  // Computed user info that combines profile and auth metadata
  const getUserInfo = (authUser: User | null, userProfile: Profile | null): UserInfo | null => {
    if (!authUser) return null;

    const metadata = authUser.user_metadata;

    return {
      id: authUser.id,
      email: userProfile?.email || authUser.email || null,
      fullName: userProfile?.full_name || metadata?.full_name || metadata?.name || null,
      avatarUrl: userProfile?.avatar_url || metadata?.avatar_url || metadata?.picture || null,
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        // Check if component is still mounted
        if (!isMountedRef.current) return;

        if (error) {
          // Ignore abort errors
          if (error.message?.includes('aborted')) return;
          console.error("Error getting user:", error);
          setIsLoading(false);
          return;
        }

        setUser(user);

        if (user) {
          // Fetch profile
          const { data: profile, error: profileError } = await supabaseAny
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!isMountedRef.current) return;

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is expected if profile doesn't exist
            console.error("Error fetching profile:", profileError);
          }

          setProfile(profile);

          // If no profile exists, create one with auth metadata
          if (!profile) {
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

            if (isMountedRef.current) {
              setProfile(createdProfile);
            }
          }
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') return;
        if (isMountedRef.current) {
          console.error("Error getting user:", error);
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

        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile on sign in
          const { data: profile } = await supabaseAny
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!isMountedRef.current) return;

          if (profile) {
            setProfile(profile);
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

            if (isMountedRef.current) {
              setProfile(createdProfile);
            }
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

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const userInfo = getUserInfo(user, profile);

  return {
    user,
    profile,
    userInfo,
    isLoading,
    signOut,
    isAuthenticated: !!user,
  };
}
