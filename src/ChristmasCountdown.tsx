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
      <div className="xmas-snowcap" aria-hidden="true" style={{ backgroundImage: `url("${asset("Neve.png")}")` }} />
      <h2 id="xmas-title">{pick("Este Natal,", "This Christmas,")}<br /><em>{pick("as prendas são skins.", "the gifts are skins.")}</em></h2>
      <p className="xmas-intro">{pick("O espírito de Natal chegou à nossa comunidade.", "Christmas spirit has arrived in our community.")}</p>
      <p className="xmas-countdown-heading">{ended ? pick("CONTAGEM TERMINADA", "COUNTDOWN COMPLETE") : pick("A CONTAGEM JÁ COMEÇOU", "THE COUNTDOWN IS ON")}</p>
      <div className="xmas-countdown" role="timer" aria-label={parts.map((value, i) => `${value} ${labels[i]}`).join(", ")}>
        {parts.map((value, i) => <CalendarLeaf key={labels[i]} value={value} label={labels[i]} />)}
      </div>
      <a className="xmas-participate" href="https://topskin.net/utm/godchyna" target="_blank" rel="noopener noreferrer sponsored">{pick("Participa já", "Enter now")} <span aria-hidden="true">↗</span></a>
    </div>
    <div className="xmas-art"><img src={asset("imagem giveaway.png")} alt={pick("As nove skins de Natal CHYNA sobre prendas com neve e luzes douradas", "The nine CHYNA Christmas skins on snowy gifts with golden lights")} fetchPriority="high" /><img className="xmas-partner-logo" src={asset("topskin-logo.png")} alt="TOPSKIN" /></div>
  </section>;
}
