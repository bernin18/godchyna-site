import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Steam,
  UserRound,
} from "lucide-react";
import { useAuthSession } from "./auth";
import { useLanguage } from "./i18n";
import { supabase } from "./supabase";
import "./admin-user-profile.css";

type AdminProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  twitch_login: string | null;
  steam_id: string | null;
  steam_display_name: string | null;
  steam_avatar_url: string | null;
  trade_url: string | null;
};

export default function AdminUserProfilePage({
  Header,
  Footer,
}: {
  Header: React.ComponentType;
  Footer: React.ComponentType;
}) {
  const { pick } = useLanguage();
  const { user, loading: authLoading } = useAuthSession();
  const [profile, setProfile] = useState<AdminProfileRow | null>(null);
  const [access, setAccess] = useState<"loading" | "admin" | "denied">("loading");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const targetUserId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("user")
      : null;

  useEffect(() => {
    if (authLoading) return;

    if (!user || !targetUserId) {
      setAccess("denied");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const roleResult = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .maybeSingle();

      if (cancelled) return;

      if (roleResult.error || roleResult.data?.role !== "admin") {
        setAccess("denied");
        setLoading(false);
        return;
      }

      setAccess("admin");

      const profileResult = await supabase
        .from("profiles")
        .select("id,display_name,avatar_url,twitch_login,steam_id,steam_display_name,steam_avatar_url,trade_url")
        .eq("id", targetUserId)
        .maybeSingle();

      if (cancelled) return;

      if (profileResult.error || !profileResult.data) {
        console.warn("Unable to load admin customer profile", profileResult.error);
        setError(pick("Não foi possível carregar este utilizador.", "Unable to load this user."));
        setProfile(null);
      } else {
        setProfile(profileResult.data as AdminProfileRow);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, targetUserId, pick]);

  async function copyTradeUrl() {
    if (!profile?.trade_url) return;

    try {
      await navigator.clipboard.writeText(profile.trade_url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const displayName = profile?.display_name || profile?.twitch_login || pick("Utilizador", "User");

  return (
    <>
      <Header />
      <main className="admin-user-page">
        {access === "loading" || authLoading ? (
          <section className="admin-user-state">
            <span className="admin-user-loader" />
            <p>{pick("A verificar acesso…", "Checking access…")}</p>
          </section>
        ) : access === "denied" ? (
          <section className="admin-user-state">
            <ShieldCheck />
            <h1>{pick("ACESSO RESTRITO", "RESTRICTED ACCESS")}</h1>
            <p>{pick("Este perfil está disponível apenas para administradores.", "This profile is available to administrators only.")}</p>
            <a href={`${import.meta.env.BASE_URL}resgates`}>{pick("VOLTAR AOS RESGATES", "BACK TO REDEMPTIONS")}</a>
          </section>
        ) : loading ? (
          <section className="admin-user-state">
            <span className="admin-user-loader" />
            <p>{pick("A carregar utilizador…", "Loading user…")}</p>
          </section>
        ) : error || !profile ? (
          <section className="admin-user-state">
            <UserRound />
            <h1>{pick("UTILIZADOR NÃO ENCONTRADO", "USER NOT FOUND")}</h1>
            <p>{error || pick("Não foi possível encontrar este perfil.", "Unable to find this profile.")}</p>
            <a href={`${import.meta.env.BASE_URL}resgates`}>{pick("VOLTAR AOS RESGATES", "BACK TO REDEMPTIONS")}</a>
          </section>
        ) : (
          <section className="admin-user-shell">
            <a className="admin-user-back" href={`${import.meta.env.BASE_URL}resgates`}>
              <ArrowLeft />
              {pick("VOLTAR AOS RESGATES", "BACK TO REDEMPTIONS")}
            </a>

            <header className="admin-user-hero">
              <div className="admin-user-avatar">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} />
                ) : (
                  <span>{displayName.slice(0, 1).toUpperCase()}</span>
                )}
              </div>

              <div className="admin-user-identity">
                <span>{pick("PERFIL DO CLIENTE", "CUSTOMER PROFILE")}</span>
                <h1>{displayName}</h1>
                {profile.twitch_login && <p>@{profile.twitch_login}</p>}
              </div>
            </header>

            <div className="admin-user-grid">
              <article className="admin-user-panel">
                <header>
                  <div>
                    <span>{pick("CONTA", "ACCOUNT")}</span>
                    <h2>Twitch</h2>
                  </div>
                  <UserRound />
                </header>

                <div className="admin-user-detail">
                  <span>{pick("UTILIZADOR", "USER")}</span>
                  <strong>{profile.twitch_login ? `@${profile.twitch_login}` : displayName}</strong>
                </div>
              </article>

              <article className="admin-user-panel">
                <header>
                  <div>
                    <span>{pick("CONTA LIGADA", "CONNECTED ACCOUNT")}</span>
                    <h2>Steam</h2>
                  </div>
                  <Steam />
                </header>

                {profile.steam_id ? (
                  <>
                    <div className="admin-user-detail">
                      <span>{pick("NOME STEAM", "STEAM NAME")}</span>
                      <strong>{profile.steam_display_name || profile.steam_id}</strong>
                    </div>
                    <a
                      className="admin-user-steam-link"
                      href={`https://steamcommunity.com/profiles/${profile.steam_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink />
                      {pick("ABRIR PERFIL STEAM", "OPEN STEAM PROFILE")}
                    </a>
                  </>
                ) : (
                  <p className="admin-user-muted">{pick("Steam ainda não ligada.", "Steam is not connected yet.")}</p>
                )}
              </article>
            </div>

            <article className={`admin-user-trade ${profile.trade_url ? "ready" : "missing"}`}>
              <div className="admin-user-trade-heading">
                <div>
                  <span>STEAM TRADE URL</span>
                  <h2>
                    {profile.trade_url
                      ? pick("PRONTO PARA ENTREGA", "READY FOR DELIVERY")
                      : pick("TRADE URL NÃO CONFIGURADO", "TRADE URL NOT SET")}
                  </h2>
                </div>
                {profile.trade_url ? <Check /> : <ShieldCheck />}
              </div>

              {profile.trade_url ? (
                <>
                  <div className="admin-user-trade-url">{profile.trade_url}</div>
                  <div className="admin-user-trade-actions">
                    <button type="button" onClick={copyTradeUrl}>
                      {copied ? <Check /> : <Copy />}
                      {copied ? pick("COPIADO", "COPIED") : pick("COPIAR TRADE URL", "COPY TRADE URL")}
                    </button>
                    <a href={profile.trade_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink />
                      {pick("ABRIR TRADE", "OPEN TRADE")}
                    </a>
                  </div>
                </>
              ) : (
                <p>
                  {pick(
                    "Este utilizador ainda não guardou um Trade URL no perfil.",
                    "This user has not saved a Trade URL in their profile yet."
                  )}
                </p>
              )}
            </article>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
