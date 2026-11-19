import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLanguage } from "./i18n";
import "./christmas-countdown.css";

// Europe/Lisbon is UTC+0 on this date; all visitors share the same deadline.
export const CHRISTMAS_DEADLINE = Date.parse("2026-12-30T23:59:00+00:00");
export function countdownParts(now: number) {
  const seconds = Math.max(0, Math.ceil((CHRISTMAS_DEADLINE - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
}
const asset = (name: string) => `${import.meta.env.BASE_URL}${encodeURIComponent(name)}`;

export function ChristmasSnow() {
  return <div className="site-christmas-snow" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <i key={i} style={{ "--x": `${(i * 37 + 9) % 100}%`, "--size": `${3 + i % 7}px`, "--duration": `${11 + i % 13}s`, "--delay": `${-i * 2.3}s`, "--drift": `${(i % 2 ? 1 : -1) * (20 + i % 45)}px`, "--opacity": .3 + (i % 6) * .1 } as CSSProperties} />)}</div>;
}

export function ChristmasOrnaments() {
  return <div className="site-christmas-ornaments" aria-hidden="true">
    <img className="site-ornament site-ornament-left" src={asset("bolas de neve.png")} alt="" />
    <img className="site-ornament site-ornament-right" src={asset("bolas de neve.png")} alt="" />
  </div>;
}

function CalendarLeaf({ value, label }: { value: number; label: string }) {
  const previous = useRef(value);
  const [transition, setTransition] = useState<{ from: number; to: number; id: number } | null>(null);
  useEffect(() => {
    if (previous.current === value) return;
    setTransition({ from: previous.current, to: value, id: Date.now() });
    previous.current = value;
    const timer = window.setTimeout(() => setTransition(null), 680);
    return () => window.clearTimeout(timer);
  }, [value]);
  const format = (number: number) => String(number).padStart(2, "0");
  return <div className="xmas-unit">
    <div className="xmas-calendar" aria-hidden="true">
      <span className="xmas-rings" />
      <span className="xmas-number">{format(value)}</span>
      {transition && <span key={transition.id} className="xmas-turning-leaf"><span>{format(transition.from)}</span></span>}
    </div>
    <span className="xmas-unit-label">{label}</span>
  </div>;
}

export default function ChristmasCountdown() {
  const { pick } = useLanguage();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  const parts = countdownParts(now);
  const labels = pick(["DIAS", "HORAS", "MINUTOS", "SEGUNDOS"], ["DAYS", "HOURS", "MINUTES", "SECONDS"]);
  const ended = now >= CHRISTMAS_DEADLINE;
  return <section id="inicio" className="xmas-banner" aria-labelledby="xmas-title">
    <div className="xmas-lights" aria-hidden="true">
      <img src={asset("Fita com luzes.png")} alt="" />
      <img src={asset("Fita com luzes.png")} alt="" />
    </div>
    <div className="xmas-copy">
      <div className="xmas-snowcap" aria-hidden="true" style={{ backgroundImage: `linear-gradient(to bottom,transparent 65%,#edf7ff 90%),url("${asset("Neve.png")}")` }}>
        {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${3 + i * 8.3}%`, top: `${12 + (i * 7) % 18}px`, animationDelay: `${-i * .43}s` }} />)}
      </div>
      <h2 id="xmas-title">
        <span className="xmas-heading-line">{pick("Este Natal,", "This Christmas,")}</span>
        <span className="xmas-heading-line xmas-heading-gold"><em>{pick("todas estas skins", "all these skins")}</em></span>
        <span className="xmas-heading-line">{pick("podem ser tuas!", "could be yours!")}</span>
      </h2>
      <div className="xmas-heading-divider" aria-hidden="true">
        <svg className="xmas-divider-bow" viewBox="0 0 44 35" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 18L10 33L18 29L22 34L24 19Z" fill="#9D2227" stroke="#D8A758" strokeWidth="1"/>
          <path d="M23 18L32 33L25 29L22 34L21 19Z" fill="#B72D30" stroke="#D8A758" strokeWidth="1"/>
          <path d="M20 14C14 8 6 5 4 10C1 16 8 22 20 18Z" fill="#B82B32" stroke="#F1C576" strokeWidth="1.2"/>
          <path d="M24 14C30 8 38 5 40 10C43 16 36 22 24 18Z" fill="#B82B32" stroke="#F1C576" strokeWidth="1.2"/>
          <path d="M7 12C11 13 15 15 19 17M37 12C33 13 29 15 25 17" stroke="#E87566" strokeWidth="1.2" strokeLinecap="round"/>
          <rect x="18" y="13" width="8" height="8" rx="3" fill="#D64139" stroke="#F1C576" strokeWidth="1.3"/>
        </svg>
      </div>
      <p className="xmas-intro">{pick("Celebra o Natal connosco e ganha este loadout incrível.", "Celebrate Christmas with us and win this incredible loadout.")}</p>
      <p className="xmas-countdown-heading">{ended ? pick("CONTAGEM TERMINADA", "COUNTDOWN COMPLETE") : pick("Não percas esta oportunidade! Faltam:", "Don't miss this opportunity! Time left:")}</p>
      <div className="xmas-countdown" role="timer" aria-label={parts.map((value, i) => `${value} ${labels[i]}`).join(", ")}>
        {parts.map((value, i) => <CalendarLeaf key={labels[i]} value={value} label={labels[i]} />)}
      </div>
      <div className="xmas-actions">
        <div className="xmas-proof" role="note">
          <span className="xmas-proof-icon" aria-hidden="true">!</span>
          <p>
            {pick("Para participares, envia a prova de depósito pelo Discord. ", "To enter, send proof of your deposit via Discord. ")}
            <strong>{pick("Sem essa prova, não estarás elegível para o giveaway!", "Without that proof, you won't be eligible for the giveaway!")}</strong>
          </p>
        </div>
        <span className="xmas-actions-separator" aria-hidden="true" />
        <div className="xmas-entry">
          <div className="xmas-partner">
            <span className="xmas-partner-label">{pick("Parceiro oficial", "Official partner")}</span>
            <img className="xmas-partner-logo" src={asset("topskin-logo.png")} alt="TOPSKIN" />
          </div>
          <a className="xmas-participate" href="https://topskin.net/utm/godchyna" target="_blank" rel="noopener noreferrer sponsored">{pick("Participa já!", "Enter now!")} <img className="xmas-button-gnome" src={asset("gnomo.png")} alt="" aria-hidden="true" /></a>
        </div>
      </div>
    </div>
    <div className="xmas-art">
      <img src={asset("imagem-giveaway-natal-final.webp")} alt={pick("As nove skins de Natal CHYNA sobre prendas com neve e luzes douradas", "The nine CHYNA Christmas skins on snowy gifts with golden lights")} fetchPriority="high" />
    </div>
    <div className="xmas-frame-ribbon-top" aria-hidden="true">
      <img src={asset("fita vermelha.png")} alt="" loading="eager" />
    </div>
    <div className="xmas-frame-ribbon-side" aria-hidden="true">
      <img src={asset("fita vermelha.png")} alt="" loading="eager" />
    </div>
  </section>;
}
