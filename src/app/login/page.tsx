"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseBrowserConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMessage("");

    if (!email.includes("@") || password.length < 6) {
      setMessage("请输入有效的邮箱和密码（密码至少6位）");
      setLoading(false);
      return;
    }

    // Supabase email+password login
    if (isSupabaseBrowserConfigured()) {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setMessage(error.message === "Invalid login credentials"
          ? "邮箱或密码错误"
          : error.message);
        return;
      }
      window.location.href = "/me";
      return;
    }

    // Local dev fallback
    const response = await fetch("/api/auth/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "登录失败");
      return;
    }
    window.location.href = "/me";
  };

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card className="p-0">
        <div className="border-b border-divider px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-fade">登录</p>
          <h2 className="mt-2 text-lg font-semibold tracking-[0.08em] text-ink dark:text-paper">欢迎回来</h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="text-[11px] font-medium tracking-[0.12em] text-ink-fade">邮箱地址</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="mt-2 min-h-12 w-full border border-divider bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-medium tracking-[0.12em] text-ink-fade">密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full border border-divider bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-fade focus:border-ink dark:bg-card dark:text-paper"
            />
          </label>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "登录中" : "登录"}
          </Button>
          {message && (
            <p className="rounded-lg bg-divider/20 px-4 py-3 text-[12px] leading-relaxed text-ink-light dark:bg-divider/10">
              {message}
            </p>
          )}
          <div className="border-t border-divider pt-4 text-center">
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
