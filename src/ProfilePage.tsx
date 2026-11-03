import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flame,
  Gamepad2,
  Link2,
  LogOut,
  PackageCheck,
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
  role: "user" | "admin";
};

type RewardsRow = {
  watch_points: number;
  chy_balance: number | string;
  watch_minutes: number;
  current_streak: number;
  longest_streak: number;
  streams_watched: number;
};

type RedemptionRow = {
  id: number;
  item_name: string;
  item_type: "skin" | "service" | "promo_code";
  item_image_path: string | null;
  chy_used: number | string;
  wp_used: number;
  status: "pending" | "delivered" | "cancelled";
  created_at: string;
  delivered_at: string | null;
};

const profileAsset = (name: string) => `${import.meta.env.BASE_URL}${name.replace(/^\/+/, "")}`;

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
    role: "user",
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
  const [pendingRedemptions, setPendingRedemptions] = useState(0);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);



  useEffect(() => {
    if (!user) {
      setRedemptions([]);
      return;
    }

    let cancelled = false;

    async function loadRedemptions() {
      const { data, error } = await supabase
        .from("store_redemptions")
        .select("id,item_name,item_type,item_image_path,chy_used,wp_used,status,created_at,delivered_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.warn("Unable to load profile redemptions", error);
        return;
      }

      setRedemptions((data ?? []) as RedemptionRow[]);
    }

    void loadRedemptions();

    const channel = supabase
      .channel(`profile-redemptions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_redemptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void loadRedemptions();
        }
      )
      .subscribe();

    const timer = window.setInterval(() => void loadRedemptions(), 15000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`viewer-rewards-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "viewer_rewards",
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          const next = payload.new as RewardsRow | undefined;
          if (next && typeof next === "object") {
            setRewards(current => ({ ...current, ...next }));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

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
        .select("id,display_name,avatar_url,twitch_user_id,twitch_login,steam_id,steam_display_name,steam_avatar_url,trade_url,role")
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

  useEffect(() => {
    if (!user || profile?.role !== "admin") {
      setPendingRedemptions(0);
      return;
    }

    let cancelled = false;

    async function refreshPendingRedemptions() {
      const { count, error } = await supabase
        .from("store_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (cancelled) return;

      if (error) {
        console.warn("Unable to load pending redemptions", error);
        return;
      }

      setPendingRedemptions(count ?? 0);
    }

    void refreshPendingRedemptions();
    const timer = window.setInterval(() => void refreshPendingRedemptions(), 15000);
    const onRedemptionsChanged = () => void refreshPendingRedemptions();
    window.addEventListener("godchyna:redemptions-changed", onRedemptionsChanged);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("godchyna:redemptions-changed", onRedemptionsChanged);
    };
  }, [profile?.role, user]);

  const avatar = profile?.avatar_url || getUserAvatar(user);
  const displayName = profile?.display_name || getUserDisplayName(user);
  const twitchLogin = profile?.twitch_login || getTwitchLogin(user);
  const watchHours = useMemo(() => Math.floor((rewards.watch_minutes ?? 0) / 60), [rewards.watch_minutes]);
  const watchMinutes = (rewards.watch_minutes ?? 0) % 60;
  const chy = Number(rewards.chy_balance ?? 0);

  function formatRedemptionDate(value: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

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
                  <h1>{displayName}</h1>
                  <div className="profile-twitch-name">
                    <TwitchMark />
                    <span>{twitchLogin ? `@${twitchLogin}` : pick("Twitch ligada", "Twitch connected")}</span>
                  </div>
                </div>
              </div>
              <div className="profile-hero-actions">
                {profile?.role === "admin" && (
                  <a className="profile-admin-link" href={`${import.meta.env.BASE_URL}resgates`}>
                    <PackageCheck />
                    {pick("RESGATES", "REDEMPTIONS")}
                    {pendingRedemptions > 0 && (
                      <b className="profile-admin-badge">
                        {pendingRedemptions > 99 ? "99+" : pendingRedemptions}
                      </b>
                    )}
                  </a>
                )}
                <button className="profile-logout" type="button" onClick={handleLogout}>
                  <LogOut />
                  {pick("SAIR", "LOG OUT")}
                </button>
              </div>
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

            <section className="profile-redemptions-section">
                <header className="profile-redemptions-heading">
                  <div>
                    <h2>{pick("OS MEUS RESGATES", "MY REDEMPTIONS")}</h2>
                  </div>
                  <div className="profile-redemptions-help">
                    <p>
                      {pick(
                        "Em caso de problemas ou dúvidas, entra em contacto comigo pelo Discord ou Instagram.",
                        "If you have any problems or questions, contact me through Discord or Instagram."
                      )}
                    </p>
                    <PackageCheck />
                  </div>
                </header>

                {redemptions.length === 0 ? (
                  <div className="profile-redemptions-empty">
                    <PackageCheck />
                    <h3>{pick("AINDA NÃO TENS RESGATES", "NO REDEMPTIONS YET")}</h3>
                    <p>
                      {pick(
                        "Quando resgatares uma skin, serviço ou código, o estado da entrega aparece aqui.",
                        "When you redeem a skin, service or code, its delivery status will appear here."
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="profile-redemptions-list">
                    {redemptions.map(redemption => {
                    const delivered = redemption.status === "delivered";

                    return (
                      <article
                        key={redemption.id}
                        className={`profile-redemption-card ${delivered ? "delivered" : "pending"}`}
                      >
                        <div className="profile-redemption-product">
                          <div className="profile-redemption-image">
                            {redemption.item_image_path ? (
                              <img src={profileAsset(redemption.item_image_path)} alt={redemption.item_name} />
                            ) : (
                              <PackageCheck />
                            )}
                          </div>
                          <div>
                            <span>{redemption.item_type.replace("_", " ").toUpperCase()}</span>
                            <h3>{redemption.item_name}</h3>
                            <small>#{redemption.id}</small>
                          </div>
                        </div>

                        <div className="profile-redemption-date">
                          <span>{pick("DATA DE RESGATE", "REDEMPTION DATE")}</span>
                          <strong>{formatRedemptionDate(redemption.created_at)}</strong>
                        </div>

                        <div className="profile-redemption-date">
                          <span>{pick("DATA DE ENTREGA", "DELIVERY DATE")}</span>
                          <strong className={delivered ? "delivered-date" : ""}>
                            {delivered ? formatRedemptionDate(redemption.delivered_at) : "—"}
                          </strong>
                        </div>

                        <div className="profile-redemption-value">
                          <span>{pick("VALOR", "VALUE")}</span>
                          <strong>{Number(redemption.chy_used).toLocaleString("pt-PT", { maximumFractionDigits: 2 })} CHY</strong>
                          {redemption.wp_used > 0 && (
                            <small>+ {Number(redemption.wp_used).toLocaleString("pt-PT")} WP</small>
                          )}
                        </div>

                        <div className="profile-redemption-state">
                          <span className={`profile-redemption-status ${redemption.status}`}>
                            {delivered ? <CheckCircle2 /> : <Clock3 />}
                            {delivered ? pick("ENTREGUE", "DELIVERED") : pick("PENDENTE", "PENDING")}
                          </span>
                        </div>
                      </article>
                    );
                    })}
                  </div>
                )}
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

              </article>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
