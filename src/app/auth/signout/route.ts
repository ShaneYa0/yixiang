import { NextResponse } from "next/server";
import { clearLocalUser } from "@/lib/local-auth";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } else {
    await clearLocalUser();
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
