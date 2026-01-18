"use client";

import { useEffect, useState } from "react";
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
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseAny = supabase as any;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch profile
          const { data: profile } = await supabaseAny
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

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

            setProfile(createdProfile);
          }
        }
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile on sign in
          const { data: profile } = await supabaseAny
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

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

            setProfile(createdProfile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
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
