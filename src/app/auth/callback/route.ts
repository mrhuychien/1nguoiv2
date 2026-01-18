import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Extract user metadata from Google OAuth
      const metadata = user.user_metadata;
      const avatarUrl = metadata?.avatar_url || metadata?.picture || null;
      const fullName = metadata?.full_name || metadata?.name || null;
      const email = user.email;

      // Check if profile exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingProfile } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("profiles")
          .update({
            email: email,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      } else {
        // Insert new profile
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("profiles").insert({
          id: user.id,
          email: email,
          full_name: fullName,
          avatar_url: avatarUrl,
        });
      }

      // If it's a password recovery, redirect to password reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
