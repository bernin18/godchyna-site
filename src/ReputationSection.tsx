import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import "./reputation.css";

const PROFILE_URL = "https://csgo-rep.com/profile/76561198018758818";

type ReputationReview = {
  rate?: number;
  trade_position?: number;
  body?: string;
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

function rateLabel(rate?: number) {
  if (rate === 1) return "+REP";
  if (rate === 0) return "NEUTRO";
  return "-REP";
}

function positionLabel(position?: number) {
  if (position === 1) return "1.º";
  if (position === 2) return "2.º";
  return null;
}

function ReviewCard({ review, duplicate = false }: { review: ReputationReview; duplicate?: boolean }) {
  const label = rateLabel(review.rate);
  const position = positionLabel(review.trade_position);
  const tone = review.rate === 1 ? "positive" : review.rate === 0 ? "neutral" : "negative";

  return (
    <article className={`rep-review-card ${tone}`} aria-hidden={duplicate || undefined}>
      <div className="rep-review-head">
        <span className={`rep-rate ${tone}`}>{label}</span>
        <span className="rep-review-source">CSGOREP</span>
        {position && <span className="rep-position">{position}</span>}
      </div>
      <p>“{review.body}”</p>
    </article>
  );
}

export default function ReputationSection() {
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
          <p>Feedback público da comunidade sobre compras, vendas e trocas.</p>
        </div>
        <a className="rep-profile-link" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          VER PERFIL NO CSGOREP
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
            <small>PERFIL PÚBLICO</small>
          </div>
        </div>

        <div className="rep-stats" aria-label="Resumo da reputação">
          <div>
            <strong className="rep-positive-number">+{positive}</strong>
            <span>POSITIVAS</span>
          </div>
          <div>
            <strong>{total}</strong>
            <span>REVIEWS</span>
          </div>
        </div>

        <div className="rep-sync-state">
          <span className="rep-sync-dot" />
          <div>
            <strong>DADOS CSGOREP</strong>
            <small>{loading ? "A sincronizar..." : data?.updatedAt ? "Sincronização automática" : "Perfil ligado"}</small>
          </div>
        </div>
      </div>

      <div className="rep-comments-label">
        <span>COMENTÁRIOS RECENTES</span>
      </div>

      {repeatedReviews.length > 0 ? (
        <div className="rep-marquee" aria-label="Comentários recentes no CSGORep">
          <div className="rep-track">
            {repeatedReviews.map((review, index) => (
              <ReviewCard
                key={`${index}-${review.body}`}
                review={review}
                duplicate={index >= reviews.length}
              />
            ))}
          </div>
        </div>
      ) : (
        <a className="rep-empty" href={PROFILE_URL} target="_blank" rel="noopener noreferrer">
          {loading ? "A carregar os comentários mais recentes do CSGORep..." : "Ver os comentários no perfil CSGORep"}
        </a>
      )}
    </section>
  );
}