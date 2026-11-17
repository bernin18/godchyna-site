import type { CSSProperties, Ref, TransitionEvent } from "react";
import { MONTHLY_POINTER_TIP, MONTHLY_SPIN_DURATION_MS, monthlyNameKey } from "./monthlyWheel";
import type { MonthlySegment } from "./monthlyWheel";

export function MonthlyPointerArtwork({ imageUrl }: { imageUrl: string }) {
  return (
    <svg className="monthly-combo-artwork" viewBox="0 0 1024 1536" aria-hidden="true">
      <image href={imageUrl} width="1024" height="1536" />
    </svg>
  );
}

export function MonthlyDrawWheel({
  segments, rotation, spinning, docked, locked, winner, imageUrl,
  disabled, onSpin, onSettled, rotorRef, tipRef, drawLabel,
}: {
  segments: MonthlySegment[];
  rotation: number;
  spinning: boolean;
  docked: boolean;
  locked: boolean;
  winner: string | null;
  imageUrl: string;
  disabled: boolean;
  onSpin: () => void;
  onSettled: () => void;
  rotorRef: Ref<HTMLDivElement>;
  tipRef: Ref<HTMLSpanElement>;
  drawLabel: string;
}) {
  const background = segments.length
    ? `conic-gradient(${segments.map(s => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`).join(",")})`
    : "conic-gradient(#111a20 0deg 360deg)";
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.propertyName === "transform") onSettled();
  }
  return (
    <div className="monthly-wheel-shell">
      <div
        ref={rotorRef}
        className={`monthly-wheel-rotor${spinning ? " is-spinning" : ""}`}
        style={{ background, "--monthly-wheel-angle": `${rotation}deg`, "--monthly-spin-duration": `${MONTHLY_SPIN_DURATION_MS}ms` } as CSSProperties}
        onTransitionEnd={handleTransitionEnd}
      >
        {segments.map(segment => {
          const span = segment.endAngle - segment.startAngle;
          const fontSize = span >= 45 ? 13 : span >= 20 ? 11 : span >= 8 ? 9 : span >= 3 ? 7 : 6;
          return (
            <span key={monthlyNameKey(segment.name)}>
              <span className="monthly-wheel-divider" style={{ "--divider-angle": `${segment.startAngle}deg` } as CSSProperties} />
              <span
                className={`monthly-wheel-name${winner && monthlyNameKey(segment.name) === monthlyNameKey(winner) ? " is-selected" : ""}`}
                style={{ "--wheel-name-angle": `${segment.centerAngle}deg`, "--wheel-name-size": `${fontSize}px` } as CSSProperties}
                title={`${segment.name} · ${segment.count} · ${segment.percentage.toFixed(2)}%`}
              >
                <b>{segment.name}</b>
                {span >= 7 && <small>{segment.percentage.toFixed(span >= 20 ? 1 : 0)}%</small>}
              </span>
            </span>
          );
        })}
      </div>
      {docked ? (
        <div className="monthly-combo-pointer" aria-hidden="true" style={{ transform: `translate(-${MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width * 100}%,-58%)` }}>
          <MonthlyPointerArtwork imageUrl={imageUrl} />
          <span ref={tipRef} className="monthly-combo-tip" style={{ left: `${MONTHLY_POINTER_TIP.x / MONTHLY_POINTER_TIP.width * 100}%`, top: `${MONTHLY_POINTER_TIP.y / MONTHLY_POINTER_TIP.height * 100}%` }} />
        </div>
      ) : (
        <button type="button" className={`monthly-wheel-center${locked ? " is-draw-active" : ""}`} onClick={onSpin} disabled={disabled} aria-label={drawLabel}>
          {!locked && <><span>GIVEAWAY DO</span><strong>CHYNAO</strong></>}
        </button>
      )}
    </div>
  );
}
