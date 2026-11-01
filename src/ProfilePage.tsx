import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  Gamepad2,
  Link2,
  LogOut,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "./i18n";
import {
  getTwitchLogin,
  getUserAvatar,
  getUserDisplayName,
  signInWithTwitch,
  signOut,
  useAuthSession,
} from "./auth";
import { supabase } from "./supabase";
import "./profile.css";

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  twitch_user_id: string | null;
  twitch_login: string | null;
  steam_id: string | null;
  steam_display_name: string | null;
  steam_avatar_url: string | null;
  trade_url: string | null;
};

type RewardsRow = {
  watch_points: number;
  chy_balance: number | string;
  watch_minutes: number;
  current_streak: number;
  longest_streak: number;
  streams_watched: number;
};

function TwitchMark() {
  return <img src="https://cdn.simpleicons.org/twitch/FFFFFF" alt="" aria-hidden="true" />;
}

function fallbackProfile(user: User): ProfileRow {
  return {
    id: user.id,
    display_name: getUserDisplayName(user),
    avatar_url: getUserAvatar(user),
    twitch_user_id: null,
    twitch_login: getTwitchLogin(user),
    steam_id: null,
    steam_display_name: null,
    steam_avatar_url: null,
    trade_url: null,
  };
}

const emptyRewards: RewardsRow = {
  watch_points: 0,
  chy_balance: 0,
  watch_minutes: 0,
  current_streak: 0,
  longest_streak: 0,
  streams_watched: 0,
};

