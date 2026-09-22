import { useEffect, useMemo, useState } from "react";

const FACEIT_URL = "https://www.faceit.com/pt/players/Chyna/cs2";

type RecentMatch = {
  result: "W" | "L";
  map: string;
  score: string;
  kills: number;
  assists: number;
  deaths: number;
  rating?: number | null;
  elo?: number | null;
  eloChange?: number | null;
  date?: string;
};

type FaceitData = {
  updatedAt?: string | null;
  player?: string;
  level?: number;
  elo?: number;
  rankingPt?: number;
  stats?: {
    matches?: number;
    winRate?: number;
    kd?: number;
    adr?: number;
    headshots?: number;
  };
  recentResults?: ("W" | "L")[];
  recentMatches?: RecentMatch[];
};

function Stat({ label, value, suffix = "" }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="faceit-stat">
      <strong>{value}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

function MatchRow({ match }: { match: RecentMatch }) {
  const kd = match.deaths ? (match.kills / match.deaths).toFixed(2) : match.kills.toFixed(2);
  return (
    <div className="faceit-match-row">
      <span className={`faceit-result ${match.result === "W" ? "win" : "loss"}`}>{match.result}</span>
      <div className="faceit-match-map">
        <strong>{match.map}</strong>
        <small>{match.score}</small>
      </div>
      <div className="faceit-match-kad">
        <strong>{match.kills} / {match.assists} / {match.deaths}</strong>
        <small>K / A / D</small>
      </div>
      <div className="faceit-match-kd">
        <strong>{kd}</strong>
        <small>K/D</small>
      </div>
      <div className={`faceit-elo-change ${(match.eloChange ?? 0) >= 0 ? "positive" : "negative"}`}>
        {typeof match.eloChange === "number" ? `${match.eloChange > 0 ? "+" : ""}${match.eloChange}` : "—"}
        <small>ELO</small>
      </div>
    </div>
  );
}

export default function FaceitPerformance() {
  const [data, setData] = useState<FaceitData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}faceit.json?t=${Date.now()}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`FACEIT data request failed: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((error) => console.warn("Unable to load FACEIT performance", error));
    return () => { cancelled = true; };
  }, []);

  const matches = useMemo(() => (data?.recentMatches ?? []).slice(0, 5), [data]);
  const form = useMemo(
    () => matches.length ? matches.map((match) => match.result) : (data?.recentResults ?? []).slice(0, 5),
    [data, matches],
  );
  const avgKills = matches.length
    ? (matches.reduce((sum, match) => sum + match.kills, 0) / matches.length).toFixed(1)
    : "—";
  const updatedLabel = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "sincronização automática";

  return (
    <section className="faceit-performance" aria-label="Estatísticas FACEIT de Chyna">
      <div className="faceit-performance-head">
        <div className="faceit-brand-row">
          <img src="https://cdn.simpleicons.org/faceit/FF5500" alt="" aria-hidden="true" />
          <div>
            <span className="about-kicker">PERFORMANCE</span>
            <h2>FACEIT</h2>
          </div>
        </div>
        <a href={FACEIT_URL} target="_blank" rel="noopener noreferrer">VER PERFIL</a>
      </div>

      <div className="faceit-overview">
        <div className="faceit-rank-card">
          <div className="faceit-level-orb">
            <span>LVL</span>
            <strong>{data?.level ?? 10}</strong>
          </div>
          <div className="faceit-elo-main">
            <span>ELO ATUAL</span>
            <strong>{data?.elo ?? "—"}</strong>
            {data?.rankingPt ? <small>TOP #{data.rankingPt} · PORTUGAL</small> : <small>PORTUGAL</small>}
          </div>
        </div>

        <div className="faceit-form-card">
          <span>FORMA RECENTE</span>
          <div className="faceit-form">
            {form.length ? form.map((result, index) => (
              <b key={`${result}-${index}`} className={result === "W" ? "win" : "loss"}>{result}</b>
            )) : <em>A carregar</em>}
          </div>
          <small>Últimos 5 jogos</small>
        </div>
      </div>

      <div className="faceit-stats-grid">
        <Stat label="WIN RATE" value={data?.stats?.winRate ?? "—"} suffix={data?.stats?.winRate != null ? "%" : ""} />
        <Stat label="K/D" value={data?.stats?.kd ?? "—"} />
        <Stat label="ADR" value={data?.stats?.adr ?? "—"} />
        <Stat label="HEADSHOTS" value={data?.stats?.headshots ?? "—"} suffix={data?.stats?.headshots != null ? "%" : ""} />
        <Stat label="AVG KILLS · 5" value={avgKills} />
        <Stat label="MATCHES" value={data?.stats?.matches?.toLocaleString("pt-PT") ?? "—"} />
      </div>

      <div className="faceit-recent">
        <div className="faceit-recent-title">
          <strong>ÚLTIMAS PARTIDAS</strong>
          <span>Atualizado: {updatedLabel}</span>
        </div>
        <div className="faceit-match-list">
          {matches.length ? matches.map((match, index) => <MatchRow key={`${match.map}-${index}`} match={match} />) : (
            <div className="faceit-match-empty">A carregar partidas recentes…</div>
          )}
        </div>
      </div>
    </section>
  );
}
