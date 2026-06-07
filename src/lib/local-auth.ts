import { cookies } from "next/headers";

const cookieName = "yixiang_local_user";

export type LocalUser = {
  id: string;
  email: string;
  isLocal: true;
};

export function makeLocalUser(email: string): LocalUser {
  const normalizedEmail = email.toLowerCase();

  return {
    id: `local-${normalizedEmail}`,
    email: normalizedEmail,
    isLocal: true,
  };
}

export async function getLocalUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieName)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as LocalUser;
  } catch {
    return null;
  }
}

export async function setLocalUser(user: LocalUser) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, Buffer.from(JSON.stringify(user), "utf8").toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function updateLocalUser(updater: (user: LocalUser) => LocalUser) {
  const user = await getLocalUser();
  if (!user) return null;
  const nextUser = updater(user);
  await setLocalUser(nextUser);
  return nextUser;
}

export async function clearLocalUser() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
