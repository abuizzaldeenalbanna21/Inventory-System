import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Boxes, Languages, RefreshCw, LockKeyhole } from "lucide-react";
import { getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";

import { Button } from "../components/shared-ui";
import { useLang } from "../hooks/use-language";

export function SignInPage() {
  const { t, toggle, lang } = useLang();
  const client = useQueryClient();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (response.status === 401) {
        setError(t.invalidCredentials);
        return;
      }
      if (!response.ok) {
        throw new Error(`Login request failed with HTTP ${response.status}`);
      }
      const result = (await response.json()) as { success?: boolean };
      if (!result.success) {
        setError(t.invalidCredentials);
        return;
      }
      await client.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      setLocation("/dashboard");
    } catch (exception) {
      console.error("Sign-in failed.", exception);
      setError(t.noConnection);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      <button
        className="language-btn auth-language"
        onClick={toggle}
        data-testid="button-auth-language"
      >
        <Languages size={15} />
        {t.language}
      </button>
      <section className="modal-card auth-card">
        <Link href="/" className="brand auth-brand">
          <span className="brand-mark">
            <Boxes size={20} />
          </span>
          <span>
            <b>{t.brand}</b>
            <small>{t.subtitle}</small>
          </span>
        </Link>
        <h1>{t.signIn}</h1>
        <p>{t.welcomeText}</p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field span-2">
              <span>{t.username}</span>
              <input
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="field span-2">
              <span>{t.password}</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </div>
          {error && <div className="inline-notice danger-notice">{error}</div>}
          <div className="modal-actions">
            <Button type="submit" disabled={busy}>
              {busy ? (
                <RefreshCw size={15} className="spin" />
              ) : (
                <LockKeyhole size={15} />
              )}
              {t.signIn}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
