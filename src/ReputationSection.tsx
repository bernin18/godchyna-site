import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import "./reputation.css";
import { useLanguage } from "./i18n";

const PROFILE_URL = "https://csgo-rep.com/profile/76561198018758818";

type ReputationReview = {
  rate?: number;
  trade_position?: number;
  body?: string;
  from_steam_id?: string;
  username?: string;
  avatar?: string;
  created_at?: string;
};

type ReputationData = {
  updatedAt?: string | null;
  stats?: {
    positive?: number;
    neutral?: number;
    negative?: number;
    total?: number;
  };
  profile?: {
    feedback?: {
      positive?: number;
      neutral?: number;
    };
  } | null;
  reps?: {
    total?: number;
    recent?: ReputationReview[];
  };
};

function reviewDateLabel(value: string | undefined, locale: "pt-PT" | "en-GB") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function steamAvatarUrl(avatar?: string) {
  if (!avatar) return null;
  return `https://avatars.cloudflare.steamstatic.com/${avatar}_medium.jpg`;
}

function ReviewCard({ review, duplicate = false }: { review: ReputationReview; duplicate?: boolean }) {
  const { lang, pick } = useLanguage();
  const dateLabel = reviewDateLabel(review.created_at, lang==="pt"?"pt-PT":"en-GB");
  const tone = review.rate === 1 ? "positive" : review.rate === 0 ? "neutral" : "negative";
  const username = review.username?.trim() || pick("Utilizador Steam","Steam user");
  const initial = username.charAt(0).toUpperCase();
  const avatarUrl = steamAvatarUrl(review.avatar);
  const steamUrl = review.from_steam_id
    ? `https://steamcommunity.com/profiles/${review.from_steam_id}`
    : null;

  return (
    <article className={`rep-review-card ${tone}`} aria-hidden={duplicate || undefined}>
      <div className="rep-review-head">
        {steamUrl ? (
          <a
            className="rep-review-author"
            href={steamUrl}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={duplicate ? -1 : 0}
          >
            <span className="rep-avatar" aria-hidden="true">
              <span>{initial}</span>
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </span>
            <span className="rep-review-username">{username}</span>
          </a>
        ) : (
          <div className="rep-review-author">
            <span className="rep-avatar" aria-hidden="true"><span>{initial}</span></span>
            <span className="rep-review-username">{username}</span>
          </div>
        )}

        <div className="rep-review-meta">
          {dateLabel && <time className="rep-review-date" dateTime={review.created_at}>{dateLabel}</time>}
        </div>
      </div>
      <p>“{review.body}”</p>
    </article>
  );
}

export default function ReputationSection() {
  const { pick } = useLanguage();
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${import.meta.env.BASE_URL}csgorep.json?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`CSGORep data request failed: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((error) => {
        console.warn("Unable to load CSGORep reputation", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const reviews = useMemo(
    () =>
      (data?.reps?.recent ?? []).filter(
        (review) => typeof review.body === "string" && review.body.trim().length > 0,
      ),
    [data],
  );

  const positive = data?.stats?.positive ?? data?.profile?.feedback?.positive ?? 0;
  const total = data?.stats?.total ?? data?.reps?.total ?? reviews.length;
  const repeatedReviews = reviews.length ? [...reviews, ...reviews] : [];

  return (
    <section className="section reputation-section" aria-labelledby="reputation-title">
      <div className="rep-heading">
        <div>
          <h2 id="reputation-title">CSGOREP</h2>
          <p>{pick("Feedback público da comunidade sobre compras, vendas e trocas.","Public community feedback about buying, selling and trading.")}</p>
        </div>
        <a className="rep-profile-link" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          {pick("VER PERFIL NO CSGOREP","VIEW CSGOREP PROFILE")}
        </a>
      </div>

      <div className="rep-summary-card">
        <div className="rep-identity">
          <div className="rep-shield" aria-hidden="true">
            <ShieldCheck />
          </div>
          <div>
            <span>CSGOREP</span>
            <strong>GODCHYNA</strong>
            <small>{pick("PERFIL PÚBLICO","PUBLIC PROFILE")}</small>
          </div>
        </div>

        <div className="rep-stats" aria-label={pick("Resumo da reputação","Reputation summary")}>
          <div>
            <strong className="rep-positive-number">+{positive}</strong>
            <span>{pick("POSITIVAS","POSITIVE")}</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>REVIEWS</span>
          </div>
        </div>

        <div className="rep-sync-state">
          <span className="rep-sync-dot" />
          <div>
            <strong>{pick("DADOS CSGOREP","CSGOREP DATA")}</strong>
            <small>{loading ? pick("A sincronizar...","Syncing...") : data?.updatedAt ? pick("Sincronização automática","Automatic sync") : pick("Perfil ligado","Profile connected")}</small>
          </div>
        </div>
      </div>

      <div className="rep-comments-label">
        <span>{pick("COMENTÁRIOS RECENTES","RECENT COMMENTS")}</span>
      </div>

      {repeatedReviews.length > 0 ? (
        <div className="rep-marquee" aria-label={pick("Comentários recentes no CSGORep","Recent comments on CSGORep")}>
          <div className="rep-track">
            {repeatedReviews.map((review, index) => (
              <ReviewCard
                key={`${index}-${review.from_steam_id}-${review.body}`}
                review={review}
                duplicate={index >= reviews.length}
              />
            ))}
          </div>
        </div>
      ) : (
        <a className="rep-empty" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          {loading ? pick("A carregar os comentários mais recentes do CSGORep...","Loading the latest CSGORep comments...") : pick("Ver os comentários no perfil CSGORep","View comments on the CSGORep profile")}
        </a>
      )}
    </section>
  );
}
