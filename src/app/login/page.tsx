"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseBrowserConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMessage("");

    if (!isSupabaseBrowserConfigured()) {
      const response = await fetch("/api/auth/local-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);
      if (!response.ok) {
        setMessage(data.error ?? "登录失败");
        return;
      }
      window.location.href = "/me";
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    setMessage(error ? error.message : "登录邮件已发送，请查收邮箱并点击链接。");
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card className="p-0">
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">登录</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.08em] text-ink dark:text-paper">邮箱验证</h2>
        </div>
        <div className="px-6 py-5">
          <label className="block">
            <span className="text-[11px] font-medium tracking-[0.12em] text-ink-fade">邮箱地址</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 min-h-12 w-full border border-divider bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
            />
          </label>
          <Button onClick={submit} disabled={loading || !email.includes("@")} className="mt-5 w-full">
            {loading ? "发送中" : "发送登录邮件"}
          </Button>
          {message && (
            <p className="mt-4 rounded-lg bg-divider/20 px-4 py-3 text-[12px] leading-relaxed text-ink-light dark:bg-divider/10">
              {message}
            </p>
          )}
          <div className="mt-5 border-t border-divider pt-4 text-center">
            <p className="text-[12px] text-ink-fade">
              还没有账户？{" "}
              <Link href="/register" className="text-ink underline underline-offset-4 hover:opacity-70 dark:text-paper">
                去注册
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
