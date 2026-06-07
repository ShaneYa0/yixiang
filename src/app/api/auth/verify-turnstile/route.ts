import { NextRequest, NextResponse } from "next/server";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: "" }));

  if (!TURNSTILE_SECRET_KEY) {
    return NextResponse.json({ error: "Turnstile not configured" }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const formData = new FormData();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  const data = await result.json();
  if (!data.success) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
