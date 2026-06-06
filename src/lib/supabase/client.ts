import { createBrowserClient } from "@supabase/ssr";

export const isSupabaseBrowserConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return false;
  if (url.includes("[") || url.includes("]")) return false;
  if (key.startsWith("[") || key === "YOUR_ANON_KEY") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
