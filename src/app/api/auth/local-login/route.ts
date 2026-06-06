import { NextRequest, NextResponse } from "next/server";
import { makeLocalUser, setLocalUser } from "@/lib/local-auth";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({ email: "" }));
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  if (!normalizedEmail.includes("@")) {
    return NextResponse.json({ error: "请输入有效邮箱" }, { status: 400 });
  }

  const user = makeLocalUser(normalizedEmail);
  await setLocalUser(user);

  return NextResponse.json({ user });
}