export default function ProfilePage({
  Header,
  Footer,
}: {
  Header: React.ComponentType;
  Footer: React.ComponentType;
}) {
  const { pick } = useLanguage();
  const { user, loading } = useAuthSession();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [rewards, setRewards] = useState<RewardsRow>(emptyRewards);
  const [pageLoading, setPageLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [steamLinking, setSteamLinking] = useState(false);
  const [steamError, setSteamError] = useState("");
  const [tradeUrl, setTradeUrl] = useState("");
  const [tradeSaving, setTradeSaving] = useState(false);
  const [tradeMessage, setTradeMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRewards(emptyRewards);
      return;
    }

    let cancelled = false;
    setPageLoading(true);

    Promise.all([
      supabase
        .from("profiles")
        .select("id,display_name,avatar_url,twitch_user_id,twitch_login,steam_id,steam_display_name,steam_avatar_url,trade_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("viewer_rewards")
        .select("watch_points,chy_balance,watch_minutes,current_streak,longest_streak,streams_watched")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]).then(([profileResult, rewardsResult]) => {
      if (cancelled) return;

      if (profileResult.error) console.warn("Unable to load profile", profileResult.error);
      if (rewardsResult.error) console.warn("Unable to load rewards", rewardsResult.error);

      const loadedProfile=(profileResult.data as ProfileRow | null) ?? fallbackProfile(user);
      setProfile(loadedProfile);
      setTradeUrl(loadedProfile.trade_url ?? "");
      setRewards((rewardsResult.data as RewardsRow | null) ?? emptyRewards);
      setPageLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const avatar = profile?.avatar_url || getUserAvatar(user);
  const displayName = profile?.display_name || getUserDisplayName(user);
  const twitchLogin = profile?.twitch_login || getTwitchLogin(user);
  const watchHours = useMemo(() => Math.floor((rewards.watch_minutes ?? 0) / 60), [rewards.watch_minutes]);
  const watchMinutes = (rewards.watch_minutes ?? 0) % 60;
  const chy = Number(rewards.chy_balance ?? 0);

  async function handleLogin() {
    setAuthError("");
    const { error } = await signInWithTwitch();
    if (error) setAuthError(error.message);
  }

  async function handleLogout() {
    await signOut();
    window.location.href = new URL(import.meta.env.BASE_URL || "/", window.location.origin).toString();
  }

  async function handleSteamLink() {
    if (!user || steamLinking) return;
    setSteamError("");
    setSteamLinking(true);

    const { data, error } = await supabase.functions.invoke("steam-link", {
      method: "POST",
      body: {},
    });

    if (error || !data?.url) {
      console.warn("Unable to start Steam linking", error);
      setSteamError(
        pick(
          "Não foi possível iniciar a ligação à Steam. Tenta novamente.",
          "Unable to start Steam linking. Please try again."
        )
      );
      setSteamLinking(false);
      return;
    }

    window.location.assign(data.url);
  }

  async function saveTradeUrl() {
    if (!user || !profile?.steam_id || tradeSaving) return;
    const value=tradeUrl.trim();
    setTradeMessage("");

    if (
      value &&
      !/^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?/.test(value)
    ) {
      setTradeMessage(
        pick(
          "Usa um Trade URL oficial da Steam.",
          "Use an official Steam Trade URL."
        )
      );
      return;
    }

    setTradeSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ trade_url: value || null })
      .eq("id", user.id);

    setTradeSaving(false);

    if (error) {
      console.warn("Unable to save Trade URL", error);
      setTradeMessage(pick("Não foi possível guardar.", "Unable to save."));
      return;
    }

    setProfile(current => current ? { ...current, trade_url: value || null } : current);
    setTradeMessage(pick("Trade URL guardado.", "Trade URL saved."));
  }

  const steamStatus =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("steam")
      : null;

  return (
    <>
      <Header />
      <main className="profile-page">
        {loading ? (
          <section className="profile-auth-card profile-loading-card">
            <span className="profile-loading-dot" />
            <p>{pick("A carregar conta…", "Loading account…")}</p>
          </section>
        ) : !user ? (
          <section className="profile-auth-card">
            <span className="profile-eyebrow">GODCHYNA ACCOUNT</span>
            <h1>{pick("ENTRA COM A TUA TWITCH", "SIGN IN WITH TWITCH")}</h1>
            <p>
              {pick(
                "A tua conta Twitch será o teu perfil GODCHYNA. Aqui vais acompanhar Watch Points, CHY, horas assistidas, streaks e ligar a tua Steam.",
                "Your Twitch account becomes your GODCHYNA profile. Track Watch Points, CHY, watch time, streaks and connect your Steam account here."
              )}
            </p>
            <button className="profile-twitch-login" type="button" onClick={handleLogin}>
              <TwitchMark />
              <span>{pick("ENTRAR COM TWITCH", "SIGN IN WITH TWITCH")}</span>
            </button>
            {authError && <p className="profile-auth-error">{authError}</p>}
            <small>
              <ShieldCheck />
              {pick(
                "O login é feito através da Twitch. O GODCHYNA não recebe a tua palavra-passe.",
                "Authentication happens through Twitch. GODCHYNA never receives your password."
              )}
            </small>
          </section>
        ) : (
          <div className="profile-shell">
            {steamStatus && (
              <div className={`profile-steam-status ${steamStatus==="connected"?"success":"error"}`}>
                {steamStatus==="connected" ? <CheckCircle2 /> : <ShieldCheck />}
                <span>
                  {steamStatus==="connected"
                    ? pick("Conta Steam ligada com sucesso.", "Steam account connected successfully.")
                    : steamStatus==="already-linked"
                      ? pick("Esta conta Steam já está ligada a outro perfil GODCHYNA.", "This Steam account is already linked to another GODCHYNA profile.")
                      : steamStatus==="cancelled"
                        ? pick("Ligação à Steam cancelada.", "Steam linking cancelled.")
                        : pick("Não foi possível ligar a Steam. Tenta novamente.", "Unable to link Steam. Please try again.")}
                </span>
              </div>
            )}
            <section className="profile-hero-card">
              <div className="profile-identity">
                <div className="profile-avatar-wrap">
                  {avatar ? <img src={avatar} alt={displayName} /> : <span>{displayName.slice(0, 1).toUpperCase()}</span>}
                  <i className="profile-online-dot" />
                </div>
                <div>
                  <span className="profile-eyebrow">{pick("A MINHA CONTA", "MY ACCOUNT")}</span>
                  <h1>{displayName}</h1>
                  <div className="profile-twitch-name">
                    <TwitchMark />
                    <span>{twitchLogin ? `@${twitchLogin}` : pick("Twitch ligada", "Twitch connected")}</span>
                  </div>
                </div>
              </div>
              <button className="profile-logout" type="button" onClick={handleLogout}>
                <LogOut />
                {pick("SAIR", "LOG OUT")}
              </button>
            </section>

            <section className="profile-stat-grid" aria-busy={pageLoading}>
              <article className="profile-stat-card gold">
                <span>CHY</span>
                <strong>{chy.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                <small><WalletCards /> {pick("Saldo disponível", "Available balance")}</small>
              </article>
              <article className="profile-stat-card green">
                <span>WATCH POINTS</span>
                <strong>{Number(rewards.watch_points ?? 0).toLocaleString()}</strong>
                <small><Gamepad2 /> {pick("Pontos de fidelidade", "Loyalty points")}</small>
              </article>
              <article className="profile-stat-card">
                <span>{pick("TEMPO ASSISTIDO", "WATCH TIME")}</span>
                <strong>{watchHours}h <b>{watchMinutes}m</b></strong>
                <small><Clock3 /> {rewards.streams_watched ?? 0} {pick("streams vistas", "streams watched")}</small>
              </article>
              <article className="profile-stat-card">
                <span>STREAK</span>
                <strong>{rewards.current_streak ?? 0}</strong>
                <small><Flame /> {pick("streams consecutivas", "consecutive streams")}</small>
              </article>
            </section>

            <section className="profile-grid">
              <article className="profile-panel">
                <header>
                  <div>
                    <span className="profile-eyebrow">{pick("CONTAS LIGADAS", "CONNECTED ACCOUNTS")}</span>
                    <h2>{pick("CONEXÕES", "CONNECTIONS")}</h2>
                  </div>
                  <Link2 />
                </header>

                <div className="profile-connection connected">
                  <div className="profile-connection-logo twitch"><TwitchMark /></div>
                  <div className="profile-connection-copy">
                    <strong>Twitch</strong>
                    <span>{twitchLogin ? `@${twitchLogin}` : displayName}</span>
                  </div>
                  <b>{pick("LIGADA", "CONNECTED")}</b>
                </div>

                <div className={`profile-connection${profile?.steam_id?" connected":""}`}>
                  <div className="profile-connection-logo steam">
                    <img src="https://cdn.simpleicons.org/steam/FFFFFF" alt="" aria-hidden="true" />
                  </div>
                  <div className="profile-connection-copy">
                    <strong>Steam</strong>
                    <span>
                      {profile?.steam_display_name
                        || (profile?.steam_id ? `SteamID ${profile.steam_id}` : pick("Ainda não ligada", "Not connected yet"))}
                    </span>
                  </div>
                  {profile?.steam_id ? (
                    <a
                      className="profile-steam-open"
                      href={`https://steamcommunity.com/profiles/${profile.steam_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink />
                      {pick("VER STEAM", "VIEW STEAM")}
                    </a>
                  ) : (
                    <button
                      className="profile-steam-connect"
                      type="button"
                      onClick={handleSteamLink}
                      disabled={steamLinking}
                    >
                      {steamLinking ? pick("A LIGAR…", "CONNECTING…") : pick("LIGAR STEAM", "CONNECT STEAM")}
                    </button>
                  )}
                </div>

                {steamError && <p className="profile-connection-error">{steamError}</p>}

                {profile?.steam_id && (
                  <div className="profile-trade-box">
                    <div className="profile-trade-heading">
                      <div>
                        <strong>STEAM TRADE URL</strong>
                        <span>{pick("Usado para receber as skins resgatadas.", "Used to receive redeemed skins.")}</span>
                      </div>
                      {profile.trade_url && <CheckCircle2 />}
                    </div>
                    <div className="profile-trade-row">
                      <input
                        type="url"
                        value={tradeUrl}
                        onChange={event=>setTradeUrl(event.target.value)}
                        placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                        spellCheck={false}
                      />
                      <button type="button" onClick={saveTradeUrl} disabled={tradeSaving}>
                        {tradeSaving ? pick("A GUARDAR…", "SAVING…") : pick("GUARDAR", "SAVE")}
                      </button>
                    </div>
                    {tradeMessage && <p>{tradeMessage}</p>}
                  </div>
                )}
              </article>

              <article className="profile-panel profile-progress-panel">
                <header>
                  <div>
                    <span className="profile-eyebrow">{pick("FIDELIDADE", "LOYALTY")}</span>
                    <h2>{pick("PROGRESSO", "PROGRESS")}</h2>
                  </div>
                  <Flame />
                </header>
                <div className="profile-progress-row">
                  <span>{pick("Streak atual", "Current streak")}</span>
                  <strong>{rewards.current_streak ?? 0}</strong>
                </div>
                <div className="profile-progress-row">
                  <span>{pick("Melhor streak", "Best streak")}</span>
                  <strong>{rewards.longest_streak ?? 0}</strong>
                </div>
                <div className="profile-progress-row">
                  <span>{pick("Streams vistas", "Streams watched")}</span>
                  <strong>{rewards.streams_watched ?? 0}</strong>
                </div>
                <p>
                  {pick(
                    "As recompensas por horas, subs, gifts, raids, donations e streaks serão creditadas aqui quando ativarmos a integração da stream.",
                    "Rewards from watch time, subs, gifts, raids, donations and streaks will be credited here once the stream integration is enabled."
                  )}
                </p>
              </article>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
