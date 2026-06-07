import { NextResponse } from "next/server";
import { resolveAuthUser } from "@/lib/auth-utils";

export async function GET() {
  const user = await resolveAuthUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      isLocal: user.isLocal,
    },
  });
}
