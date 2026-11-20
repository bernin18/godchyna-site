import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { signInWithTwitch, signOut, useAuthSession } from "./auth";
import { useLanguage } from "./i18n";
import { supabase } from "./supabase";
import { verifyMaintenanceAdmin } from "./maintenanceAccess";
import "./maintenance.css";

export const SITE_MAINTENANCE_ENABLED = false;

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthSession();
  const { pick } = useLanguage();
  const [access, setAccess] = useState<{ userId: string; admin: boolean } | null>(null);
  const [retry, setRetry] = useState(0);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState("");
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!SITE_MAINTENANCE_ENABLED || loading || !userId) return;
    let cancelled = false;
    async function checkAccess() {
      const admin = await verifyMaintenanceAdmin(
        userId,
        async () => {
          const { data, error } = await supabase.auth.getUser();
          if (error) throw error;
          return data.user;
        },
        async id => {
          const { data, error } = await supabase.from("profiles").select("role").eq("id", id).maybeSingle();
          if (error) throw error;
          return data?.role ?? null;
        },
      );
      if (!cancelled) setAccess({ userId: userId!, admin });
    }
    void checkAccess();
    const timer = window.setInterval(() => void checkAccess(), 30_000);
    const onFocus = () => void checkAccess();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [loading, userId, retry]);

  if (!SITE_MAINTENANCE_ENABLED) return <>{children}</>;
  const currentAccess = userId && access?.userId === userId ? access : null;
  if (!loading && currentAccess?.admin) return <>{children}<div className="maintenance-admin-indicator">{pick("MANUTENÇÃO · ACESSO ADMIN", "MAINTENANCE · ADMIN ACCESS")}</div></>;

  const checking = loading || Boolean(userId && !currentAccess);
  async function enterAdmin() {
    setError("");
    setSigningIn(true);
    try {
      if (user) {
        const { error } = await signOut();
        if (error) throw error;
        setAccess(null);
      }
      const { error } = await signInWithTwitch(window.location.pathname.replace(/^\/+/, ""));
      if (error) throw error;
    } catch {
      setError(pick("Não foi possível iniciar sessão. Tenta novamente.", "Unable to sign in. Please try again."));
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <main className="site-maintenance">
      <section className="site-maintenance-card" aria-labelledby="maintenance-title">
        <div className="maintenance-brand">CHYNA</div>
        <p className="maintenance-status"><span aria-hidden="true" />{pick("ATUALIZAÇÕES EM CURSO", "UPDATES IN PROGRESS")}</p>
        <h1 id="maintenance-title">{pick("Estamos em manutenção", "We're under maintenance")}</h1>
        <p className="maintenance-description">{pick("Estamos a preparar novidades para o site. Voltamos em breve!", "We're preparing something new for the site. We'll be back soon!")}</p>
        <div className="maintenance-divider" />
        {checking ? <p className="maintenance-access-note" role="status">{pick("A verificar acesso…", "Checking access…")}</p> : (
          <>
            <button className="maintenance-login" type="button" disabled={signingIn} onClick={() => void enterAdmin()}>{signingIn ? pick("A entrar…", "Signing in…") : user ? pick("Entrar com outra conta", "Use another account") : pick("Acesso admin · Entrar com Twitch", "Admin access · Sign in with Twitch")}</button>
            <p className="maintenance-access-note">{user ? pick("Esta conta não tem acesso admin confirmado.", "Admin access has not been confirmed for this account.") : pick("Acesso temporariamente reservado aos administradores.", "Access is temporarily limited to administrators.")}</p>
            {user && <button className="maintenance-retry" type="button" onClick={() => setRetry(value => value + 1)}>{pick("Verificar acesso novamente", "Check access again")}</button>}
          </>
        )}
        {error && <p className="maintenance-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
