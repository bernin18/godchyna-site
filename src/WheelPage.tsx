import { FormEvent, useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogIn, LogOut, Ticket, UserRound } from "lucide-react";
import { supabase } from "./supabase";
import { useLanguage } from "./i18n";
import "./wheel.css";

type WheelPageProps = {
  Header: ComponentType;
  Footer: ComponentType;
};

type AccountData = {
  displayName: string;
  role: "user" | "admin";
  dayPasses: number;
  activeUntil: string | null;
};

export default function WheelPage({ Header, Footer }: WheelPageProps) {
  const { pick } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) setAccount(null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user.id) return;
    let cancelled = false;

    async function loadAccount() {
      setLoadingAccount(true);
      const [{ data: profile, error: profileError }, { data: wallet, error: walletError }] = await Promise.all([
        supabase.from("profiles").select("display_name, role").eq("id", session!.user.id).single(),
        supabase.from("access_wallets").select("day_passes, active_until").eq("user_id", session!.user.id).single(),
      ]);

      if (!cancelled) {
        if (profileError || walletError) {
          setMessage(pick("Não foi possível carregar a conta.", "Unable to load your account."));
        } else {
          setAccount({
            displayName: profile?.display_name || session!.user.email?.split("@")[0] || "User",
            role: profile?.role === "admin" ? "admin" : "user",
            dayPasses: wallet?.day_passes ?? 0,
            activeUntil: wallet?.active_until ?? null,
          });
        }
        setLoadingAccount(false);
      }
    }

    loadAccount();
    return () => {
      cancelled = true;
    };
  }, [session?.user.id, pick]);

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() || email.split("@")[0] },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(pick(
          "Conta criada. Confirma o email e depois inicia sessão.",
          "Account created. Confirm your email, then sign in.",
        ));
        setMode("login");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(pick("Email ou password incorretos.", "Incorrect email or password."));
    }

    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const activeUntil = account?.activeUntil ? new Date(account.activeUntil) : null;
  const hasActivePass = account?.role === "admin" || Boolean(activeUntil && activeUntil.getTime() > Date.now());

  return (
    <>
      <Header />
      <main className="wheel-page">
        <section className="wheel-hero">
          <span className="wheel-kicker">GIVEAWAY TOOL</span>
          <h1>{pick("RODA DO", "CHYNA'S")} <strong>{pick("CHYNAO", "WHEEL")}</strong></h1>
          <p>{pick(
            "Wheel Survivor → TOP 5 → Plinko. Primeiro tratamos das contas; a roda vem já a seguir.",
            "Wheel Survivor → TOP 5 → Plinko. Accounts first; the wheel comes next.",
          )}</p>
        </section>

        {loadingSession ? (
          <section className="wheel-account-card wheel-loading">{pick("A carregar...", "Loading...")}</section>
        ) : !session ? (
          <section className="wheel-account-card">
            <div className="wheel-auth-head">
              <UserRound />
              <div>
                <span>{pick("CONTA CHYNA", "CHYNA ACCOUNT")}</span>
                <h2>{mode === "login" ? pick("INICIAR SESSÃO", "SIGN IN") : pick("CRIAR CONTA", "CREATE ACCOUNT")}</h2>
              </div>
            </div>

            <div className="wheel-auth-tabs">
              <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>
                {pick("ENTRAR", "SIGN IN")}
              </button>
              <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>
                {pick("CRIAR CONTA", "SIGN UP")}
              </button>
            </div>

            <form className="wheel-auth-form" onSubmit={submitAuth}>
              {mode === "signup" && (
                <label>
                  <span>{pick("NOME", "NAME")}</span>
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Chyna" autoComplete="name" />
                </label>
              )}
              <label>
                <span>EMAIL</span>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" autoComplete="email" />
              </label>
              <label>
                <span>PASSWORD</span>
                <input type="password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </label>
              <button className="wheel-primary-btn" type="submit" disabled={busy}>
                <LogIn />
                {busy ? pick("A PROCESSAR...", "PROCESSING...") : mode === "login" ? pick("ENTRAR", "SIGN IN") : pick("CRIAR CONTA", "CREATE ACCOUNT")}
              </button>
            </form>

            {message && <p className="wheel-auth-message">{message}</p>}
          </section>
        ) : (
          <section className="wheel-account-card">
            <div className="wheel-account-top">
              <div className="wheel-auth-head">
                <UserRound />
                <div>
                  <span>{account?.role === "admin" ? "ADMIN" : pick("UTILIZADOR", "USER")}</span>
                  <h2>{loadingAccount ? "..." : account?.displayName || session.user.email}</h2>
                </div>
              </div>
              <button className="wheel-signout" onClick={signOut}><LogOut /> {pick("SAIR", "SIGN OUT")}</button>
            </div>

            <div className="wheel-account-grid">
              <div>
                <Ticket />
                <span>{pick("DAY PASSES", "DAY PASSES")}</span>
                <strong>{account?.role === "admin" ? "∞" : account?.dayPasses ?? 0}</strong>
              </div>
              <div>
                <span>{pick("ACESSO", "ACCESS")}</span>
                <strong className={hasActivePass ? "active" : ""}>
                  {account?.role === "admin"
                    ? "UNLIMITED"
                    : hasActivePass
                      ? pick("ATIVO", "ACTIVE")
                      : pick("SEM PASSE ATIVO", "NO ACTIVE PASS")}
                </strong>
                {activeUntil && hasActivePass && account?.role !== "admin" && (
                  <small>{pick("Até", "Until")} {activeUntil.toLocaleString()}</small>
                )}
              </div>
            </div>

            <div className="wheel-coming">
              <span>{pick("PRÓXIMA ETAPA", "NEXT STEP")}</span>
              <h3>WHEEL → TOP 5 → PLINKO</h3>
              <p>{pick(
                "A conta já está ligada ao sistema de passes. A seguir construímos a roda sem mexer novamente na autenticação.",
                "Your account is now connected to the pass system. Next we build the wheel without having to redo authentication.",
              )}</p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
