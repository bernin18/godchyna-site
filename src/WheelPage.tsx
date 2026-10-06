import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ComponentType, CSSProperties } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, LogIn, LogOut, Save, Ticket, Trash2, Upload, UserRound, Users, Volume2, VolumeX } from "lucide-react";
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

type PlinkoResult = {
  label: string;
  skinName: string;
  imageUrl: string;
  valueEur: number;
  status: "safe" | "eliminated";
};

const ROUND_1_SKINS: PlinkoResult[] = [
  {
    label: "Neo-Noir",
    skinName: "AWP | Neo-Noir",
    imageUrl: "/skins/round-1/awp-neo-noir.png",
    valueEur: 40,
    status: "safe",
  },
  {
    label: "Decimator",
    skinName: "M4A1-S | Decimator",
    imageUrl: "/skins/round-1/m4a1s-decimator.png",
    valueEur: 45,
    status: "safe",
  },
  {
    label: "Reactor",
    skinName: "Glock-18 | Reactor",
    imageUrl: "/skins/round-1/glock-reactor.png",
    valueEur: 65,
    status: "safe",
  },
  {
    label: "Monster Mashup",
    skinName: "USP-S | Monster Mashup",
    imageUrl: "/skins/round-1/usps-monster-mashup.png",
    valueEur: 80,
    status: "safe",
  },
  {
    label: "In Living Color",
    skinName: "M4A4 | In Living Color",
    imageUrl: "/skins/round-1/m4a4-in-living-color.png",
    valueEur: 90,
    status: "safe",
  },
  {
    label: "Temukau",
    skinName: "M4A4 | Temukau",
    imageUrl: "/skins/round-1/m4a4-temukau.png",
    valueEur: 95,
    status: "safe",
  },
  {
    label: "Gamma Doppler",
    skinName: "Glock-18 | Gamma Doppler",
    imageUrl: "/skins/round-1/glock-gamma-doppler.png",
    valueEur: 110,
    status: "safe",
  },
  {
    label: "Frontside Misty",
    skinName: "AK-47 | Frontside Misty",
    imageUrl: "/skins/round-1/ak-frontside-misty.png",
    valueEur: 120,
    status: "safe",
  },
  {
    label: "Hyper Beast",
    skinName: "AWP | Hyper Beast",
    imageUrl: "/skins/round-1/awp-hyper-beast.png",
    valueEur: 145,
    status: "safe",
  },
];

const ROUND_2_SKINS: PlinkoResult[] = [
  {
    label: "Bloodsport",
    skinName: "AK-47 | Bloodsport",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_30 (1).png",
    valueEur: 155,
    status: "safe",
  },
  {
    label: "Aquamarine Revenge",
    skinName: "AK-47 | Aquamarine Revenge",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_30 (2).png",
    valueEur: 175,
    status: "safe",
  },
  {
    label: "Neon Rider",
    skinName: "AK-47 | Neon Rider",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_30 (3).png",
    valueEur: 225,
    status: "safe",
  },
  {
    label: "Kill Confirmed",
    skinName: "USP-S | Kill Confirmed",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_31 (4).png",
    valueEur: 240,
    status: "safe",
  },
  {
    label: "The Emperor",
    skinName: "M4A4 | The Emperor",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_31 (5).png",
    valueEur: 250,
    status: "safe",
  },
  {
    label: "Chantico's Fire",
    skinName: "M4A1-S | Chantico's Fire",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_32 (6).png",
    valueEur: 265,
    status: "safe",
  },
  {
    label: "Fuel Injector",
    skinName: "AK-47 | Fuel Injector",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_32 (7).png",
    valueEur: 360,
    status: "safe",
  },
  {
    label: "Printstream",
    skinName: "M4A1-S | Printstream",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_32 (8).png",
    valueEur: 410,
    status: "safe",
  },
  {
    label: "Containment Breach",
    skinName: "AWP | Containment Breach",
    imageUrl: "/skins/round-2/ChatGPT Image 24_09_2026, 19_14_33 (9).png",
    valueEur: 425,
    status: "safe",
  },
];

const ROUND_3_SKINS: PlinkoResult[] = [
  {
    label: "Blue Phosphor",
    skinName: "M4A1-S | Blue Phosphor",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_42 (1).png",
    valueEur: 525,
    status: "safe",
  },
  {
    label: "Fade",
    skinName: "AWP | Fade",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_42 (2).png",
    valueEur: 680,
    status: "safe",
  },
  {
    label: "Vulcan",
    skinName: "AK-47 | Vulcan",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_42 (3).png",
    valueEur: 585,
    status: "safe",
  },
  {
    label: "Icarus Fell",
    skinName: "M4A1-S | Icarus Fell",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (4).png",
    valueEur: 460,
    status: "safe",
  },
  {
    label: "Oni Taiji",
    skinName: "AWP | Oni Taiji",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (5).png",
    valueEur: 570,
    status: "safe",
  },
  {
    label: "Blaze",
    skinName: "Desert Eagle | Blaze",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (6).png",
    valueEur: 600,
    status: "safe",
  },
  {
    label: "Lightning Strike",
    skinName: "AWP | Lightning Strike",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (7).png",
    valueEur: 450,
    status: "safe",
  },
  {
    label: "Eye of Horus",
    skinName: "M4A4 | Eye of Horus",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (8).png",
    valueEur: 700,
    status: "safe",
  },
  {
    label: "Jet Set",
    skinName: "AK-47 | Jet Set",
    imageUrl: "/skins/round-3/ChatGPT Image 25_09_2026, 01_03_43 (9).png",
    valueEur: 1040,
    status: "safe",
  },
];

const ROUND_4_SKINS: PlinkoResult[] = [
  {
    label: "Fire Serpent",
    skinName: "AK-47 | Fire Serpent",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_47 (1).png",
    valueEur: 1500,
    status: "safe",
  },
  {
    label: "Welcome to the Jungle",
    skinName: "M4A1-S | Welcome to the Jungle",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_47 (2).png",
    valueEur: 2000,
    status: "safe",
  },
  {
    label: "Poseidon",
    skinName: "M4A4 | Poseidon",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_47 (3).png",
    valueEur: 2500,
    status: "safe",
  },
  {
    label: "Medusa",
    skinName: "AWP | Medusa",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_47 (4).png",
    valueEur: 3000,
    status: "safe",
  },
  {
    label: "Desert Hydra",
    skinName: "AWP | Desert Hydra",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_47 (5).png",
    valueEur: 4000,
    status: "safe",
  },
  {
    label: "Howl",
    skinName: "M4A4 | Howl",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_48 (6).png",
    valueEur: 6500,
    status: "safe",
  },
  {
    label: "Wild Lotus",
    skinName: "AK-47 | Wild Lotus",
    imageUrl: "/skins/round-4/Ak wild lotus.png",
    valueEur: 5000,
    status: "safe",
  },
  {
    label: "Gungnir",
    skinName: "AWP | Gungnir",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_48 (8).png",
    valueEur: 8000,
    status: "safe",
  },
  {
    label: "Dragon Lore",
    skinName: "AWP | Dragon Lore",
    imageUrl: "/skins/round-4/ChatGPT Image 25_09_2026, 01_28_48 (9).png",
    valueEur: 10000,
    status: "safe",
  },
];

type CaseRound = {
  number: number;
  label: string;
  tone: "green" | "purple" | "red" | "gold";
  skins: PlinkoResult[];
  caseImage: string;
};

type CaseOpening = {
  round: number;
  playerName: string;
  entries: number;
  skin: PlinkoResult;
};

const CASE_ROUNDS: CaseRound[] = [
  {
    number: 1,
    label: "GREEN CASE",
    tone: "green",
    skins: ROUND_1_SKINS,
    caseImage: "/Case verde.png",
  },
  {
    number: 2,
    label: "PURPLE CASE",
    tone: "purple",
    skins: ROUND_2_SKINS,
    caseImage: "/case Roxa.png",
  },
  {
    number: 3,
    label: "RED CASE",
    tone: "red",
    skins: ROUND_3_SKINS,
    caseImage: "/Case vermelha.png",
  },
  {
    number: 4,
    label: "GOLD CASE",
    tone: "gold",
    skins: ROUND_4_SKINS,
    caseImage: "/gold case.png",
  },
];

const CASE_BASE_WEIGHTS = [25, 22, 18, 14, 9, 6, 3.5, 1.8, 0.7];
const CASE_MAX_WEIGHTS = [21, 19, 16, 13, 10, 8, 5, 3, 5];

function caseBoostProgress(entries: number) {
  const cappedEntries = Math.max(1, Math.min(150, entries));
  return Math.sqrt((cappedEntries - 1) / 149);
}

function caseWeightsForEntries(entries: number) {
  const boost = caseBoostProgress(entries);
  return CASE_BASE_WEIGHTS.map(
    (base, index) => base + (CASE_MAX_WEIGHTS[index] - base) * boost,
  );
}

function caseTopSkinChance(entries: number) {
  return caseWeightsForEntries(entries)[CASE_BASE_WEIGHTS.length - 1];
}

function pickCaseSkin(skins: PlinkoResult[], entries: number) {
  const sorted = [...skins].sort((a, b) => a.valueEur - b.valueEur);
  const weights = caseWeightsForEntries(entries);
  const roll = randomParticipantIndex(1_000_000) / 10_000;
  let cursor = 0;

  for (let index = 0; index < sorted.length; index += 1) {
    cursor += weights[index] ?? 0;
    if (roll < cursor) return sorted[index];
  }

  return sorted[sorted.length - 1];
}

const wheelAsset = (name: string) => `${import.meta.env.BASE_URL}${name}`;
const previewNames = ["NUNO","RUI","MIGUEL","ANA","DIOGO","TIAGO","SOFIA","PEDRO","LUIS","MARTA","ALEX","JOAO"];
const WHEEL_COLORS = ["#b9851f", "#111a20", "#754b1a", "#263238"];
const WHEEL_DIVIDER_COLOR = "#4f3a1b";
// TODO: Set this to false once Survivor Wheel + Plinko are complete and ready for users.
const ADMIN_ONLY_WHEEL = true;

function wheelGradient(count: number) {
  const segmentCount = Math.max(count, 1);
  const step = 360 / segmentCount;

  return `conic-gradient(${Array.from({ length: segmentCount }, (_, index) => {
    let color = WHEEL_COLORS[index % WHEEL_COLORS.length];

    if (
      segmentCount > 1 &&
      index === segmentCount - 1 &&
      color === WHEEL_COLORS[0]
    ) {
      color = WHEEL_COLORS[1];
    }

    return `${color} ${index * step}deg ${(index + 1) * step}deg`;
  }).join(",")})`;
}

function WheelDividers({ count }: { count: number }) {
  if (count <= 1) return null;

  const step = 360 / count;

  return (
    <svg
      className="wheel-segment-dividers"
      viewBox="0 0 100 100"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      {Array.from({ length: count }, (_, index) => {
        const angle = (index * step - 90) * (Math.PI / 180);
        const x = 50 + 50 * Math.cos(angle);
        const y = 50 + 50 * Math.sin(angle);

        return (
          <line
            key={index}
            x1="50"
            y1="50"
            x2={x}
            y2={y}
            stroke={WHEEL_DIVIDER_COLOR}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function nameFontSize(name: string, count: number) {
  if (count > 70) return 6;
  if (count > 50) return 7;
  if (count > 34) return 8;
  if (name.length > 18) return 8;
  if (name.length > 13) return 9;
  return 10;
}

const DIRECT_TOP_FIVE_THRESHOLD = 200;
const LARGE_WHEEL_VISUAL_SEGMENTS = 600;
const LARGE_WHEEL_VISIBLE_NAMES = 100;
const LARGE_WHEEL_LIST_LIMIT = 160;
const MAX_PARTICIPANT_MULTIPLIER = 500;

function parseParticipantInput(input: string) {
  const entries: string[] = [];
  let cappedLines = 0;

  input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const multiplierMatch = line.match(/^(.*?)\s+(?:(\d+)\s*x|x\s*(\d+))$/i);

      if (!multiplierMatch) {
        entries.push(line);
        return;
      }

      const name = multiplierMatch[1].trim();
      if (!name) return;

      const requestedCount = Number(multiplierMatch[2] ?? multiplierMatch[3] ?? 1);
      const safeCount = Number.isFinite(requestedCount)
        ? Math.max(1, Math.min(MAX_PARTICIPANT_MULTIPLIER, Math.floor(requestedCount)))
        : 1;

      if (requestedCount > MAX_PARTICIPANT_MULTIPLIER) cappedLines += 1;

      entries.push(...Array.from({ length: safeCount }, () => name));
    });

  return { entries, cappedLines };
}
const LARGE_WHEEL_GRADIENT =
  "repeating-conic-gradient(#b9851f 0deg 5.625deg,#111a20 5.625deg 11.25deg,#754b1a 11.25deg 16.875deg,#263238 16.875deg 22.5deg)";

function uniqueParticipantNames(entries: string[]) {
  const unique = new Map<string, string>();

  entries.forEach((entry) => {
    const trimmed = entry.trim();
    const key = trimmed.toLocaleLowerCase();
    if (trimmed && !unique.has(key)) unique.set(key, trimmed);
  });

  return Array.from(unique.values());
}

function shouldUseDirectTopFive(entries: string[]) {
  return (
    entries.length > DIRECT_TOP_FIVE_THRESHOLD &&
    uniqueParticipantNames(entries).length >= 5
  );
}

function randomParticipantIndex(count: number) {
  if (count <= 1) return 0;

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const range = 0x100000000;
    const limit = range - (range % count);
    const values = new Uint32Array(1);
    let value = 0;

    do {
      window.crypto.getRandomValues(values);
      value = values[0];
    } while (value >= limit);

    return value % count;
  }

  return Math.floor(Math.random() * count);
}

function shuffleParticipantEntries(entries: string[]) {
  const shuffled = [...entries];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomParticipantIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function spreadParticipantEntries(entries: string[]) {
  if (entries.length <= 2) return [...entries];

  // Large giveaways use direct TOP 5 qualification. At this size, repeatedly
  // sorting duplicate groups is expensive and brings no fairness benefit:
  // every entry still has the same chance regardless of its array position.
  if (entries.length > DIRECT_TOP_FIVE_THRESHOLD) {
    return shuffleParticipantEntries(entries);
  }

  const grouped = new Map<string, { name: string; count: number }>();

  entries.forEach((entry) => {
    const name = entry.trim();
    if (!name) return;

    const key = name.toLocaleLowerCase();
    const current = grouped.get(key);

    if (current) {
      current.count += 1;
    } else {
      grouped.set(key, { name, count: 1 });
    }
  });

  const groups = Array.from(grouped.values());
  const spread: string[] = [];
  let previousKey = "";

  while (spread.length < entries.length) {
    const available = groups
      .filter((group) => group.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return randomParticipantIndex(2) === 0 ? -1 : 1;
      });

    if (available.length === 0) break;

    let selected = available[0];
    const selectedKey = selected.name.toLocaleLowerCase();

    if (selectedKey === previousKey && available.length > 1) {
      selected = available[1];
    }

    spread.push(selected.name);
    selected.count -= 1;
    previousKey = selected.name.toLocaleLowerCase();
  }

  return spread;
}

function formatFactoryNewSkinName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  return /(?:^|\s)FN$/i.test(trimmed) ? trimmed : `${trimmed} FN`;
}

function historySkinImage(name: string) {
  const normalized = name
    .replace(/StatTrak™?/gi, "")
    .replace(/Souvenir/gi, "")
    .replace(/\b(FN|MW|FT|WW|BS)\b/gi, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();

  const images: Record<string, string> = {
    "desert eagle | firebreathing": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk6_evb6hoH_aaHGKS0-t3pOlgQS6MmRQguynLn9ircSiTPFUgCJAkQbELsxXtktDkMurk4lTZ39hEyn_-3HsbvXxj4fFCD_RcNNN-xQ",
    "awp | ice coaled": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_DVL0PutbZtuL_GfC2OvzedxuPUnS3u3wR8lsTzTn4qqcXuXOlQmCpUiQOdYtUG_ltXgP-u04wWL3Y9NnjK-0H2dw8uldQ",
    "ak-47 | nouveau rouge": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wipC6s2vY_A6H_6cG3GVwPtJvOhuRz39zBsm5j-HyNqpd32fPVd1AsB3RbEP4xntwdPuM-jl4QaK2NpCzX_23DQJsHjpyGbntg",
    "ak-47 | ice coaled": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwlcK3wiFO0POlPPNSI_-UGm-Zz-llj-1gSCGn2x4l5z_RyNj6JXnEbgFzXMYjEOUIsBe5m9exP-zg4leMj4pGxXn7jCJXrnE84asPq_0",
    "awp | black nile": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf-jFk7uW-V7d5Mv-dC1icyOl-pK89Gyvhlhsit2-BwoyrICmWPQcmDpEkQOdeskOxwNKzN7vm4VeP2oMR02yg2Z2CmmVC",
    "m4a4 | tooth fairy": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL8ypexwiFO0P_6afBSMeWWC2mWwOdkqd5lRi67gVN35WyDwtv8IC-RblVxCpchQLIOuhK8xNG2YbnktAXZjthFxCiohntP8G81tOVu8Qhw",
    "usp-s | jawbreaker": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLkjYbf7itX6vytbbZSNeODHViUzulxqd5lRi67gVMl62nUyd2scnOVPAcgA5J2TOFY5xLrlN22YbzgsQaI2IlHyiWojnwa8G81tErOD-_J",
    "tec-9 | brother": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLlm5W5wiVI0Oara_1SJ-WWHG6cze9JvOhuRz39xBsj4GmEyt-vIHjEbgJ2CsR2RONfu0K_lYXvZrjg4ADYg4wXzin42DQJsHgTPX1sbQ",
    "glock-18 | shinobu": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL2kpnj9h1c4_2tY5t-KPmdAWWF_uJ_t-l9AX6ylh5w4mTcwtahdS2VOgRzWJsjEOQL5EWxwNblZeK2tVPXitlDmyvgznQeC7fvQL8",
    "awp | green energy": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jde0Pi7ZbRSLPmdC1icyOl-pK8wTCzlxkl_tm7Vz9j6cnLEOA91C5siTOBYsRWwxtC2MOzj5g2I3Y4W02yg2VFgswq6",
    "desert eagle | mecha industries": "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk6OGRbKFsJ_yWMWqVwuZ3j-1gSCGn20h042vSyY2tdyjCZwIlXJBxQeNe4EWxxoHkMOq0sQGIid5Fnyr42HtXrnE8p4gbgvE",
  };

  return images[normalized] ?? null;
}

type MonthlyHistoryDemo = {
  winnerName: string;
  skinName: string;
  skinValue: number;
  imageUrl: string;
  completedAt: string;
  phase: "showcase" | "landed";
};

export default function WheelPage({ Header, Footer }: WheelPageProps) {
  const { pick } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [isTestGiveaway, setIsTestGiveaway] = useState(false);
  const [monthlyGiveawayMode, setMonthlyGiveawayMode] = useState(false);
  const [monthlyKnifeRotation, setMonthlyKnifeRotation] = useState(45);
  const [monthlyWheelRotation, setMonthlyWheelRotation] = useState(0);
  const [monthlySpinning, setMonthlySpinning] = useState(false);
  const [monthlyWinner, setMonthlyWinner] = useState<string | null>(null);
  const [monthlyLaunching, setMonthlyLaunching] = useState(false);
  const [monthlyKnifeDocked, setMonthlyKnifeDocked] = useState(false);
  const [monthlyKnifeFlightStyle, setMonthlyKnifeFlightStyle] = useState<CSSProperties | null>(null);
  const [monthlyHistoryDemo, setMonthlyHistoryDemo] = useState<MonthlyHistoryDemo | null>(null);
  const [monthlyHistoryFlightStyle, setMonthlyHistoryFlightStyle] = useState<CSSProperties | null>(null);
  const monthlyHistoryFlightRef = useRef<HTMLElement | null>(null);
  const monthlyHistorySlotRef = useRef<HTMLDivElement | null>(null);
  const [giveawayHistory, setGiveawayHistory] = useState<Array<{
    id: number;
    offeredBy: string;
    winnerName: string;
    skinName: string;
    skinValue: number | null;
    completedAt: string;
    giveawayType: "regular" | "monthly";
    imageUrl: string;
  }>>([]);
  const [giveawayHistoryTotal, setGiveawayHistoryTotal] = useState(0);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [quickParticipantName, setQuickParticipantName] = useState("");
  const [quickParticipantCount, setQuickParticipantCount] = useState(1);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantMessage, setParticipantMessage] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [autoSpin, setAutoSpin] = useState(false);
  const [giveawayPrizeName, setGiveawayPrizeName] = useState("");
  const [giveawayPrizeValue, setGiveawayPrizeValue] = useState("");
  const [giveawayPrizeImagePath, setGiveawayPrizeImagePath] = useState<string | null>(null);
  const [giveawayPrizeImageUrl, setGiveawayPrizeImageUrl] = useState("");
  const [giveawayPrizeSaving, setGiveawayPrizeSaving] = useState(false);
  const [giveawayPrizeMessage, setGiveawayPrizeMessage] = useState("");
  const [giveawayPrizeEditing, setGiveawayPrizeEditing] = useState(true);
  const [monthlyPrizeDraftName, setMonthlyPrizeDraftName] = useState("");
  const [monthlyPrizeDraftValue, setMonthlyPrizeDraftValue] = useState("");
  const [monthlyPrizeDraftImagePath, setMonthlyPrizeDraftImagePath] = useState<string | null>(null);
  const [monthlyPrizeDraftImageUrl, setMonthlyPrizeDraftImageUrl] = useState("");
  const [monthlyPrizeDraftSaving, setMonthlyPrizeDraftSaving] = useState(false);
  const [monthlyPrizeDraftMessage, setMonthlyPrizeDraftMessage] = useState("");
  const [monthlyPrizeDraftEditing, setMonthlyPrizeDraftEditing] = useState(true);
  const [winnerGiveawayPrizeName, setWinnerGiveawayPrizeName] = useState("");
  const [winnerGiveawayPrizeImageUrl, setWinnerGiveawayPrizeImageUrl] = useState("");
  const [winnerGiveawayPrizeCleanupPath, setWinnerGiveawayPrizeCleanupPath] = useState<string | null>(null);
  const winnerCelebrationVisibleRef = useRef(false);
  const giveawayFinalizedRef = useRef(false);
  const prizeImageInputRef = useRef<HTMLInputElement | null>(null);
  const monthlyPrizeUploadInputRef = useRef<HTMLInputElement | null>(null);
  const monthlyPrizeImageRef = useRef<HTMLImageElement | null>(null);
  const monthlyAudioRef = useRef<HTMLAudioElement | null>(null);
  const [monthlyAudioMuted, setMonthlyAudioMuted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewSpinning, setPreviewSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;

    try {
      return window.localStorage.getItem("godchyna-sound") !== "off";
    } catch {
      return true;
    }
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const winnerApplauseIntervalRef = useRef<number | null>(null);
  const wheelRotorRef = useRef<HTMLDivElement | null>(null);
  const spinWheelRef = useRef<() => void>(() => {});
  const wheelSpinAnimationRef = useRef<number | null>(null);
  const wheelLastSectorRef = useRef<number | null>(null);
  const wheelLastDividerSoundRef = useRef(0);
  const caseReelWindowRef = useRef<HTMLDivElement | null>(null);
  const caseReelAnimationRef = useRef<number | null>(null);
  const caseLastTickIndexRef = useRef<number | null>(null);
  const caseLastTickSoundRef = useRef(0);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  const [pendingWinnerIndex, setPendingWinnerIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [eliminationNotice, setEliminationNotice] = useState<
    | { kind: "elimination"; name: string; remainingEntries: number }
    | { kind: "qualification"; name: string; position: number }
    | null
  >(null);
  const [wheelMode, setWheelMode] = useState<"elimination" | "qualification" | null>(null);
  const [qualifiedParticipants, setQualifiedParticipants] = useState<string[]>([]);
  const [qualifiedEntryCounts, setQualifiedEntryCounts] = useState<Record<string, number>>({});
  const [showQualificationIntro, setShowQualificationIntro] = useState(false);
  const [qualificationIntroSeen, setQualificationIntroSeen] = useState(false);
  const [qualificationStartIntent, setQualificationStartIntent] = useState<"manual" | "auto" | null>(null);
  const [wheelWinnerNotice, setWheelWinnerNotice] = useState<string | null>(null);
  const [pendingTopFive, setPendingTopFive] = useState<string[] | null>(null);
  const [topFive, setTopFive] = useState<string[] | null>(null);
  const [showTopFiveModal, setShowTopFiveModal] = useState(false);
  const [showPlinko, setShowPlinko] = useState(false);
  const [showPlinkoTransition, setShowPlinkoTransition] = useState(false);
  const [showCaseMode, setShowCaseMode] = useState(false);
  const [showCaseTransition, setShowCaseTransition] = useState(false);
  const [caseRound, setCaseRound] = useState(1);
  const [casePlayerIndex, setCasePlayerIndex] = useState(0);
  const [caseRoundOrder, setCaseRoundOrder] = useState<string[]>([]);
  const [caseOpenings, setCaseOpenings] = useState<CaseOpening[]>([]);
  const [caseRolling, setCaseRolling] = useState(false);
  const [caseReel, setCaseReel] = useState<PlinkoResult[]>([]);
  const [caseReelRun, setCaseReelRun] = useState(false);
  const [caseStopOffset, setCaseStopOffset] = useState(0);
  const [caseLastOpening, setCaseLastOpening] = useState<CaseOpening | null>(null);
  const [caseWinnerNotice, setCaseWinnerNotice] = useState<string | null>(null);
  const [caseTiebreakPlayers, setCaseTiebreakPlayers] = useState<string[]>([]);
  const [caseRoundIntroVisible, setCaseRoundIntroVisible] = useState(false);
  const [caseAutoOpenPending, setCaseAutoOpenPending] = useState(false);
  const [plinkoResults, setPlinkoResults] = useState<Record<number, PlinkoResult>>({});
  const [plinkoDropSlots, setPlinkoDropSlots] = useState<Record<number, number>>({});
  const [plinkoPlayers, setPlinkoPlayers] = useState<string[]>([]);
  const [plinkoRound, setPlinkoRound] = useState(1);
  const [plinkoEliminationNotice, setPlinkoEliminationNotice] = useState<{
    playerName: string;
    result: PlinkoResult;
    survivors: string[];
    winnerResult?: PlinkoResult;
  } | null>(null);
  const [plinkoTieNotice, setPlinkoTieNotice] = useState<{
    indexes: number[];
    names: string[];
    skinName: string | null;
    valueEur: number;
  } | null>(null);
  const [plinkoTiebreakIndexes, setPlinkoTiebreakIndexes] = useState<number[] | null>(null);
  const [plinkoTiebreakResults, setPlinkoTiebreakResults] = useState<Record<number, PlinkoResult>>({});
  const [plinkoTiebreakDropSlots, setPlinkoTiebreakDropSlots] = useState<Record<number, number>>({});
  const [plinkoWinnerNotice, setPlinkoWinnerNotice] = useState<{
    playerName: string;
    result: PlinkoResult;
  } | null>(null);
  const [plinkoDropping, setPlinkoDropping] = useState(false);
  const [plinkoHitPegs, setPlinkoHitPegs] = useState<string[]>([]);
  const [plinkoLandedSlot, setPlinkoLandedSlot] = useState<number | null>(null);
  const [plinkoExplosionSlot, setPlinkoExplosionSlot] = useState<number | null>(null);
  const [plinkoRewardNotice, setPlinkoRewardNotice] = useState<{ playerName: string; reward: PlinkoResult | null } | null>(null);
  const plinkoC4Ref = useRef<HTMLDivElement | null>(null);
  const plinkoBoardRef = useRef<HTMLElement | null>(null);
  const plinkoAnimationRef = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setAccount(null);
        setConfiguring(false);
        setMonthlyGiveawayMode(false);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!monthlyHistoryDemo || monthlyHistoryDemo.phase !== "showcase") return;

    let finishTimer: number | null = null;

    const holdTimer = window.setTimeout(() => {
      const flyingCard = monthlyHistoryFlightRef.current;
      const targetSlot = monthlyHistorySlotRef.current;

      if (!flyingCard || !targetSlot) {
        setMonthlyHistoryDemo((current) =>
          current ? { ...current, phase: "landed" } : current,
        );
        setMonthlyHistoryFlightStyle(null);
        return;
      }

      const from = flyingCard.getBoundingClientRect();
      const to = targetSlot.getBoundingClientRect();

      setMonthlyHistoryFlightStyle({
        left: from.left,
        top: from.top,
        width: from.width,
        height: from.height,
        transform: "none",
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMonthlyHistoryFlightStyle({
            left: to.left,
            top: to.top,
            width: to.width,
            height: to.height,
            transform: "none",
          });

          finishTimer = window.setTimeout(() => {
            setMonthlyHistoryDemo((current) =>
              current ? { ...current, phase: "landed" } : current,
            );
            setMonthlyHistoryFlightStyle(null);
          }, 950);
        });
      });
    }, 2000);

    return () => {
      window.clearTimeout(holdTimer);
      if (finishTimer !== null) window.clearTimeout(finishTimer);
    };
  }, [monthlyHistoryDemo?.phase]);

  useEffect(() => {
    if (monthlyHistoryDemo?.phase !== "landed") return;

    const syncTimer = window.setTimeout(() => {
      void loadGiveawayHistory();
      setMonthlyHistoryDemo(null);
    }, 1200);

    return () => window.clearTimeout(syncTimer);
  }, [monthlyHistoryDemo?.phase]);

  useEffect(() => {
    if (!session?.user.id) {
      setGiveawayPrizeName("");
      setGiveawayPrizeValue("");
      setGiveawayPrizeImagePath(null);
      setGiveawayPrizeImageUrl("");
      setGiveawayPrizeMessage("");
      setGiveawayPrizeEditing(true);
      return;
    }

    let cancelled = false;

    async function loadGiveawayPrize() {
      const { data, error } = await supabase
        .from("giveaway_prize_drafts")
        .select("skin_name, skin_value, image_path, is_saved")
        .eq("user_id", session!.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setGiveawayPrizeMessage(
          pick("Não foi possível carregar a skin guardada.", "Unable to load the saved skin."),
        );
        return;
      }

      setGiveawayPrizeName(data?.skin_name ?? "");
      setGiveawayPrizeValue(
        data?.skin_value === null || data?.skin_value === undefined
          ? ""
          : String(data.skin_value),
      );
      setGiveawayPrizeImagePath(data?.image_path ?? null);
      setGiveawayPrizeEditing(!(data?.is_saved ?? false));

      if (data?.image_path) {
        const { data: publicData } = supabase.storage
          .from("giveaway-prizes")
          .getPublicUrl(data.image_path);
        setGiveawayPrizeImageUrl(publicData.publicUrl);
      } else {
        setGiveawayPrizeImageUrl("");
      }
    }

    void loadGiveawayPrize();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id, pick]);

  useEffect(() => {
    if (!session?.user.id || account?.role !== "admin") {
      setMonthlyPrizeDraftName("");
      setMonthlyPrizeDraftValue("");
      setMonthlyPrizeDraftImagePath(null);
      setMonthlyPrizeDraftImageUrl("");
      setMonthlyPrizeDraftMessage("");
      setMonthlyPrizeDraftEditing(true);
      return;
    }

    let cancelled = false;

    async function loadMonthlyGiveawayPrize() {
      const { data, error } = await supabase.rpc("get_monthly_giveaway_prize");

      if (cancelled) return;

      if (error) {
        setMonthlyPrizeDraftMessage(
          pick(
            "Não foi possível carregar o prémio mensal.",
            "Unable to load the monthly prize.",
          ),
        );
        return;
      }

      const row = Array.isArray(data) && data.length > 0 ? data[0] : null;

      setMonthlyPrizeDraftName(row?.skin_name ?? "");
      setMonthlyPrizeDraftValue(
        row?.skin_value === null || row?.skin_value === undefined
          ? ""
          : String(row.skin_value),
      );
      setMonthlyPrizeDraftImagePath(row?.image_path ?? null);
      setMonthlyPrizeDraftEditing(!(row?.is_saved ?? false));

      if (row?.image_path) {
        const { data: publicData } = supabase.storage
          .from("giveaway-prizes")
          .getPublicUrl(row.image_path);
        setMonthlyPrizeDraftImageUrl(publicData.publicUrl);
      } else {
        setMonthlyPrizeDraftImageUrl("");
      }
    }

    void loadMonthlyGiveawayPrize();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id, account?.role, pick]);

  async function loadGiveawayHistory() {
    const { data, error } = await supabase
      .from("giveaway_history")
      .select("id, offered_by, winner_name, skin_name, skin_value, completed_at, giveaway_type, image_path")
      .order("completed_at", { ascending: false });

    if (error) return;

    const historyItems = (data ?? []).map((item) => {
      const imageUrl = item.image_path
        ? supabase.storage.from("giveaway-prizes").getPublicUrl(item.image_path).data.publicUrl
        : "";

      return {
        id: item.id,
        offeredBy: item.offered_by || "Chyna",
        winnerName: item.winner_name,
        skinName: item.skin_name || "",
        skinValue:
          item.skin_value === null || item.skin_value === undefined
            ? null
            : Number(item.skin_value),
        completedAt: item.completed_at,
        giveawayType: item.giveaway_type === "monthly" ? "monthly" as const : "regular" as const,
        imageUrl,
      };
    });

    setGiveawayHistory(historyItems);
    setGiveawayHistoryTotal(
      historyItems.reduce(
        (total, item) => total + (item.skinValue ?? 0),
        0,
      ),
    );
  }

  useEffect(() => {
    void loadGiveawayHistory();
  }, []);

  function formatHistoryDate(value: string) {
    return new Date(value).toLocaleDateString(
      pick("pt-PT", "en-GB"),
      { day: "2-digit", month: "2-digit", year: "numeric" },
    );
  }

  const plinkoRoundLabel =
    plinkoRound === 1
      ? "TOP 5"
      : plinkoRound === 2
        ? pick("QUARTOS DE FINAL", "QUARTERFINALS")
        : plinkoRound === 3
          ? pick("MEIAS-FINAIS", "SEMIFINALS")
          : pick("FINAL!", "FINAL!");

  const activePlinkoSkins =
    plinkoRound === 2
      ? ROUND_2_SKINS
      : plinkoRound === 3
        ? ROUND_3_SKINS
        : plinkoRound === 4
          ? ROUND_4_SKINS
          : ROUND_1_SKINS;

  const plinkoPhaseIndexes =
    plinkoTiebreakIndexes && plinkoTiebreakIndexes.length > 0
      ? plinkoTiebreakIndexes
      : plinkoPlayers.map((_, index) => index);

  const plinkoPhaseDropSlots =
    plinkoTiebreakIndexes && plinkoTiebreakIndexes.length > 0
      ? plinkoTiebreakDropSlots
      : plinkoDropSlots;

  const plinkoPhaseComplete =
    plinkoPhaseIndexes.length > 0 &&
    plinkoPhaseIndexes.every(
      (index) => plinkoPhaseDropSlots[index] !== undefined,
    );

  function closePlinkoRewardNotice() {
    setPlinkoRewardNotice(null);

    if (!plinkoPlayers.length || !plinkoPhaseComplete) return;

    const resolvingTiebreak =
      Boolean(plinkoTiebreakIndexes && plinkoTiebreakIndexes.length > 0);

    const activeIndexes = resolvingTiebreak
      ? plinkoTiebreakIndexes!
      : plinkoPlayers.map((_, index) => index);

    const activeResults = activeIndexes.map((index) => ({
      index,
      result: resolvingTiebreak
        ? plinkoTiebreakResults[index]
        : plinkoResults[index],
    }));

    if (activeResults.some(({ result }) => !result)) return;

    const minimumValue = Math.min(
      ...activeResults.map(({ result }) => result!.valueEur),
    );

    const lowestEntries = activeResults.filter(
      ({ result }) => result!.valueEur === minimumValue,
    );

    // A tiebreak exists ONLY when two or more players share the lowest
    // value of the current phase. Equal higher results are already safe.
    if (lowestEntries.length > 1) {
      const tiedIndexes = lowestEntries.map(({ index }) => index);
      const skinNames = new Set(
        lowestEntries.map(({ result }) => result!.skinName),
      );

      setPlinkoTieNotice({
        indexes: tiedIndexes,
        names: tiedIndexes.map((index) => plinkoPlayers[index]),
        skinName:
          skinNames.size === 1 ? lowestEntries[0].result!.skinName : null,
        valueEur: minimumValue,
      });
      return;
    }

    const eliminatedIndex = lowestEntries[0].index;
    const eliminatedResult = lowestEntries[0].result!;
    const survivors = plinkoPlayers.filter((_, index) => index !== eliminatedIndex);
    const winnerIndex =
      survivors.length === 1
        ? plinkoPlayers.findIndex((_, index) => index !== eliminatedIndex)
        : -1;

    const winnerResult =
      winnerIndex >= 0
        ? resolvingTiebreak
          ? plinkoTiebreakResults[winnerIndex] ?? plinkoResults[winnerIndex]
          : plinkoResults[winnerIndex]
        : undefined;

    setPlinkoTiebreakIndexes(null);
    setPlinkoTiebreakResults({});
    setPlinkoTiebreakDropSlots({});

    if (survivors.length === 1 && winnerResult) {
      setPlinkoWinnerNotice({
        playerName: survivors[0],
        result: winnerResult,
      });
      void finalizeCurrentGiveaway(survivors[0]);
      return;
    }

    setPlinkoEliminationNotice({
      playerName: plinkoPlayers[eliminatedIndex],
      result: eliminatedResult,
      survivors,
      winnerResult,
    });
  }

  function startPlinkoTiebreak() {
    if (!plinkoTieNotice) return;

    setPlinkoTiebreakIndexes(plinkoTieNotice.indexes);
    setPlinkoTiebreakResults({});
    setPlinkoTiebreakDropSlots({});
    setPlinkoHitPegs([]);
    setPlinkoLandedSlot(null);
    setPlinkoExplosionSlot(null);
    setPlinkoTieNotice(null);

    const c4 = plinkoC4Ref.current;
    if (c4) {
      c4.getAnimations().forEach((animation) => animation.cancel());
      c4.style.transform = "translate(0px, 0px) rotate(-3deg)";
    }
  }

  function startNextPlinkoRound() {
    if (!plinkoEliminationNotice) return;

    if (
      plinkoEliminationNotice.survivors.length === 1 &&
      plinkoEliminationNotice.winnerResult
    ) {
      setPlinkoWinnerNotice({
        playerName: plinkoEliminationNotice.survivors[0],
        result: plinkoEliminationNotice.winnerResult,
      });
      void finalizeCurrentGiveaway(plinkoEliminationNotice.survivors[0]);
      setPlinkoEliminationNotice(null);
      return;
    }

    setPlinkoPlayers(plinkoEliminationNotice.survivors);
    setPlinkoRound((round) => round + 1);
    setPlinkoResults({});
    setPlinkoDropSlots({});
    setPlinkoHitPegs([]);
    setPlinkoLandedSlot(null);
    setPlinkoExplosionSlot(null);
    setPlinkoRewardNotice(null);
    setPlinkoEliminationNotice(null);
    setPlinkoTieNotice(null);
    setPlinkoTiebreakIndexes(null);
    setPlinkoTiebreakResults({});
    setPlinkoTiebreakDropSlots({});
    setPlinkoDropping(false);

    const c4 = plinkoC4Ref.current;
    if (c4) {
      c4.getAnimations().forEach((animation) => animation.cancel());
      c4.style.transform = "translate(0px, 0px) rotate(-3deg)";
    }
  }

  useEffect(() => {
    setPlinkoPlayers(topFive ?? []);
    setPlinkoRound(1);
    setPlinkoResults({});
    setPlinkoDropSlots({});
    setPlinkoHitPegs([]);
    setPlinkoLandedSlot(null);
    setPlinkoExplosionSlot(null);
    setPlinkoRewardNotice(null);
    setPlinkoEliminationNotice(null);
    setPlinkoTieNotice(null);
    setPlinkoTiebreakIndexes(null);
    setPlinkoTiebreakResults({});
    setPlinkoTiebreakDropSlots({});
    setPlinkoWinnerNotice(null);
    setPlinkoDropping(false);
  }, [topFive]);

  useEffect(() => {
    return () => {
      if (plinkoAnimationRef.current !== null) {
        window.cancelAnimationFrame(plinkoAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (winnerApplauseIntervalRef.current !== null) {
      window.clearInterval(winnerApplauseIntervalRef.current);
      winnerApplauseIntervalRef.current = null;
    }

    if ((!plinkoWinnerNotice && !wheelWinnerNotice && !caseWinnerNotice) || !soundEnabled) return;

    playApplauseBurst();
    winnerApplauseIntervalRef.current = window.setInterval(() => {
      playApplauseBurst();
    }, 950);

    return () => {
      if (winnerApplauseIntervalRef.current !== null) {
        window.clearInterval(winnerApplauseIntervalRef.current);
        winnerApplauseIntervalRef.current = null;
      }
    };
  }, [plinkoWinnerNotice, wheelWinnerNotice, caseWinnerNotice, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled) {
      stopWheelSpinAudio();
      stopCaseReelAudio();
    }

    return () => {
      stopWheelSpinAudio();
      stopCaseReelAudio();
    };
  }, [soundEnabled]);

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
    return () => { cancelled = true; };
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
          emailRedirectTo: "https://godchyna.com/wheel",
        },
      });

      if (error) setMessage(error.message);
      else {
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
    setShowAuth(false);
  }

  const activeUntil = account?.activeUntil ? new Date(account.activeUntil) : null;
  const hasActivePass = account?.role === "admin" || Boolean(activeUntil && activeUntil.getTime() > Date.now());

  async function openConfigurator() {
    if (!account || loadingAccount) return;

    setMonthlyGiveawayMode(false);
    setIsTestGiveaway(false);
    giveawayFinalizedRef.current = false;
    setWinnerGiveawayPrizeName("");
    setWinnerGiveawayPrizeImageUrl("");
    setWinnerGiveawayPrizeCleanupPath(null);

    if (ADMIN_ONLY_WHEEL && account.role !== "admin") {
      setMessage(pick(
        "A ferramenta ainda está em desenvolvimento e, por agora, só está disponível para admins.",
        "This tool is still in development and is currently available to admins only.",
      ));
      return;
    }

    if (account.role === "admin" || hasActivePass) {
      setConfiguring(true);
      return;
    }

    if (account.dayPasses > 0) {
      setBusy(true);
      const { data, error } = await supabase.rpc("activate_day_pass");
      setBusy(false);

      if (error || !data?.[0]) {
        setMessage(pick("Não foi possível ativar o Day Pass.", "Unable to activate the Day Pass."));
        return;
      }

      setAccount((current) => current ? {
        ...current,
        dayPasses: data[0].day_passes,
        activeUntil: data[0].active_until,
      } : current);
      setConfiguring(true);
      return;
    }

    setMessage(pick(
      "Precisas de um Day Pass ativo para configurar um sorteio.",
      "You need an active Day Pass to set up a giveaway.",
    ));
  }

  function stopMonthlyGiveawayAudio() {
    const track = monthlyAudioRef.current;
    if (track) {
      track.pause();
      track.currentTime = 0;
      monthlyAudioRef.current = null;
    }
    setMonthlyAudioMuted(false);
  }

  function toggleMonthlyGiveawayAudioMute() {
    const track = monthlyAudioRef.current;
    if (!track) return;

    const nextMuted = !track.muted;
    track.muted = nextMuted;
    setMonthlyAudioMuted(nextMuted);
  }

  function startMonthlyGiveawayAudio() {
    if (!soundEnabled || typeof Audio === "undefined") return;

    stopMonthlyGiveawayAudio();

    const track = new Audio(wheelAsset("audio/monthly-giveaway.mp3"));
    track.preload = "auto";
    track.volume = 0.38;
    track.muted = false;
    setMonthlyAudioMuted(false);
    monthlyAudioRef.current = track;

    void track.play().catch(() => {
      if (monthlyAudioRef.current === track) {
        monthlyAudioRef.current = null;
      }
    });
  }

  function openMonthlyGiveaway() {
    if (!account || loadingAccount || account.role !== "admin") return;

    setIsTestGiveaway(false);
    setConfiguring(false);
    setMonthlyKnifeRotation(45);
    setMonthlyWheelRotation(0);
    setMonthlySpinning(false);
    setMonthlyWinner(null);
    setMonthlyLaunching(false);
    setMonthlyKnifeDocked(false);
    setMonthlyKnifeFlightStyle(null);
    setParticipantMessage("");
    clearParticipants();
    setMonthlyGiveawayMode(true);
  }

  function closeMonthlyGiveaway() {
    if (monthlySpinning) return;
    stopMonthlyGiveawayAudio();
    setMonthlyGiveawayMode(false);
    setMonthlyWinner(null);
    setMonthlyKnifeRotation(45);
    setMonthlyWheelRotation(0);
    setMonthlyLaunching(false);
    setMonthlyKnifeDocked(false);
    setMonthlyKnifeFlightStyle(null);
  }

  function openTestConfigurator() {
    if (!account || loadingAccount || account.role !== "admin") return;

    setMonthlyGiveawayMode(false);
    setIsTestGiveaway(true);
    giveawayFinalizedRef.current = false;
    setWinnerGiveawayPrizeName("");
    setWinnerGiveawayPrizeImageUrl("");
    setWinnerGiveawayPrizeCleanupPath(null);
    setMessage("");
    setConfiguring(true);
  }

  function giveawayPrizeNumericValue() {
    const normalized = giveawayPrizeValue.trim().replace(",", ".");
    if (!normalized) return null;

    const value = Number(normalized);
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  async function saveGiveawayPrize() {
    if (!session?.user.id || giveawayPrizeSaving) return;

    const normalizedValue = giveawayPrizeValue.trim().replace(",", ".");
    if (normalizedValue && giveawayPrizeNumericValue() === null) {
      setGiveawayPrizeMessage(pick("Confirma o valor da skin.", "Check the skin value."));
      return;
    }

    setGiveawayPrizeSaving(true);
    setGiveawayPrizeMessage("");

    const { error } = await supabase
      .from("giveaway_prize_drafts")
      .upsert({
        user_id: session.user.id,
        skin_name: giveawayPrizeName.trim(),
        skin_value: giveawayPrizeNumericValue(),
        image_path: giveawayPrizeImagePath,
        is_saved: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    setGiveawayPrizeSaving(false);

    if (error) {
      setGiveawayPrizeMessage(pick("Não foi possível guardar o prémio.", "Unable to save the prize."));
      return;
    }

    giveawayFinalizedRef.current = false;
    setGiveawayPrizeMessage("");
    setGiveawayPrizeEditing(false);
  }

  async function uploadGiveawayPrizeImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !session?.user.id || giveawayPrizeSaving) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setGiveawayPrizeMessage(
        pick("Usa uma imagem PNG, JPG ou WebP.", "Use a PNG, JPG or WebP image."),
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setGiveawayPrizeMessage(
        pick("A imagem não pode ultrapassar 5 MB.", "The image cannot exceed 5 MB."),
      );
      return;
    }

    setGiveawayPrizeSaving(true);
    setGiveawayPrizeMessage("");

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const nextPath = `${session.user.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("giveaway-prizes")
      .upload(nextPath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setGiveawayPrizeSaving(false);
      setGiveawayPrizeMessage(
        pick("Não foi possível fazer upload da imagem.", "Unable to upload the image."),
      );
      return;
    }

    const { error: saveError } = await supabase
      .from("giveaway_prize_drafts")
      .upsert({
        user_id: session.user.id,
        skin_name: giveawayPrizeName.trim(),
        skin_value: giveawayPrizeNumericValue(),
        image_path: nextPath,
        is_saved: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (saveError) {
      await supabase.storage.from("giveaway-prizes").remove([nextPath]);
      setGiveawayPrizeSaving(false);
      setGiveawayPrizeMessage(
        pick("A imagem foi enviada, mas não foi possível guardá-la.", "The image uploaded, but could not be saved."),
      );
      return;
    }

    if (giveawayPrizeImagePath) {
      await supabase.storage.from("giveaway-prizes").remove([giveawayPrizeImagePath]);
    }

    const { data: publicData } = supabase.storage
      .from("giveaway-prizes")
      .getPublicUrl(nextPath);

    giveawayFinalizedRef.current = false;
    setGiveawayPrizeImagePath(nextPath);
    setGiveawayPrizeImageUrl(publicData.publicUrl);
    setGiveawayPrizeSaving(false);
    setGiveawayPrizeMessage(pick("Imagem carregada.", "Image uploaded."));
  }

  async function removeGiveawayPrize() {
    if (!session?.user.id || giveawayPrizeSaving) return;

    setGiveawayPrizeSaving(true);
    setGiveawayPrizeMessage("");

    if (giveawayPrizeImagePath) {
      await supabase.storage.from("giveaway-prizes").remove([giveawayPrizeImagePath]);
    }

    const { error } = await supabase
      .from("giveaway_prize_drafts")
      .delete()
      .eq("user_id", session.user.id);

    setGiveawayPrizeSaving(false);

    if (error) {
      setGiveawayPrizeMessage(pick("Não foi possível remover o prémio.", "Unable to remove the prize."));
      return;
    }

    setGiveawayPrizeName("");
    setGiveawayPrizeValue("");
    setGiveawayPrizeImagePath(null);
    setGiveawayPrizeImageUrl("");
    setGiveawayPrizeEditing(true);
    setGiveawayPrizeMessage(pick("Prémio removido.", "Prize removed."));
  }

  async function finalizeCurrentGiveaway(winnerName: string) {
    if (!session?.user.id || giveawayFinalizedRef.current) return;

    setWinnerGiveawayPrizeName(giveawayPrizeName.trim());
    setWinnerGiveawayPrizeImageUrl(giveawayPrizeImageUrl);
    winnerCelebrationVisibleRef.current = true;
    giveawayFinalizedRef.current = true;

    if (isTestGiveaway) {
      const cleanupPath = giveawayPrizeImagePath;

      const { error: testCleanupError } = await supabase
        .from("giveaway_prize_drafts")
        .delete()
        .eq("user_id", session.user.id);

      if (testCleanupError) {
        giveawayFinalizedRef.current = false;
        setGiveawayPrizeMessage(
          pick(
            "O teste terminou, mas não foi possível limpar o prémio.",
            "The test finished, but the prize could not be reset.",
          ),
        );
        return;
      }

      if (cleanupPath) {
        if (winnerCelebrationVisibleRef.current) {
          setWinnerGiveawayPrizeCleanupPath(cleanupPath);
        } else {
          await supabase.storage.from("giveaway-prizes").remove([cleanupPath]);
        }
      }

      setGiveawayPrizeName("");
      setGiveawayPrizeValue("");
      setGiveawayPrizeImagePath(null);
      setGiveawayPrizeImageUrl("");
      setGiveawayPrizeEditing(true);
      setGiveawayPrizeMessage("");
      return;
    }

    const { data, error } = await supabase.rpc("finalize_giveaway", {
      p_winner_name: winnerName,
    });

    if (error) {
      giveawayFinalizedRef.current = false;
      setGiveawayPrizeMessage(
        pick(
          "O vencedor foi definido, mas não foi possível guardar o histórico do giveaway.",
          "The winner was selected, but the giveaway history could not be saved.",
        ),
      );
      return;
    }

    const archivedImagePath =
      Array.isArray(data) && data.length > 0
        ? data[0]?.archived_image_path ?? null
        : null;
    const archivedSkinName =
      Array.isArray(data) && data.length > 0
        ? data[0]?.archived_skin_name ?? ""
        : "";

    if (archivedSkinName) {
      setWinnerGiveawayPrizeName(archivedSkinName);
    }

    void loadGiveawayHistory();

    if (archivedImagePath) {
      if (winnerCelebrationVisibleRef.current) {
        setWinnerGiveawayPrizeCleanupPath(archivedImagePath);
      } else {
        await supabase.storage
          .from("giveaway-prizes")
          .remove([archivedImagePath]);
      }
    }

    setGiveawayPrizeName("");
    setGiveawayPrizeValue("");
    setGiveawayPrizeImagePath(null);
    setGiveawayPrizeImageUrl("");
    setGiveawayPrizeEditing(true);
    setGiveawayPrizeMessage("");
  }

  function closeWinnerCelebration(source: "wheel" | "plinko" | "case") {
    winnerCelebrationVisibleRef.current = false;

    if (source === "wheel") {
      setWheelWinnerNotice(null);
    } else if (source === "plinko") {
      setPlinkoWinnerNotice(null);
    } else {
      setCaseWinnerNotice(null);
    }

    const cleanupPath = winnerGiveawayPrizeCleanupPath;

    setWinnerGiveawayPrizeName("");
    setWinnerGiveawayPrizeImageUrl("");
    setWinnerGiveawayPrizeCleanupPath(null);

    if (cleanupPath) {
      void supabase.storage
        .from("giveaway-prizes")
        .remove([cleanupPath]);
    }
  }

  function loadParticipants() {
    const { entries, cappedLines } = parseParticipantInput(participantInput);

    if (entries.length < 1) {
      setParticipantMessage(pick(
        "Adiciona pelo menos 1 entrada.",
        "Add at least 1 entry.",
      ));
      return;
    }

    setParticipants((current) =>
      spreadParticipantEntries([...current, ...entries]),
    );
    setParticipantInput("");
    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
    setEliminationNotice(null);
    setPendingTopFive(null);
    setTopFive(null);
    setShowTopFiveModal(false);
    setShowPlinko(false);
    setShowPlinkoTransition(false);
    setParticipantMessage(pick(
      `${entries.length} ${entries.length === 1 ? "entrada adicionada" : "entradas adicionadas"}.${cappedLines > 0 ? ` ${cappedLines} multiplicador${cappedLines === 1 ? "" : "es"} limitado${cappedLines === 1 ? "" : "s"} ao máximo de ${MAX_PARTICIPANT_MULTIPLIER}x.` : ""} As entradas foram misturadas automaticamente na roda.`,
      `${entries.length} ${entries.length === 1 ? "entry added" : "entries added"}.${cappedLines > 0 ? ` ${cappedLines} multiplier${cappedLines === 1 ? "" : "s"} capped at ${MAX_PARTICIPANT_MULTIPLIER}x.` : ""} Entries were automatically spread around the wheel.`,
    ));
  }

  function addQuickParticipant() {
    if (spinning || eliminationNotice || topFive || wheelWinnerNotice) return;

    const name = quickParticipantName.trim();
    const count = Math.max(
      1,
      Math.min(MAX_PARTICIPANT_MULTIPLIER, Math.floor(quickParticipantCount || 1)),
    );

    if (!name) {
      setParticipantMessage(pick(
        "Escreve o nome do viewer.",
        "Enter the viewer name.",
      ));
      return;
    }

    setParticipants((current) =>
      spreadParticipantEntries([
        ...current,
        ...Array.from({ length: count }, () => name),
      ]),
    );
    setQuickParticipantName("");
    setQuickParticipantCount(1);
    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
    setEliminationNotice(null);
    setPendingTopFive(null);
    setTopFive(null);
    setShowTopFiveModal(false);
    setShowPlinko(false);
    setShowPlinkoTransition(false);
    setParticipantMessage(pick(
      `${name} foi adicionado com ${count} ${count === 1 ? "entrada" : "entradas"}.`,
      `${name} was added with ${count} ${count === 1 ? "entry" : "entries"}.`,
    ));
  }

  function removeOneParticipantEntry(nameToRemove: string) {
    if (spinning || eliminationNotice || topFive || wheelWinnerNotice) return;

    const normalized = nameToRemove.trim().toLocaleLowerCase();

    setParticipants((current) => {
      const indexToRemove = current.findIndex(
        (name) => name.trim().toLocaleLowerCase() === normalized,
      );

      if (indexToRemove < 0) return current;

      return current.filter((_, index) => index !== indexToRemove);
    });

    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
  }

  function removeAllParticipantEntries(nameToRemove: string) {
    if (spinning || eliminationNotice || topFive || wheelWinnerNotice) return;

    const normalized = nameToRemove.trim().toLocaleLowerCase();

    setParticipants((current) =>
      current.filter(
        (name) => name.trim().toLocaleLowerCase() !== normalized,
      ),
    );

    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
  }

  function clearParticipants() {
    if (spinning) return;
    setParticipantInput("");
    setQuickParticipantName("");
    setQuickParticipantCount(1);
    setParticipantSearch("");
    setAutoSpin(false);
    setWheelMode(null);
    setQualifiedParticipants([]);
    setQualifiedEntryCounts({});
    setShowQualificationIntro(false);
    setQualificationIntroSeen(false);
    setQualificationStartIntent(null);
    setParticipants([]);
    setParticipantMessage("");
    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
    setEliminationNotice(null);
    setPendingTopFive(null);
    setTopFive(null);
    setShowTopFiveModal(false);
    setShowPlinko(false);
    setShowPlinkoTransition(false);
    setShowCaseMode(false);
    setShowCaseTransition(false);
    setCaseRound(1);
    setCasePlayerIndex(0);
    setCaseRoundOrder([]);
    setCaseOpenings([]);
    setCaseRolling(false);
    setCaseReel([]);
    setCaseReelRun(false);
    setCaseStopOffset(0);
    setCaseLastOpening(null);
    setCaseWinnerNotice(null);
    setCaseTiebreakPlayers([]);
    setCaseRoundIntroVisible(false);
    setCaseAutoOpenPending(false);
    setRotation(0);
  }

  function removeParticipant(indexToRemove: number) {
    if (spinning || eliminationNotice || topFive) return;

    setParticipants((current) => current.filter((_, index) => index !== indexToRemove));
    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
  }

  function getAudioContext() {
    if (!soundEnabled || typeof window === "undefined") return null;

    let context = audioContextRef.current;

    if (!context) {
      context = new AudioContext();
      audioContextRef.current = context;
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    return context;
  }

  function playWheelPlim() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const master = context.createGain();
    const bell = context.createOscillator();
    const shimmer = context.createOscillator();
    const shimmerGain = context.createGain();

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.075, now + 0.008);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    shimmerGain.gain.setValueAtTime(0.0001, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.025, now + 0.006);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    bell.type = "sine";
    bell.frequency.setValueAtTime(880, now);
    bell.frequency.exponentialRampToValueAtTime(1320, now + 0.055);

    shimmer.type = "sine";
    shimmer.frequency.setValueAtTime(1760, now);

    bell.connect(master);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(master);
    master.connect(context.destination);

    bell.start(now);
    shimmer.start(now);
    bell.stop(now + 0.44);
    shimmer.stop(now + 0.30);
  }

  function playPegPlim() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    const ping = context.createOscillator();
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    const baseFrequency = 1850 + (Math.random() - 0.5) * 360;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.075, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.022, now + 0.002);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    ping.type = "sine";
    ping.frequency.setValueAtTime(baseFrequency, now);
    ping.frequency.exponentialRampToValueAtTime(baseFrequency * 0.88, now + 0.07);

    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(baseFrequency * 1.72, now);

    ping.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(context.destination);

    ping.start(now);
    overtone.start(now);
    ping.stop(now + 0.08);
    overtone.stop(now + 0.05);
  }

  function playWheelDividerTick(colorIndex: number) {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    const click = context.createOscillator();
    const pitches = [560, 690, 820, 640];
    const frequency = pitches[colorIndex % pitches.length];

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.042, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    click.type = colorIndex % 2 === 0 ? "square" : "triangle";
    click.frequency.setValueAtTime(frequency, now);
    click.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.05);

    click.connect(gain);
    gain.connect(context.destination);

    click.start(now);
    click.stop(now + 0.06);
  }

  function playCaseReelTick() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    const click = context.createOscillator();
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.048, now + 0.0015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    overtoneGain.gain.setValueAtTime(0.0001, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.014, now + 0.001);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032);

    click.type = "square";
    click.frequency.setValueAtTime(1180, now);
    click.frequency.exponentialRampToValueAtTime(920, now + 0.04);

    overtone.type = "sine";
    overtone.frequency.setValueAtTime(2360, now);

    click.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(context.destination);

    click.start(now);
    overtone.start(now);
    click.stop(now + 0.05);
    overtone.stop(now + 0.035);
  }

  function stopCaseReelAudio() {
    if (caseReelAnimationRef.current !== null) {
      window.cancelAnimationFrame(caseReelAnimationRef.current);
      caseReelAnimationRef.current = null;
    }

    caseLastTickIndexRef.current = null;
  }

  function startCaseReelAudio() {
    stopCaseReelAudio();

    const windowElement = caseReelWindowRef.current;
    if (!windowElement || !soundEnabled) return;

    caseLastTickIndexRef.current = null;
    caseLastTickSoundRef.current = 0;

    const sampleReel = () => {
      const reelWindow = caseReelWindowRef.current;
      if (!reelWindow) {
        stopCaseReelAudio();
        return;
      }

      const windowRect = reelWindow.getBoundingClientRect();
      const cursorX = windowRect.left + windowRect.width / 2;
      const items = Array.from(
        reelWindow.querySelectorAll<HTMLElement>(".case-reel-item"),
      );
      const activeIndex = items.findIndex((item) => {
        const rect = item.getBoundingClientRect();
        return cursorX >= rect.left && cursorX <= rect.right;
      });

      if (
        activeIndex >= 0 &&
        activeIndex !== caseLastTickIndexRef.current &&
        performance.now() - caseLastTickSoundRef.current > 24
      ) {
        caseLastTickIndexRef.current = activeIndex;
        caseLastTickSoundRef.current = performance.now();
        playCaseReelTick();
      }

      caseReelAnimationRef.current = window.requestAnimationFrame(sampleReel);
    };

    caseReelAnimationRef.current = window.requestAnimationFrame(sampleReel);
  }

  function stopWheelSpinAudio() {
    if (wheelSpinAnimationRef.current !== null) {
      window.cancelAnimationFrame(wheelSpinAnimationRef.current);
      wheelSpinAnimationRef.current = null;
    }

    wheelLastSectorRef.current = null;
  }

  function startWheelSpinAudio(entryCount: number) {
    stopWheelSpinAudio();

    const rotor = wheelRotorRef.current;
    if (!rotor || entryCount <= 0 || !soundEnabled) return;

    wheelLastSectorRef.current = null;
    wheelLastDividerSoundRef.current = performance.now();

    const sectorSize = 360 / entryCount;

    const sampleWheel = () => {
      const element = wheelRotorRef.current;
      if (!element || wheelSpinAnimationRef.current === null) return;

      const transform = window.getComputedStyle(element).transform;
      if (transform && transform !== "none") {
        try {
          const matrix = new DOMMatrixReadOnly(transform);
          let angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
          angle = ((angle % 360) + 360) % 360;

          const pointerAngle = (360 - angle) % 360;
          const sector = Math.floor(pointerAngle / sectorSize) % entryCount;
          const lastSector = wheelLastSectorRef.current;
          const timestamp = performance.now();

          if (
            lastSector !== null &&
            sector !== lastSector &&
            timestamp - wheelLastDividerSoundRef.current > 42
          ) {
            playWheelDividerTick(sector % WHEEL_COLORS.length);
            wheelLastDividerSoundRef.current = timestamp;
          }

          wheelLastSectorRef.current = sector;
        } catch {
          // Ignore transient transform parsing errors while the browser updates CSS.
        }
      }

      wheelSpinAnimationRef.current = window.requestAnimationFrame(sampleWheel);
    };

    wheelSpinAnimationRef.current = window.requestAnimationFrame(sampleWheel);
  }

  function playEliminatedSound() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    const low = context.createOscillator();
    const wobble = context.createOscillator();
    const wobbleGain = context.createGain();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.085, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

    low.type = "sawtooth";
    low.frequency.setValueAtTime(210, now);
    low.frequency.exponentialRampToValueAtTime(72, now + 0.50);

    wobble.type = "square";
    wobble.frequency.setValueAtTime(155, now);
    wobble.frequency.exponentialRampToValueAtTime(92, now + 0.34);
    wobbleGain.gain.setValueAtTime(0.028, now);
    wobbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.40);

    low.connect(gain);
    wobble.connect(wobbleGain);
    wobbleGain.connect(gain);
    gain.connect(context.destination);

    low.start(now);
    wobble.start(now + 0.035);
    low.stop(now + 0.60);
    wobble.stop(now + 0.43);
  }

  function playStillAlivePlim() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const gain = context.createGain();
    const first = context.createOscillator();
    const second = context.createOscillator();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.065, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    first.type = "sine";
    first.frequency.setValueAtTime(740, now);
    first.frequency.exponentialRampToValueAtTime(940, now + 0.10);

    second.type = "sine";
    second.frequency.setValueAtTime(1110, now + 0.10);
    second.frequency.exponentialRampToValueAtTime(1480, now + 0.18);

    first.connect(gain);
    second.connect(gain);
    gain.connect(context.destination);

    first.start(now);
    first.stop(now + 0.20);
    second.start(now + 0.09);
    second.stop(now + 0.32);
  }

  function playLandingBoom() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const master = context.createGain();
    const body = context.createOscillator();
    const punch = context.createOscillator();
    const punchGain = context.createGain();
    const noiseGain = context.createGain();
    const noiseFilter = context.createBiquadFilter();

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.250, now + 0.004);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    body.type = "sine";
    body.frequency.setValueAtTime(125, now);
    body.frequency.exponentialRampToValueAtTime(36, now + 0.42);

    punchGain.gain.setValueAtTime(0.120, now);
    punchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.115);
    punch.type = "triangle";
    punch.frequency.setValueAtTime(260, now);
    punch.frequency.exponentialRampToValueAtTime(58, now + 0.11);

    const noiseBuffer = context.createBuffer(
      1,
      Math.max(1, Math.floor(context.sampleRate * 0.22)),
      context.sampleRate,
    );
    const noiseData = noiseBuffer.getChannelData(0);

    for (let index = 0; index < noiseData.length; index += 1) {
      const envelope = 1 - index / noiseData.length;
      noiseData[index] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;

    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(720, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(150, now + 0.20);
    noiseFilter.Q.setValueAtTime(0.7, now);

    noiseGain.gain.setValueAtTime(0.095, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);

    body.connect(master);
    punch.connect(punchGain);
    punchGain.connect(master);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    master.connect(context.destination);

    body.start(now);
    punch.start(now);
    noise.start(now);

    body.stop(now + 0.50);
    punch.stop(now + 0.12);
    noise.stop(now + 0.22);
  }

  function playApplauseBurst() {
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const clapCount = 13;

    for (let clapIndex = 0; clapIndex < clapCount; clapIndex += 1) {
      const startAt =
        now +
        clapIndex * 0.072 +
        Math.random() * 0.075;

      const duration = 0.085 + Math.random() * 0.04;
      const frameCount = Math.max(
        1,
        Math.floor(context.sampleRate * duration),
      );
      const buffer = context.createBuffer(1, frameCount, context.sampleRate);
      const samples = buffer.getChannelData(0);

      for (let sampleIndex = 0; sampleIndex < samples.length; sampleIndex += 1) {
        const time = sampleIndex / context.sampleRate;
        const mainDecay = Math.exp(-time * 34);
        const slapOne = Math.exp(-Math.pow((time - 0.014) / 0.006, 2));
        const slapTwo = Math.exp(-Math.pow((time - 0.032) / 0.008, 2));
        const envelope = Math.min(
          1,
          mainDecay * 0.72 + slapOne * 0.55 + slapTwo * 0.34,
        );

        samples[sampleIndex] =
          (Math.random() * 2 - 1) *
          envelope *
          (0.78 + Math.random() * 0.22);
      }

      const source = context.createBufferSource();
      const highpass = context.createBiquadFilter();
      const presence = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = context.createStereoPanner();

      source.buffer = buffer;

      highpass.type = "highpass";
      highpass.frequency.setValueAtTime(620 + Math.random() * 180, startAt);

      presence.type = "peaking";
      presence.frequency.setValueAtTime(1750 + Math.random() * 950, startAt);
      presence.Q.setValueAtTime(0.9, startAt);
      presence.gain.setValueAtTime(5 + Math.random() * 3, startAt);

      panner.pan.setValueAtTime((Math.random() - 0.5) * 1.15, startAt);

      const peak = 0.042 + Math.random() * 0.026;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.003);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + duration,
      );

      source.connect(highpass);
      highpass.connect(presence);
      presence.connect(gain);
      gain.connect(panner);
      panner.connect(context.destination);

      source.start(startAt);
      source.stop(startAt + duration + 0.012);
    }
  }

  function toggleSound() {
    setSoundEnabled((current) => {
      const next = !current;

      try {
        window.localStorage.setItem("godchyna-sound", next ? "on" : "off");
      } catch {
        // Sound preference can still live in state if storage is unavailable.
      }

      return next;
    });
  }

  function startPlinkoTransition() {
    setShowTopFiveModal(false);
    setShowPlinkoTransition(true);

    window.setTimeout(() => {
      setShowPlinko(true);
    }, 2600);

    window.setTimeout(() => {
      setShowPlinkoTransition(false);
    }, 5000);
  }

  function startCaseTransition() {
    setShowTopFiveModal(false);
    setShowCaseTransition(true);
    setCaseRound(1);
    setCasePlayerIndex(0);
    setCaseRoundOrder(topFive ? [...topFive] : []);
    setCaseOpenings([]);
    setCaseLastOpening(null);
    setCaseWinnerNotice(null);
    setCaseTiebreakPlayers([]);
    setCaseRoundIntroVisible(true);
    setCaseReel([]);
    setCaseReelRun(false);
    setCaseStopOffset(0);

    window.setTimeout(() => {
      setShowCaseMode(true);
    }, 1500);

    window.setTimeout(() => {
      setShowCaseTransition(false);
    }, 3000);
  }

  function startFinalModeTransition() {
    if (wheelMode === "qualification") {
      startCaseTransition();
      return;
    }

    startPlinkoTransition();
  }

  function caseEntryCount(playerName: string) {
    return qualifiedEntryCounts[playerName.trim().toLocaleLowerCase()] ?? 1;
  }

  function casePlayerTotal(playerName: string) {
    return caseOpenings
      .filter((opening) => opening.playerName === playerName)
      .reduce((total, opening) => total + opening.skin.valueEur, 0);
  }

  function buildCaseReel(round: CaseRound, winningSkin: PlinkoResult) {
    const fillerCount = 24;
    const reel = Array.from({ length: fillerCount }, () =>
      round.skins[randomParticipantIndex(round.skins.length)],
    );
    reel.push(winningSkin);
    reel.push(
      round.skins[randomParticipantIndex(round.skins.length)],
      round.skins[randomParticipantIndex(round.skins.length)],
    );
    return reel;
  }

  function openCurrentCase(ignoreRoundIntro = false) {
    if (
      !topFive ||
      caseRolling ||
      caseWinnerNotice ||
      (!ignoreRoundIntro && caseRoundIntroVisible)
    ) return;

    const leaderboardOrder = caseRoundOrder.length ? caseRoundOrder : topFive;
    const activePlayers = caseTiebreakPlayers.length
      ? caseTiebreakPlayers
      : caseRound === CASE_ROUNDS.length
        ? [...leaderboardOrder].reverse()
        : leaderboardOrder;
    const playerName = activePlayers[casePlayerIndex];
    const round = CASE_ROUNDS[caseRound - 1];
    if (!playerName || !round) return;

    const entries = caseEntryCount(playerName);
    const winningSkin = pickCaseSkin(round.skins, entries);
    const opening: CaseOpening = {
      round: caseRound,
      playerName,
      entries,
      skin: winningSkin,
    };

    setCaseRolling(true);
    setCaseLastOpening(null);
    setCaseStopOffset(randomParticipantIndex(105) - 52);
    setCaseReel(buildCaseReel(round, winningSkin));
    setCaseReelRun(false);

    window.setTimeout(() => {
      setCaseReelRun(true);
      window.requestAnimationFrame(() => {
        startCaseReelAudio();
      });
    }, 60);

    window.setTimeout(() => {
      stopCaseReelAudio();
      setCaseOpenings((current) => [...current, opening]);
      setCaseLastOpening(opening);
      setCaseRolling(false);
    }, 5050);
  }

  function continueCaseMode() {
    if (!topFive || caseRolling || !caseLastOpening) return;

    const leaderboardOrder = caseRoundOrder.length ? caseRoundOrder : topFive;
    const activePlayers = caseTiebreakPlayers.length
      ? caseTiebreakPlayers
      : caseRound === CASE_ROUNDS.length
        ? [...leaderboardOrder].reverse()
        : leaderboardOrder;

    if (casePlayerIndex < activePlayers.length - 1) {
      setCasePlayerIndex((index) => index + 1);
      setCaseLastOpening(null);
      setCaseReelRun(false);
      setCaseStopOffset(0);
      setCaseAutoOpenPending(true);
      return;
    }

    if (!caseTiebreakPlayers.length && caseRound < CASE_ROUNDS.length) {
      const rankedPlayers = [...topFive].sort((a, b) => {
        const totalDifference = casePlayerTotal(b) - casePlayerTotal(a);
        if (totalDifference !== 0) return totalDifference;
        return topFive.indexOf(a) - topFive.indexOf(b);
      });

      setCaseRound((round) => round + 1);
      setCasePlayerIndex(0);
      setCaseRoundOrder(rankedPlayers);
      setCaseLastOpening(null);
      setCaseReel([]);
      setCaseReelRun(false);
      setCaseStopOffset(0);
      setCaseRoundIntroVisible(true);
      return;
    }

    const totals = topFive.map((name) => ({
      name,
      total: caseOpenings
        .filter((opening) => opening.playerName === name)
        .reduce((sum, opening) => sum + opening.skin.valueEur, 0),
    }));
    const maxTotal = Math.max(...totals.map((entry) => entry.total));
    const winners = totals.filter((entry) => entry.total === maxTotal);

    if (winners.length !== 1) {
      setCaseTiebreakPlayers(winners.map((entry) => entry.name));
      setCaseRound(CASE_ROUNDS.length);
      setCasePlayerIndex(0);
      setCaseLastOpening(null);
      setCaseReel([]);
      setCaseReelRun(false);
      setCaseStopOffset(0);
      setCaseRoundIntroVisible(true);
      return;
    }

    setCaseTiebreakPlayers([]);
    setCaseWinnerNotice(winners[0].name);
    void finalizeCurrentGiveaway(winners[0].name);
  }

  useEffect(() => {
    if (
      !caseAutoOpenPending ||
      caseRolling ||
      caseRoundIntroVisible ||
      !topFive ||
      caseWinnerNotice
    ) {
      return;
    }

    setCaseAutoOpenPending(false);

    const frame = window.requestAnimationFrame(() => {
      openCurrentCase();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    caseAutoOpenPending,
    caseRolling,
    caseRoundIntroVisible,
    casePlayerIndex,
    caseRound,
    caseTiebreakPlayers,
    topFive,
    caseWinnerNotice,
  ]);

  function startPlinkoDrop() {
    if (!topFive || !plinkoPlayers.length || plinkoDropping || plinkoRewardNotice || plinkoEliminationNotice || plinkoTieNotice || plinkoWinnerNotice) return;

    const resolvingTiebreak =
      Boolean(plinkoTiebreakIndexes && plinkoTiebreakIndexes.length > 0);

    const activeIndexes = resolvingTiebreak
      ? plinkoTiebreakIndexes!
      : plinkoPlayers.map((_, index) => index);

    const activeDropSlots = resolvingTiebreak
      ? plinkoTiebreakDropSlots
      : plinkoDropSlots;

    const playerIndex = activeIndexes.find(
      (index) => activeDropSlots[index] === undefined,
    );
    if (playerIndex === undefined) return;

    const c4 = plinkoC4Ref.current;
    const board = plinkoBoardRef.current;
    if (!c4 || !board) return;

    // The outcome remains perfectly uniform: every slot is 1 / 9.
    const slotIndex = randomParticipantIndex(activePlinkoSkins.length);
    const slot = board.querySelector<HTMLElement>(`[data-plinko-slot="${slotIndex}"]`);
    if (!slot) return;

    if (plinkoAnimationRef.current !== null) {
      window.cancelAnimationFrame(plinkoAnimationRef.current);
      plinkoAnimationRef.current = null;
    }

    setPlinkoDropping(true);
    setPlinkoHitPegs([]);
    setPlinkoLandedSlot(null);
    setPlinkoExplosionSlot(null);

    c4.getAnimations().forEach((animation) => animation.cancel());
    c4.style.transform = "translate(0px, 0px) rotate(-3deg)";

    const boardRect = board.getBoundingClientRect();
    const c4Rect = c4.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();

    const originX = c4Rect.left + c4Rect.width / 2 - boardRect.left;
    const originY = c4Rect.top + c4Rect.height / 2 - boardRect.top;

    const targetX = slotRect.left + slotRect.width / 2 - boardRect.left;
    const slotTopY = slotRect.top - boardRect.top;
    const targetY = slotRect.top + slotRect.height * 0.33 - boardRect.top;

    const slotBodies = Array.from(
      board.querySelectorAll<HTMLElement>("[data-plinko-slot]"),
    ).map((slotElement, index) => {
      const rect = slotElement.getBoundingClientRect();
      return {
        index,
        left: rect.left - boardRect.left,
        right: rect.right - boardRect.left,
        centerX: rect.left + rect.width / 2 - boardRect.left,
      };
    });

    const ballRadius = Math.min(c4Rect.width, c4Rect.height) * 0.30;

    const pegBodies = Array.from(
      board.querySelectorAll<HTMLElement>("[data-plinko-peg]"),
    ).map((peg) => {
      const rect = peg.getBoundingClientRect();
      const row = peg.parentElement?.dataset.plinkoRow ?? "0";
      const index = peg.dataset.plinkoPeg ?? "0";

      return {
        key: `${row}-${index}`,
        x: rect.left + rect.width / 2 - boardRect.left,
        y: rect.top + rect.height / 2 - boardRect.top,
        radius: rect.width / 2,
      };
    });

    const pegXs = pegBodies.map((peg) => peg.x);
    const fieldLeft = Math.max(18, Math.min(...pegXs) - 44);
    const fieldRight = Math.min(boardRect.width - 18, Math.max(...pegXs) + 44);

    let x = originX;
    let y = originY;

    // Start with a natural throw. The selected slot only influences the very
    // top of the board, then the final rows are entirely physics-driven.
    let vx = (targetX - originX) * 0.13 + (Math.random() - 0.5) * 26;
    let vy = 14;
    let angle = -8 + (Math.random() - 0.5) * 12;
    let angularVelocity = (Math.random() - 0.5) * 95;

    const gravity = 270;
    const restitution = 0.62;
    const tangentRetention = 0.988;
    const hitCooldowns = new Map<string, number>();

    let lastTimestamp = performance.now();
    let accumulator = 0;
    const fixedStep = 1 / 120;
    let finished = false;

    const renderC4 = () => {
      const translateX = x - originX;
      const translateY = y - originY;
      c4.style.transform =
        `translate(${translateX}px, ${translateY}px) rotate(${angle}deg)`;
    };

    const registerHit = (key: string) => {
      const now = performance.now();
      const lastHit = hitCooldowns.get(key) ?? -Infinity;
      if (now - lastHit < 150) return;

      hitCooldowns.set(key, now);
      playPegPlim();

      setPlinkoHitPegs((current) =>
        current.includes(key) ? current : [...current, key],
      );

      window.setTimeout(() => {
        setPlinkoHitPegs((current) => current.filter((item) => item !== key));
      }, 210);
    };

    const finishDrop = () => {
      if (finished) return;
      finished = true;

      const actualSlot =
        slotBodies.find((candidate) => x >= candidate.left && x <= candidate.right) ??
        slotBodies.reduce((closest, candidate) =>
          Math.abs(candidate.centerX - x) < Math.abs(closest.centerX - x)
            ? candidate
            : closest,
        );

      const landedSlotIndex = actualSlot.index;

      // No horizontal snap: keep the exact X produced by the physics.
      y = targetY;
      angle += angularVelocity * 0.018;
      renderC4();

      const landedReward = activePlinkoSkins[landedSlotIndex];

      setPlinkoLandedSlot(landedSlotIndex);
      setPlinkoExplosionSlot(landedSlotIndex);
      playLandingBoom();

      if (resolvingTiebreak) {
        setPlinkoTiebreakDropSlots((current) => ({
          ...current,
          [playerIndex]: landedSlotIndex,
        }));
        setPlinkoTiebreakResults((current) => ({
          ...current,
          [playerIndex]: landedReward,
        }));
      } else {
        setPlinkoDropSlots((current) => ({
          ...current,
          [playerIndex]: landedSlotIndex,
        }));
        setPlinkoResults((current) => ({
          ...current,
          [playerIndex]: landedReward,
        }));
      }

      window.setTimeout(() => {
        setPlinkoExplosionSlot(null);
        setPlinkoRewardNotice({
          playerName: plinkoPlayers[playerIndex],
          reward: landedReward,
        });
        setPlinkoDropping(false);
      }, 520);
    };

    const simulateStep = (dt: number) => {
      // Gravity is continuous; there are no scripted peg-to-peg waypoints.
      vy += gravity * dt;

      // Very light air resistance keeps the C4 from becoming unrealistically fast.
      const air = Math.pow(0.995, dt * 60);
      vx *= air;
      vy *= Math.pow(0.999, dt * 60);
      angularVelocity *= Math.pow(0.996, dt * 60);

      // Any distribution correction happens high in the board and fades out
      // completely before the last rows. The final section is pure physics.
      const distanceToTarget = targetX - x;
      const verticalProgress = Math.max(
        0,
        Math.min(1, (y - originY) / Math.max(1, slotTopY - originY)),
      );

      const guideCutoff = 0.42;
      if (verticalProgress < guideCutoff) {
        const normalized = verticalProgress / guideCutoff;
        const guideEnvelope = Math.sin(normalized * Math.PI);
        const desiredVx = Math.max(-72, Math.min(72, distanceToTarget * 0.18));
        const steering = Math.min(1, dt * 0.62) * guideEnvelope;
        vx += (desiredVx - vx) * steering;
      }

      x += vx * dt;
      y += vy * dt;
      angle += angularVelocity * dt;

      // Soft side walls.
      if (x - ballRadius < fieldLeft) {
        x = fieldLeft + ballRadius;
        if (vx < 0) vx = -vx * 0.58;
        angularVelocity += 24;
      } else if (x + ballRadius > fieldRight) {
        x = fieldRight - ballRadius;
        if (vx > 0) vx = -vx * 0.58;
        angularVelocity -= 24;
      }

      // Resolve every real collision. A frame can hit any peg(s); there is no "one peg per row".
      for (const peg of pegBodies) {
        const dx = x - peg.x;
        const dy = y - peg.y;
        const minDistance = ballRadius + peg.radius;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared >= minDistance * minDistance) continue;

        const distance = Math.sqrt(Math.max(distanceSquared, 0.0001));
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minDistance - distance;

        // Push the C4 out of the peg so it can never travel through its centre.
        x += nx * (overlap + 0.35);
        y += ny * (overlap + 0.35);

        const normalVelocity = vx * nx + vy * ny;

        if (normalVelocity < 0) {
          const tx = -ny;
          const ty = nx;
          const tangentVelocity = vx * tx + vy * ty;

          const bouncedNormal = -normalVelocity * restitution;
          const keptTangent = tangentVelocity * tangentRetention;

          vx = nx * bouncedNormal + tx * keptTangent;
          vy = ny * bouncedNormal + ty * keptTangent;

          // Imperfect contact keeps the C4 from looking magnetised to a peg.
          const sideKick = (Math.random() - 0.5) * 14;
          vx += tx * sideKick + (Math.random() - 0.5) * 5;
          vy += ty * sideKick * 0.18;

          // The rectangular prop should visibly tumble after each impact.
          angularVelocity +=
            tangentVelocity * 0.58 +
            normalVelocity * -0.16 +
            (Math.random() - 0.5) * 72;

          registerHit(peg.key);
        }
      }

      // From the last rows onwards there is no steering at all.
      if (y >= targetY) {
        finishDrop();
      }
    };

    const frame = (timestamp: number) => {
      if (finished) return;

      const frameSeconds = Math.min(0.035, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      accumulator += frameSeconds;

      while (accumulator >= fixedStep && !finished) {
        simulateStep(fixedStep);
        accumulator -= fixedStep;
      }

      renderC4();

      if (!finished) {
        plinkoAnimationRef.current = window.requestAnimationFrame(frame);
      } else {
        plinkoAnimationRef.current = null;
      }
    };

    plinkoAnimationRef.current = window.requestAnimationFrame(frame);
  }

  function playPreviewPlim() {
    if (typeof window === "undefined") return;

    let context = audioContextRef.current;

    if (!context) {
      context = new AudioContext();
      audioContextRef.current = context;
    }

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const gain = context.createGain();
    const bell = context.createOscillator();

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    bell.type = "sine";
    bell.frequency.setValueAtTime(920, now);
    bell.frequency.exponentialRampToValueAtTime(1380, now + 0.05);

    bell.connect(gain);
    gain.connect(context.destination);

    bell.start(now);
    bell.stop(now + 0.36);
  }

  function spinPreviewWheel() {
    if (previewSpinning || previewNames.length === 0) return;

    playPreviewPlim();

    const selectedIndex = randomParticipantIndex(previewNames.length);
    const step = 360 / previewNames.length;
    const selectedCenter = selectedIndex * step + step / 2;
    const targetAngle = (360 - (selectedCenter % 360)) % 360;

    setPreviewSpinning(true);
    setPreviewRotation((currentRotation) => {
      const currentAngle = ((currentRotation % 360) + 360) % 360;
      const alignment = (targetAngle - currentAngle + 360) % 360;
      return currentRotation + 5 * 360 + alignment;
    });
  }

  const qualificationModeActive =
    wheelMode === "qualification" ||
    (wheelMode === null && shouldUseDirectTopFive(participants));

  useEffect(() => {
    if (wheelMode !== null || shouldUseDirectTopFive(participants)) return;

    setShowQualificationIntro(false);
    setQualificationIntroSeen(false);
    setQualificationStartIntent(null);
  }, [participants, wheelMode]);

  function requestManualSpin() {
    if (qualificationModeActive && !qualificationIntroSeen) {
      setQualificationStartIntent("manual");
      setShowQualificationIntro(true);
      return;
    }

    spinWheel();
  }

  function requestAutoSpinToggle() {
    if (autoSpin) {
      setAutoSpin(false);
      return;
    }

    if (qualificationModeActive && !qualificationIntroSeen) {
      setQualificationStartIntent("auto");
      setShowQualificationIntro(true);
      return;
    }

    setAutoSpin(true);
  }

  function startQualificationMode() {
    const intent = qualificationStartIntent ?? "manual";

    setQualificationIntroSeen(true);
    setShowQualificationIntro(false);
    setQualificationStartIntent(null);

    if (wheelMode === null) {
      setWheelMode("qualification");
      setQualifiedParticipants([]);
    }

    if (intent === "auto") {
      setAutoSpin(true);
      return;
    }

    window.setTimeout(() => {
      spinWheelRef.current();
    }, 80);
  }

  function spinWheel() {
    const activeMode =
      wheelMode ??
      (shouldUseDirectTopFive(participants) ? "qualification" : "elimination");
    const qualifyingDirectly = activeMode === "qualification";

    if (
      spinning ||
      eliminationNotice ||
      topFive ||
      wheelWinnerNotice ||
      participants.length < 1 ||
      (!qualifyingDirectly && participants.length <= 1)
    ) return;

    if (wheelMode === null) {
      setWheelMode(activeMode);
      if (qualifyingDirectly) setQualifiedParticipants([]);
    }

    if (!qualifyingDirectly && participants.length === 5) {
      setAutoSpin(false);
      setTopFive(participants.slice(0, 5));
      setShowTopFiveModal(true);
      return;
    }

    playWheelPlim();

    const winnerIndex = randomParticipantIndex(participants.length);
    const selectedName = participants[winnerIndex];
    const step = 360 / participants.length;
    const selectedCenter = winnerIndex * step + step / 2;
    const targetAngle = (360 - (selectedCenter % 360)) % 360;

    setWinner(null);
    setPendingWinner(selectedName);
    setPendingWinnerIndex(winnerIndex);
    setSpinning(true);
    startWheelSpinAudio(
      participants.length > DIRECT_TOP_FIVE_THRESHOLD
        ? LARGE_WHEEL_VISUAL_SEGMENTS
        : participants.length,
    );

    setRotation((currentRotation) => {
      const currentAngle = ((currentRotation % 360) + 360) % 360;
      const alignment = (targetAngle - currentAngle + 360) % 360;
      return currentRotation + 6 * 360 + alignment;
    });
  }

  spinWheelRef.current = spinWheel;

  useEffect(() => {
    if (
      !configuring ||
      !autoSpin ||
      showQualificationIntro ||
      topFive ||
      wheelWinnerNotice ||
      showTopFiveModal ||
      showPlinko
    ) return;

    if (eliminationNotice) {
      const timeout = window.setTimeout(() => {
        setEliminationNotice(null);

        if (pendingTopFive) {
          setAutoSpin(false);
          setTopFive(pendingTopFive);
          setPendingTopFive(null);
          setShowTopFiveModal(true);
        }
      }, 1500);

      return () => window.clearTimeout(timeout);
    }

    const canSpinAgain =
      qualificationModeActive ? participants.length > 0 : participants.length > 1;

    if (!spinning && pendingWinner === null && canSpinAgain) {
      const timeout = window.setTimeout(() => {
        spinWheelRef.current();
      }, 180);

      return () => window.clearTimeout(timeout);
    }
  }, [
    autoSpin,
    configuring,
    eliminationNotice,
    pendingTopFive,
    pendingWinner,
    participants.length,
    qualificationModeActive,
    showQualificationIntro,
    spinning,
    topFive,
    wheelWinnerNotice,
    showTopFiveModal,
    showPlinko,
  ]);

  const draftCount = useMemo(
    () => parseParticipantInput(participantInput).entries.length,
    [participantInput],
  );

  const groupedParticipants = useMemo(() => {
    const grouped = new Map<string, { name: string; count: number }>();

    participants.forEach((name) => {
      const normalized = name.trim().toLocaleLowerCase();
      const current = grouped.get(normalized);

      if (current) {
        current.count += 1;
      } else {
        grouped.set(normalized, { name, count: 1 });
      }
    });

    return Array.from(grouped.values());
  }, [participants]);

  const filteredGroupedParticipants = useMemo(() => {
    const query = participantSearch.trim().toLocaleLowerCase();
    if (!query) return groupedParticipants;

    return groupedParticipants.filter((participant) =>
      participant.name.trim().toLocaleLowerCase().includes(query),
    );
  }, [groupedParticipants, participantSearch]);

  const largeWheelVisual = participants.length > DIRECT_TOP_FIVE_THRESHOLD;
  const displayedGroupedParticipants = useMemo(
    () => filteredGroupedParticipants.slice(0, LARGE_WHEEL_LIST_LIMIT),
    [filteredGroupedParticipants],
  );
  const hiddenGroupedParticipantCount = Math.max(
    0,
    filteredGroupedParticipants.length - displayedGroupedParticipants.length,
  );
  const visualWheelSegmentCount = largeWheelVisual
    ? LARGE_WHEEL_VISUAL_SEGMENTS
    : participants.length;

  const largeWheelNameEntries = useMemo(() => {
    if (!largeWheelVisual || participants.length === 0) return [];

    const targetCount = Math.min(
      LARGE_WHEEL_VISIBLE_NAMES,
      participants.length,
    );
    const indexes = new Set<number>();

    for (let sample = 0; sample < targetCount; sample += 1) {
      indexes.add(
        Math.floor((sample * participants.length) / targetCount),
      );
    }

    if (
      pendingWinnerIndex !== null &&
      pendingWinnerIndex >= 0 &&
      pendingWinnerIndex < participants.length
    ) {
      indexes.add(pendingWinnerIndex);
    }

    return Array.from(indexes)
      .sort((a, b) => a - b)
      .map((index) => ({
        index,
        name: participants[index],
      }));
  }, [largeWheelVisual, participants, pendingWinnerIndex]);

  const monthlyWheelSegments = useMemo(() => {
    if (participants.length === 0) return [];

    let cursor = 0;

    return groupedParticipants.map((participant, index) => {
      const startEntry = cursor;
      const endEntry = cursor + participant.count;
      cursor = endEntry;

      const startAngle = (startEntry / participants.length) * 360;
      const endAngle = (endEntry / participants.length) * 360;
      const centerAngle = (startAngle + endAngle) / 2;
      const percentage = (participant.count / participants.length) * 100;
      const hue = (38 + index * 137.508) % 360;
      const lightness = index % 3 === 0 ? 42 : index % 3 === 1 ? 34 : 38;

      return {
        ...participant,
        index,
        startAngle,
        endAngle,
        centerAngle,
        percentage,
        color: `hsl(${hue.toFixed(1)} 62% ${lightness}%)`,
      };
    });
  }, [groupedParticipants, participants.length]);

  const monthlyWheelGradient = useMemo(() => {
    if (monthlyWheelSegments.length === 0) {
      return "conic-gradient(#111a20 0deg 360deg)";
    }

    const stops = monthlyWheelSegments.map(
      (segment) =>
        `${segment.color} ${segment.startAngle.toFixed(4)}deg ${segment.endAngle.toFixed(4)}deg`,
    );

    return `conic-gradient(${stops.join(",")})`;
  }, [monthlyWheelSegments]);


  const fastWheelSpin = participants.length >= 10;

  const configGradient = useMemo(
    () => (largeWheelVisual ? LARGE_WHEEL_GRADIENT : wheelGradient(participants.length)),
    [largeWheelVisual, participants.length],
  );

  const renderLargeWheelNames = () => {
    const step = 360 / participants.length;

    return largeWheelNameEntries.map(({ name, index }) => {
      const angle = index * step + step / 2;
      const style = {
        "--wheel-name-angle": `${angle}deg`,
        "--wheel-name-size": name.length > 18 ? "6px" : name.length > 13 ? "7px" : "8px",
      } as CSSProperties;

      return (
        <span
          key={`large-${index}-${name}`}
          className={`giveaway-wheel-name giveaway-wheel-name-large${pendingWinnerIndex === index ? " is-pending-winner" : ""}`}
          style={style}
        >
          {name}
        </span>
      );
    });
  };

  const renderWheelNames = (names: string[], preview = false) => names.map((name, index) => {
    const angle = index * (360 / names.length) + (360 / names.length) / 2;
    const fontSize = nameFontSize(name, names.length);

    if (preview) {
      return (
        <span
          key={`${name}-${index}`}
          className="wheel-preview-name"
          style={{
            fontSize: `${fontSize}px`,
            transform: `rotate(${angle}deg) translateY(-185px) rotate(-90deg)`,
          }}
        >
          {name}
        </span>
      );
    }

    const style = {
      "--wheel-name-angle": `${angle}deg`,
      "--wheel-name-size": `${fontSize}px`,
    } as CSSProperties;

    return (
      <span key={`${name}-${index}`} className="giveaway-wheel-name" style={style}>
        {name}
      </span>
    );
  });

  const renderMonthlyWheelNames = () => {
    if (monthlyWheelSegments.length === 0) return null;

    return monthlyWheelSegments.map((segment) => {
      const span = segment.endAngle - segment.startAngle;
      const fontSize =
        span >= 45 ? 13 :
        span >= 20 ? 11 :
        span >= 8 ? 9 :
        span >= 3 ? 7 :
        6;
      const winnerSegment =
        Boolean(monthlyWinner) &&
        segment.name.trim().toLocaleLowerCase() === monthlyWinner!.trim().toLocaleLowerCase();

      const style = {
        "--wheel-name-angle": `${segment.centerAngle}deg`,
        "--wheel-name-size": `${fontSize}px`,
      } as CSSProperties;

      return (
        <span
          key={`monthly-${segment.name.trim().toLocaleLowerCase()}`}
          className={`monthly-wheel-name${winnerSegment ? " is-selected" : ""}`}
          style={style}
          title={`${segment.name} · ${segment.count} entradas · ${segment.percentage.toFixed(2)}%`}
        >
          <b>{segment.name}</b>
          {span >= 7 && <small>{segment.percentage.toFixed(span >= 20 ? 1 : 0)}%</small>}
        </span>
      );
    });
  };

  function spinMonthlyGiveaway() {
    if (
      monthlyLaunching ||
      monthlySpinning ||
      monthlyWinner ||
      participants.length < 1 ||
      giveawayPrizeSaving ||
      giveawayPrizeEditing ||
      !giveawayPrizeName.trim() ||
      !giveawayPrizeImageUrl ||
      giveawayPrizeNumericValue() === null
    ) return;

    const winnerIndex = randomParticipantIndex(participants.length);
    const selectedName = participants[winnerIndex];
    const selectedKey = selectedName.trim().toLocaleLowerCase();
    const selectedSegment = monthlyWheelSegments.find(
      (segment) => segment.name.trim().toLocaleLowerCase() === selectedKey,
    );
    const selectedCenter = selectedSegment?.centerAngle ?? 0;
    const wheelFinalOffset = randomParticipantIndex(3600) / 10;
    const finalWheelRotation = 4 * 360 + wheelFinalOffset;
    const finalKnifeAngle = 45 + selectedCenter + wheelFinalOffset;
    const sourceRect = monthlyPrizeImageRef.current?.getBoundingClientRect();

    setMonthlyLaunching(true);
    setMonthlyKnifeDocked(false);
    setMonthlyKnifeRotation(45);
    setMonthlyWheelRotation(0);
    startMonthlyGiveawayAudio();
    playWheelPlim();

    if (sourceRect) {
      const targetWidth = Math.min(250, Math.max(205, window.innerWidth * 0.13));
      const targetHeight = targetWidth * 0.62;
      const targetLeft = window.innerWidth / 2 - targetWidth / 2;
      const targetTop = window.innerHeight / 2 - targetHeight / 2;

      setMonthlyKnifeFlightStyle({
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMonthlyKnifeFlightStyle({
            left: targetLeft,
            top: targetTop,
            width: targetWidth,
            height: targetHeight,
          });
        });
      });
    }

    const flightDuration = sourceRect ? 1000 : 250;

    window.setTimeout(() => {
      setMonthlyKnifeDocked(true);
      setMonthlyKnifeFlightStyle(null);
      setMonthlyLaunching(false);
      setMonthlySpinning(true);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setMonthlyWheelRotation(finalWheelRotation);
          setMonthlyKnifeRotation(finalKnifeAngle + 18 * 360);
        });
      });

      const centerSpinDuration = 31000;
      window.setTimeout(() => {
        setMonthlySpinning(false);
        setMonthlyWinner(selectedName);
        playApplauseBurst();
      }, centerSpinDuration);
    }, flightDuration);
  }

  const soundToggle = (
    <button
      type="button"
      className={`giveaway-sound-toggle${soundEnabled ? "" : " is-muted"}`}
      onClick={toggleSound}
      aria-pressed={soundEnabled}
      aria-label={soundEnabled ? pick("Desligar som", "Mute sound") : pick("Ligar som", "Enable sound")}
      title={soundEnabled ? pick("Desligar som", "Mute sound") : pick("Ligar som", "Enable sound")}
    >
      {soundEnabled ? <Volume2 /> : <VolumeX />}
      <span>{soundEnabled ? pick("SOM", "SOUND") : pick("MUDO", "MUTED")}</span>
    </button>
  );

  if (monthlyGiveawayMode && session && account?.role === "admin") {
    const uniqueMonthlyParticipants = uniqueParticipantNames(participants).length;
    const monthlyPrizeImageUrl = giveawayPrizeImageUrl;
    const monthlyPrizeName = giveawayPrizeName.trim()
      ? formatFactoryNewSkinName(giveawayPrizeName.trim())
      : pick("SEM SKIN CONFIGURADA", "NO SKIN CONFIGURED");
    const monthlyPrizeValue = giveawayPrizeNumericValue();
    const monthlyPrizeReady = Boolean(
      giveawayPrizeName.trim() &&
      giveawayPrizeImageUrl &&
      monthlyPrizeValue !== null &&
      !giveawayPrizeEditing,
    );
    const monthlyLocked =
      monthlyLaunching ||
      monthlySpinning ||
      Boolean(monthlyWinner) ||
      giveawayPrizeSaving;
    const monthlyWinnerSegment = monthlyWinner
      ? monthlyWheelSegments.find(
          (segment) =>
            segment.name.trim().toLocaleLowerCase() ===
            monthlyWinner.trim().toLocaleLowerCase(),
        )
      : null;
    const monthlyWinnerChance = monthlyWinnerSegment?.percentage ?? null;
    const monthlyLeader = monthlyWheelSegments.reduce<
      (typeof monthlyWheelSegments)[number] | null
    >(
      (leader, segment) =>
        !leader || segment.count > leader.count ? segment : leader,
      null,
    );

    async function revealMonthlyWinnerInHistory() {
      if (
        !monthlyWinner ||
        !monthlyPrizeReady ||
        monthlyPrizeValue === null ||
        giveawayPrizeSaving
      ) return;

      setGiveawayPrizeSaving(true);
      setGiveawayPrizeMessage("");

      const winnerName = monthlyWinner;
      const prizeName = monthlyPrizeName;
      const prizeValue = monthlyPrizeValue;
      const prizeImageUrl = monthlyPrizeImageUrl;

      const { data, error } = await supabase.rpc("finalize_monthly_giveaway", {
        p_winner_name: winnerName,
      });

      setGiveawayPrizeSaving(false);

      if (error) {
        setGiveawayPrizeMessage(
          pick(
            "Não foi possível guardar o giveaway mensal. Tenta novamente.",
            "The monthly giveaway could not be saved. Please try again.",
          ),
        );
        return;
      }

      const finalized =
        Array.isArray(data) && data.length > 0 ? data[0] : null;
      const completedAt =
        finalized?.completed_at ?? new Date().toISOString();

      stopMonthlyGiveawayAudio();
      setMonthlyHistoryFlightStyle(null);
      setMonthlyHistoryDemo({
        winnerName,
        skinName: finalized?.archived_skin_name || prizeName,
        skinValue:
          finalized?.archived_skin_value === null ||
          finalized?.archived_skin_value === undefined
            ? prizeValue
            : Number(finalized.archived_skin_value),
        imageUrl: prizeImageUrl,
        completedAt,
        phase: "showcase",
      });

      // The monthly prize is consumed by finalization. Start the next one empty.
      setGiveawayPrizeName("");
      setGiveawayPrizeValue("");
      setGiveawayPrizeImagePath(null);
      setGiveawayPrizeImageUrl("");
      setGiveawayPrizeEditing(true);
      setGiveawayPrizeMessage("");

      setMonthlyGiveawayMode(false);
      setMonthlyWinner(null);
      setMonthlyKnifeRotation(45);
      setMonthlyWheelRotation(0);
      setMonthlyLaunching(false);
      setMonthlySpinning(false);
      setMonthlyKnifeDocked(false);
      setMonthlyKnifeFlightStyle(null);
    }

    return (
      <main className={`monthly-giveaway-page${monthlyLocked ? " is-focus" : ""}`}>
        <div className="monthly-page-watermark" aria-hidden="true">
          {Array.from({ length: 96 }, (_, index) => (
            <span key={index}>GIVEAWAY</span>
          ))}
        </div>

        <div className="monthly-event-branding" aria-hidden="true">
          <img
            className="monthly-event-branding-image"
            src={wheelAsset("Logótipo CHYNA × TOPSKIN em Transparência.png")}
            alt=""
          />
        </div>

        {monthlyKnifeFlightStyle && (
          <div
            className="monthly-flying-knife"
            aria-hidden="true"
            style={monthlyKnifeFlightStyle}
          >
            <img src={monthlyPrizeImageUrl} alt="" />
          </div>
        )}

        <section className="monthly-wheel-stage">
          <div className="monthly-wheel-glow" />

          <div className="monthly-brand">
            <span>CHYNA . SPECIAL EVENT</span>
            <strong>{pick("GIVEAWAY MENSAL", "MONTHLY GIVEAWAY")}</strong>
          </div>

          <div className="monthly-wheel-shell">
            <div
              ref={wheelRotorRef}
              className={`monthly-wheel-rotor${monthlySpinning ? " is-spinning" : ""}`}
              style={{
                background: monthlyWheelGradient,
                "--monthly-wheel-angle": `${monthlyWheelRotation}deg`,
              } as CSSProperties}
            >
              {monthlyWheelSegments.map((segment, index) => (
                <span
                  key={`monthly-divider-${segment.name.trim().toLocaleLowerCase()}-${index}`}
                  className="monthly-wheel-divider"
                  style={{
                    "--divider-angle": `${segment.startAngle}deg`,
                  } as CSSProperties}
                />
              ))}
              {renderMonthlyWheelNames()}
            </div>

            <button
              type="button"
              className={`monthly-wheel-center${monthlyKnifeDocked ? " has-knife" : ""}${monthlySpinning ? " is-spinning" : ""}${monthlyLocked ? " is-draw-active" : ""}`}
              onClick={spinMonthlyGiveaway}
              disabled={monthlyLocked || !monthlyPrizeReady || participants.length < 1}
              aria-label={pick("Sortear vencedor", "Draw winner")}
            >
              {monthlyKnifeDocked ? (
                <img
                  src={monthlyPrizeImageUrl}
                  alt={monthlyPrizeName}
                  style={{
                    "--monthly-knife-angle": `${monthlyKnifeRotation}deg`,
                  } as CSSProperties}
                />
              ) : !monthlyLocked ? (
                <>
                  <span>{pick("GIVEAWAY DO", "CHYNA'S")}</span>
                  <strong>CHYNAO</strong>
                </>
              ) : null}
            </button>
          </div>
        </section>

        <aside className="participants-panel monthly-participants-panel">
          <div className="monthly-wave-frame" aria-hidden="true">
            <span className="wave-top" />
            <span className="wave-right" />
            <span className="wave-bottom" />
            <span className="wave-left" />
          </div>

          <div className="participants-panel-head monthly-panel-head">
            <div>
              <span className="monthly-panel-kicker">SPECIAL EVENT</span>
              <h2><Users /> {pick("PARTICIPANTES", "PARTICIPANTS")}</h2>
            </div>
            <button
              type="button"
              className="participants-back"
              onClick={closeMonthlyGiveaway}
              disabled={monthlyLaunching || monthlySpinning}
            >
              <ArrowLeft /> {pick("VOLTAR", "BACK")}
            </button>
          </div>

          <div className="monthly-participant-stats">
            <div>
              <span>{pick("ENTRADAS", "ENTRIES")}</span>
              <strong>{participants.length}</strong>
            </div>
            <div>
              <span>{pick("ÚNICOS", "UNIQUE")}</span>
              <strong>{uniqueMonthlyParticipants}</strong>
            </div>
            <div className="is-leader">
              <span>{pick("LÍDER", "LEADER")}</span>
              <strong title={monthlyLeader?.name ?? "—"}>
                {monthlyLeader
                  ? `${monthlyLeader.name} · ${monthlyLeader.percentage.toFixed(1)}%`
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="participants-quick-add">
            <div className="participants-quick-name">
              <span>{pick("NOME", "NAME")}</span>
              <input
                type="text"
                value={quickParticipantName}
                onChange={(event) => {
                  setQuickParticipantName(event.target.value);
                  setParticipantMessage("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addQuickParticipant();
                }}
                placeholder="Chyna"
                disabled={monthlyLocked}
              />
            </div>

            <div className="participants-quick-multiplier">
              <span>{pick("ENTRADAS", "ENTRIES")}</span>
              <div>
                <button
                  type="button"
                  onClick={() => setQuickParticipantCount((count) => Math.max(1, count - 1))}
                  disabled={monthlyLocked || quickParticipantCount <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={MAX_PARTICIPANT_MULTIPLIER}
                  value={quickParticipantCount}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setQuickParticipantCount(
                      Number.isFinite(value)
                        ? Math.max(1, Math.min(MAX_PARTICIPANT_MULTIPLIER, Math.floor(value)))
                        : 1,
                    );
                  }}
                  disabled={monthlyLocked}
                />
                <button
                  type="button"
                  onClick={() => setQuickParticipantCount((count) => Math.min(MAX_PARTICIPANT_MULTIPLIER, count + 1))}
                  disabled={monthlyLocked || quickParticipantCount >= MAX_PARTICIPANT_MULTIPLIER}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="participants-quick-submit"
              onClick={addQuickParticipant}
              disabled={monthlyLocked}
            >
              {pick("ADICIONAR", "ADD")}
            </button>
          </div>

          <textarea
            className="participants-input"
            value={participantInput}
            onChange={(event) => {
              setParticipantInput(event.target.value);
              setParticipantMessage("");
            }}
            placeholder={pick(
              "Um nome por linha...\nChyna 100x\nRui 25x\nMiguel\nMáximo: 500x por nome",
              "One name per line...\nChyna 100x\nRui 25x\nMiguel\nMaximum: 500x per name",
            )}
            spellCheck={false}
            disabled={monthlyLocked}
          />

          <div className="participants-actions">
            <button
              type="button"
              className="participants-load"
              onClick={loadParticipants}
              disabled={monthlyLocked || draftCount < 1}
            >
              {pick("ADICIONA NA RODA", "ADD TO WHEEL")}
            </button>
            <button
              type="button"
              className="participants-clear"
              onClick={clearParticipants}
              disabled={monthlyLocked || !monthlyPrizeReady || participants.length < 1}
            >
              <Trash2 />
            </button>
          </div>

          <div className="participants-loaded">
            <div className="participants-loaded-head">
              <span>{pick("NA RODA", "ON WHEEL")}</span>
              <input
                className="participants-search"
                type="search"
                value={participantSearch}
                onChange={(event) => setParticipantSearch(event.target.value)}
                placeholder={pick("Pesquisar nome...", "Search name...")}
                spellCheck={false}
                disabled={monthlyLocked}
              />
              <strong>{participants.length}</strong>
            </div>

            <div className="participants-list">
              {participants.length === 0 ? (
                <p>{pick("Ainda não carregaste participantes.", "No participants loaded yet.")}</p>
              ) : filteredGroupedParticipants.length === 0 ? (
                <p>
                  {pick(
                    `Nenhum resultado para "${participantSearch.trim()}".`,
                    `No results for "${participantSearch.trim()}".`,
                  )}
                </p>
              ) : displayedGroupedParticipants.map((participant, index) => (
                <div
                  className="participant-row participant-row-grouped"
                  key={participant.name.trim().toLocaleLowerCase()}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong title={participant.name}>{participant.name}</strong>
                  <b>×{participant.count}</b>
                  <em className="monthly-participant-chance">
                    {participants.length > 0
                      ? `${((participant.count / participants.length) * 100).toFixed(1)}%`
                      : "0.0%"}
                  </em>
                  <button
                    type="button"
                    className="participant-remove-one"
                    onClick={() => removeOneParticipantEntry(participant.name)}
                    disabled={monthlyLocked}
                    title={pick("Retirar 1 entrada", "Remove 1 entry")}
                  >
                    −1
                  </button>
                  <button
                    type="button"
                    className="participant-remove"
                    onClick={() => removeAllParticipantEntries(participant.name)}
                    disabled={monthlyLocked}
                    title={pick("Remover todas as entradas", "Remove all entries")}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}

              {hiddenGroupedParticipantCount > 0 && (
                <p className="participants-render-limit">
                  {pick(
                    `+ ${hiddenGroupedParticipantCount} nomes não mostrados · usa a pesquisa para encontrar qualquer participante`,
                    `+ ${hiddenGroupedParticipantCount} names hidden · use search to find any participant`,
                  )}
                </p>
              )}
            </div>
          </div>

          {participantMessage && <p className="monthly-participant-message">{participantMessage}</p>}

          <button
            type="button"
            className="monthly-start-btn"
            onClick={spinMonthlyGiveaway}
            disabled={monthlyLocked || participants.length < 1}
          >
            {pick("SORTEAR VENCEDOR", "DRAW WINNER")} <ArrowRight />
          </button>
        </aside>

        <aside className="monthly-prize-card">
          <div className="monthly-wave-frame monthly-prize-wave-frame" aria-hidden="true">
            <span className="wave-top" />
            <span className="wave-right" />
            <span className="wave-bottom" />
            <span className="wave-left" />
          </div>

          <div className={`monthly-prize-card-media${monthlyPrizeReady ? "" : " is-empty"}`}>
            {monthlyPrizeImageUrl ? (
              <img
                ref={monthlyPrizeImageRef}
                src={monthlyPrizeImageUrl}
                alt={monthlyPrizeName}
              />
            ) : (
              <span className="monthly-prize-empty">
                {pick("SEM SKIN", "NO SKIN")}
              </span>
            )}
          </div>

          <strong>{monthlyPrizeName}</strong>
          {monthlyPrizeValue !== null && (
            <b className="monthly-prize-value">$ {monthlyPrizeValue.toFixed(2)}</b>
          )}
          {!monthlyPrizeReady && (
            <small className="monthly-prize-ready-note">
              {pick(
                "Guarda a próxima skin em CONFIGURAR SORTEIO para ativar o mensal.",
                "Save the next skin in GIVEAWAY SETUP to activate the monthly giveaway.",
              )}
            </small>
          )}
        </aside>

        {monthlyWinner && (
          <div className="monthly-winner-overlay">
            <div className="monthly-winner-card">
              <span className="monthly-winner-firework monthly-winner-firework-left" aria-hidden="true" />
              <span className="monthly-winner-firework monthly-winner-firework-right" aria-hidden="true" />
              <span className="monthly-winner-firework monthly-winner-firework-bottom-left" aria-hidden="true" />
              <span className="monthly-winner-firework monthly-winner-firework-bottom-right" aria-hidden="true" />
              <button
                type="button"
                className={`monthly-winner-volume${monthlyAudioMuted ? " is-muted" : ""}`}
                onClick={toggleMonthlyGiveawayAudioMute}
                aria-label={
                  monthlyAudioMuted
                    ? pick("Ligar música", "Unmute music")
                    : pick("Desligar música", "Mute music")
                }
                title={
                  monthlyAudioMuted
                    ? pick("Ligar música", "Unmute music")
                    : pick("Desligar música", "Mute music")
                }
              >
                {monthlyAudioMuted ? <VolumeX /> : <Volume2 />}
              </button>

              <span>{pick("TEMOS VENCEDOR", "WE HAVE A WINNER")}</span>
              <img src={monthlyPrizeImageUrl} alt={monthlyPrizeName} />
              <strong>{monthlyWinner}</strong>
              <p className="monthly-winner-summary">
                {pick("Ganhou o giveaway da ", "Won the giveaway for the ")}
                <em>{monthlyPrizeName}</em>
                {monthlyPrizeValue !== null && (
                  <>
                    {pick(" no valor de ", " worth ")}
                    <em>$ {monthlyPrizeValue.toFixed(2)}</em>
                  </>
                )}
                {monthlyWinnerChance !== null && (
                  <>
                    {pick(" com ", " with a ")}
                    <em>{monthlyWinnerChance.toFixed(2)}%</em>
                    {pick(" de chance.", " chance.")}
                  </>
                )}
              </p>
              <h3>{pick("PARABÉNS!!!!!!!", "CONGRATULATIONS!!!!!!!")}</h3>
              <div className="monthly-winner-actions">
                <button
                  type="button"
                  className="monthly-winner-history-btn"
                  onClick={revealMonthlyWinnerInHistory}
                  disabled={giveawayPrizeSaving}
                >
                  {giveawayPrizeSaving
                    ? pick("A GUARDAR...", "SAVING...")
                    : pick("VER NO HISTÓRICO", "VIEW IN HISTORY")} {!giveawayPrizeSaving && <ArrowRight />}
                </button>
              </div>
              {giveawayPrizeMessage && (
                <p className="monthly-winner-save-error">{giveawayPrizeMessage}</p>
              )}
            </div>
          </div>
        )}
      </main>
    );
  }

  if (configuring && session && showCaseMode && topFive) {
    const round = CASE_ROUNDS[caseRound - 1] ?? CASE_ROUNDS[0];
    const leaderboardOrder = caseRoundOrder.length ? caseRoundOrder : topFive;
    const activePlayers = caseTiebreakPlayers.length
      ? caseTiebreakPlayers
      : caseRound === CASE_ROUNDS.length
        ? [...leaderboardOrder].reverse()
        : leaderboardOrder;
    const currentPlayer = activePlayers[casePlayerIndex] ?? activePlayers[0];
    const currentEntries = currentPlayer ? caseEntryCount(currentPlayer) : 1;
    const leaderboard = leaderboardOrder.map((name) => ({
      name,
      entries: caseEntryCount(name),
      total: casePlayerTotal(name),
    }));
    const isLastActivePlayer = casePlayerIndex >= activePlayers.length - 1;
    const isFinalRound = caseRound >= CASE_ROUNDS.length;
    const actionLabel = caseLastOpening
      ? !isLastActivePlayer
        ? pick("PRÓXIMO JOGADOR", "NEXT PLAYER")
        : !isFinalRound || caseTiebreakPlayers.length
          ? caseTiebreakPlayers.length
            ? pick("RESOLVER DESEMPATE", "RESOLVE TIE")
            : pick("PRÓXIMA ROUND", "NEXT ROUND")
          : pick("VER VENCEDOR", "REVEAL WINNER")
      : pick("ABRIR CHYNAO CASE", "OPEN CHYNAO CASE");

    return (
      <>
        <Header />
        {soundToggle}

        <main className="wheel-mobile-block">
          <span>{pick("APENAS PC", "DESKTOP ONLY")}</span>
          <h1>CHYNAO CASE</h1>
          <p>{pick(
            "Esta ferramenta foi feita para usar no PC durante os giveaways.",
            "This tool was built for desktop giveaway use.",
          )}</p>
        </main>

        <main className={`case-page case-tone-${round.tone}`}>
          {showCaseTransition && (
            <div className="case-transition-overlay case-transition-overlay-out" aria-hidden="true">
              <div className="case-transition-cloud" />
              <div className="case-transition-content">
                <span>TOP 5 LOCKED</span>
                <strong>CHYNAO CASE MODE</strong>
              </div>
            </div>
          )}

          <section className="case-shell">
            <header className="case-head">
              <div>
                <span className="case-kicker">CHYNAO CASE MODE</span>
                <h1>CHYNAO <em>CASE</em></h1>
                <p>
                  {caseTiebreakPlayers.length
                    ? pick("DESEMPATE · GOLD CASE", "TIEBREAK · GOLD CASE")
                    : `ROUND ${caseRound} · ${round.label}`}
                </p>
              </div>

              <div className="case-head-actions">
                <button
                  type="button"
                  className="case-back-btn"
                  onClick={() => {
                    if (caseRolling) return;
                    setShowCaseMode(false);
                    setShowTopFiveModal(true);
                  }}
                  disabled={caseRolling}
                >
                  <ArrowLeft /> {pick("VOLTAR AO TOP 5", "BACK TO TOP 5")}
                </button>
                <div className={`case-round-badge case-tone-${round.tone}`}>
                  <span>ROUND</span>
                  <strong>{String(caseRound).padStart(2, "0")}</strong>
                </div>
              </div>
            </header>

            <div className="case-layout">
              <aside className="case-leaderboard">
                <div className="case-panel-title">
                  <span>{pick("AO VIVO", "LIVE")}</span>
                  <strong>{pick("CLASSIFICAÇÃO", "LEADERBOARD")}</strong>
                </div>

                <div className="case-leaderboard-list">
                  {leaderboard.map((player, index) => {
                    const latest = [...caseOpenings]
                      .reverse()
                      .find(
                        (opening) =>
                          opening.playerName === player.name &&
                          opening.round === caseRound,
                      );

                    return (
                      <div
                        className={`case-leaderboard-row${player.name === currentPlayer ? " is-current" : ""}`}
                        key={player.name}
                      >
                        <span className="case-rank">{String(index + 1).padStart(2, "0")}</span>
                        <div className="case-player-main">
                          <strong title={player.name}>{player.name}</strong>
                          <small>{player.entries} {pick("entradas", "entries")}</small>
                        </div>
                        <div className="case-player-score">
                          <b>{player.total.toFixed(2)} €</b>
                          <small>+{(latest?.skin.valueEur ?? 0).toFixed(2)} €</small>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="case-odds-note">
                  <span>{pick("BOOST DE ENTRADAS", "ENTRY BOOST")}</span>
                  <p>
                    {pick(
                      "Mais entradas melhoram progressivamente as odds das skins mais valiosas. A melhor skin vai de 0,70% até um máximo de 5,00%.",
                      "More entries progressively improve the odds of higher-value skins. The top skin ranges from 0.70% up to a 5.00% cap.",
                    )}
                  </p>
                </div>
              </aside>

              <section className="case-arena">
                {caseTiebreakPlayers.length > 0 && (
                  <div className="case-tiebreak-banner">
                    {pick(
                      `EMPATE ENTRE ${caseTiebreakPlayers.length} JOGADORES · GOLD CASE EXTRA`,
                      `TIE BETWEEN ${caseTiebreakPlayers.length} PLAYERS · EXTRA GOLD CASE`,
                    )}
                  </div>
                )}

                <div className="case-current-player">
                  <div>
                    <span>{pick("A ABRIR AGORA", "OPENING NOW")}</span>
                    <strong>{currentPlayer}</strong>
                  </div>
                  <div className="case-current-stats">
                    <span>
                      {pick("ENTRADAS", "ENTRIES")}
                      <b>{currentEntries}</b>
                    </span>
                    <span>
                      {pick("MELHOR DROP", "TOP DROP")}
                      <b>{caseTopSkinChance(currentEntries).toFixed(2)}%</b>
                    </span>
                  </div>
                </div>

                {caseLastOpening && (
                  <div className="case-drop-result case-drop-result-top">
                    <div className="case-drop-image">
                      <img src={caseLastOpening.skin.imageUrl} alt={caseLastOpening.skin.skinName} />
                    </div>
                    <div>
                      <span>{pick("DROP", "DROP")}</span>
                      <strong>{caseLastOpening.skin.skinName}</strong>
                      <b>+{caseLastOpening.skin.valueEur.toFixed(2)} €</b>
                    </div>
                  </div>
                )}

                <div
                  className={`chynao-case-image-wrap case-tone-${round.tone}${caseRolling ? " is-opening" : ""}`}
                >
                  <img
                    className="chynao-case-image"
                    src={round.caseImage}
                    alt={round.label}
                  />
                </div>

                {caseRoundIntroVisible ? (
                  <div className={`case-contents-strip case-tone-${round.tone}`}>
                    <div className="case-contents-head">
                      <span>{pick("CONTEÚDO DA CAIXA", "CASE CONTENTS")}</span>
                      <strong>{round.label}</strong>
                    </div>

                    <div className="case-contents-grid">
                      {[...round.skins]
                        .sort((a, b) => a.valueEur - b.valueEur)
                        .map((skin) => (
                          <article key={skin.skinName}>
                            <img src={skin.imageUrl} alt={skin.skinName} />
                            <strong>{skin.label}</strong>
                            <span>{skin.valueEur.toFixed(2)} €</span>
                          </article>
                        ))}
                    </div>

                    <button
                      type="button"
                      className="case-open-btn case-start-round-btn"
                      onClick={() => {
                        setCaseRoundIntroVisible(false);
                        openCurrentCase(true);
                      }}
                    >
                      {pick(`COMEÇAR ROUND ${caseRound}`, `START ROUND ${caseRound}`)}
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      ref={caseReelWindowRef}
                      className={`case-reel-window${caseReel.length ? " has-reel" : ""}`}
                    >
                      <div className="case-reel-pointer" />
                      {caseReel.length ? (
                        <div
                          className={`case-reel-track${caseReelRun ? " is-running" : ""}`}
                          style={{ "--case-stop-offset": `${caseStopOffset}px` } as CSSProperties}
                        >
                          {caseReel.map((skin, index) => (
                            <article
                              className={`case-reel-item${!caseRolling && caseLastOpening && index === 24 ? " is-target" : ""}`}
                              key={`${skin.skinName}-${index}`}
                            >
                              <img src={skin.imageUrl} alt="" />
                              <strong>{skin.label}</strong>
                              <span>{skin.valueEur.toFixed(2)} €</span>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="case-reel-placeholder">
                          {pick(
                            "A case está pronta. Abre para descobrir a skin.",
                            "The case is ready. Open it to reveal the skin.",
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="case-open-btn"
                      onClick={caseLastOpening ? continueCaseMode : () => openCurrentCase()}
                      disabled={caseRolling || Boolean(caseWinnerNotice)}
                    >
                      {caseRolling ? pick("A ABRIR...", "OPENING...") : actionLabel}
                    </button>
                  </>
                )}
              </section>

              <aside className="case-giveaway-side" aria-label={pick("Skin do giveaway", "Giveaway skin")}>
                <div className="case-giveaway-side-head">
                  <span>{pick("SKIN DO GIVEAWAY", "GIVEAWAY SKIN")}</span>
                </div>

                <div className="case-giveaway-side-media">
                  {giveawayPrizeImageUrl ? (
                    <img
                      src={giveawayPrizeImageUrl}
                      alt={giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                    />
                  ) : (
                    <span>{pick("SEM IMAGEM", "NO IMAGE")}</span>
                  )}
                </div>

                <strong title={giveawayPrizeName}>
                  {giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                </strong>

                {giveawayPrizeValue && (
                  <b>{Number(giveawayPrizeValue.replace(",", ".")).toFixed(2)} €</b>
                )}
              </aside>
            </div>
          </section>
        </main>

        {caseWinnerNotice && (
          <div
            className="plinko-winner-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-winner-title"
          >
            <div className="plinko-confetti" aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <span
                  key={index}
                  className={`confetti-${index % 3 === 0 ? "gold" : index % 3 === 1 ? "green" : "white"}`}
                  style={{
                    "--confetti-left": `${(index * 37) % 100}%`,
                    "--confetti-delay": `-${(index * 0.19) % 4.2}s`,
                    "--confetti-duration": `${3.2 + (index % 7) * 0.23}s`,
                    "--confetti-drift": `${-42 + (index % 9) * 11}px`,
                    "--confetti-rotate": `${180 + (index % 8) * 90}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>

            <div className="plinko-winner-modal">
              <span className="plinko-winner-kicker">
                {pick("TEMOS VENCEDOR!", "WE HAVE A WINNER!")}
              </span>

              {winnerGiveawayPrizeImageUrl && (
                <div className="plinko-winner-prize-image">
                  <img
                    src={winnerGiveawayPrizeImageUrl}
                    alt={winnerGiveawayPrizeName || pick("Skin do giveaway", "Giveaway skin")}
                  />
                </div>
              )}

              <h2 id="case-winner-title">
                <strong>{caseWinnerNotice}</strong>
                {winnerGiveawayPrizeName ? (
                  <>
                    {pick(", ganhaste o giveaway desta ", ", you won the giveaway for this ")}
                    <span className="plinko-winner-brand">{formatFactoryNewSkinName(winnerGiveawayPrizeName)}</span>!
                  </>
                ) : (
                  <>{pick(", ganhaste o giveaway!", ", you won the giveaway!")}</>
                )}
              </h2>

              <p className="plinko-winner-congrats">
                {pick("MUITOS PARABÉNS!", "CONGRATULATIONS!")}
              </p>

              <p className="plinko-winner-trade">
                {pick(
                  "Manda já o teu trade link no chat para poderes receber o teu giveaway!",
                  "Send your trade link in chat now so you can receive your giveaway!",
                )}
              </p>

              <button
                type="button"
                className="plinko-winner-close"
                onClick={() => closeWinnerCelebration("case")}
                autoFocus
              >
                {pick("FECHAR", "CLOSE")}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (configuring && session && showPlinko && topFive) {
    const pegRows = Array.from({ length: 11 }, (_, rowIndex) =>
      Array.from({ length: rowIndex + 3 }, (_, pegIndex) => pegIndex),
    );
    const slotCount = activePlinkoSkins.length;

    return (
      <>
        <Header />
        {soundToggle}
        <main className="wheel-mobile-block">
          <span>{pick("APENAS PC", "DESKTOP ONLY")}</span>
          <h1>PLINKO</h1>
          <p>{pick(
            "Esta ferramenta foi feita para usar no PC durante os giveaways.",
            "This tool was built for desktop giveaway use.",
          )}</p>
        </main>

        <main className="plinko-page">
        {showPlinkoTransition && (
            <div className="plinko-transition-overlay plinko-transition-overlay-out" aria-hidden="true">
              <div className="plinko-transition-cloud" />
            </div>
          )}
          <section className="plinko-shell">
            <header className="plinko-head">
              <div>
                <h1 className="plinko-title"><span>PLINKO DO</span> <em>CHYNAO</em></h1>
                <p>{`ROUND ${plinkoRound} · ${plinkoRoundLabel}`}</p>
              </div>
              <div className="plinko-head-actions">
                <button
                  type="button"
                  className="plinko-back-btn"
                  onClick={() => {
                    setShowPlinko(false);
                    setShowTopFiveModal(true);
                  }}
                >
                  <ArrowLeft /> {pick("VOLTAR AO TOP 5", "BACK TO TOP 5")}
                </button>
                <div className="plinko-round-badge">
                  <span>ROUND</span>
                  <strong>{String(plinkoRound).padStart(2, "0")}</strong>
                </div>
              </div>
            </header>

            <div className="plinko-layout">
              <aside className="plinko-finalists">
                <div className="plinko-panel-title">
                  <span>{plinkoPlayers.length > 2 ? `TOP ${plinkoPlayers.length}` : "FINAL"}</span>
                  <strong>{pick("FINALISTAS", "FINALISTS")}</strong>
                </div>

                <div className="plinko-finalist-list">
                  {plinkoPlayers.map((name, index) => {
                    const inTiebreak =
                      Boolean(plinkoTiebreakIndexes?.includes(index));
                    const result = inTiebreak
                      ? plinkoTiebreakResults[index]
                      : plinkoResults[index];
                    const waitingForTiebreak =
                      inTiebreak && !plinkoTiebreakResults[index];

                    return (
                      <div className="plinko-finalist" key={`${name}-${index}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong title={name}>{name}</strong>

                        {result ? (
                          <div className="plinko-finalist-result">
                            <img src={result.imageUrl} alt={result.skinName} />
                            <div>
                              <b>{result.skinName}</b>
                              <span>{result.valueEur.toFixed(2)} €</span>
                            </div>
                          </div>
                        ) : waitingForTiebreak ? (
                          <i>{pick("À ESPERA DO DESEMPATE", "WAITING FOR TIEBREAK")}</i>
                        ) : plinkoDropSlots[index] !== undefined ? (
                          <div className="plinko-finalist-slot-result">
                            <span>SLOT</span>
                            <strong>{String(plinkoDropSlots[index] + 1).padStart(2, "0")}</strong>
                          </div>
                        ) : (
                          <i>{pick("À ESPERA DO DROP", "WAITING FOR DROP")}</i>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="plinko-drop-btn"
                  onClick={startPlinkoDrop}
                  disabled={plinkoDropping || Boolean(plinkoRewardNotice) || Boolean(plinkoEliminationNotice) || Boolean(plinkoTieNotice) || Boolean(plinkoWinnerNotice) || plinkoPhaseComplete}
                >
                  {plinkoDropping ? pick("A REBENTAR...", "DROPPING...") : "REBENTAAAAA"}
                </button>

                <div className="plinko-rule">
                  <span>{pick("REGRA", "RULE")}</span>
                  <p>{pick(
                    "Cada jogador faz um drop. O menor valor é eliminado; se houver empate no menor valor, só esses jogadores vão a desempate.",
                    "Each player drops once. The lowest value is eliminated; if the lowest value is tied, only those players go to a tiebreak.",
                  )}</p>
                </div>
              </aside>

              <section
                ref={plinkoBoardRef}
                className={`plinko-machine${plinkoExplosionSlot !== null ? " is-flashing" : ""}`}
                aria-label={pick("Tabuleiro Plinko", "Plinko board")}
              >
                <div className="plinko-machine-inner">
                  <div className="plinko-drop-zone">
                    <span>{pick("DROP ZONE", "DROP ZONE")}</span>
                    <div className="plinko-drop-port" />
                    <div ref={plinkoC4Ref} className={`plinko-c4-placeholder${plinkoDropping ? " is-dropping" : ""}`} aria-hidden="true">
                      <img
                        src="/bolacs2.png"
                        alt=""
                        className="plinko-c4-image"
                        draggable={false}
                      />
                    </div>
                  </div>

                  <div className="plinko-pegs">
                    {pegRows.map((row, rowIndex) => (
                      <div
                        className="plinko-peg-row"
                        data-plinko-row={rowIndex}
                        style={{ width: `${23 + rowIndex * 6.6}%` }}
                        key={rowIndex}
                      >
                        {row.map((pegIndex) => (
                          <span
                            className={`plinko-peg${plinkoHitPegs.includes(`${rowIndex}-${pegIndex}`) ? " hit" : ""}`}
                            data-plinko-peg={pegIndex}
                            key={pegIndex}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="plinko-slots">
                    {activePlinkoSkins.map((skin, index) => (
                      <div
                        className={`plinko-slot${plinkoLandedSlot === index ? " landed" : ""}${plinkoExplosionSlot === index ? " exploding" : ""}`}
                        data-plinko-slot={index}
                        key={skin.skinName}
                        title={skin.skinName}
                      >
                        <div className="plinko-slot-media">
                          <img src={skin.imageUrl} alt={skin.skinName} />
                        </div>
                        <div className="plinko-slot-name">{skin.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="plinko-giveaway-prize" aria-label={pick("Prémio do giveaway", "Giveaway prize")}>
                <div className="plinko-giveaway-prize-head">
                  <span>{pick("SKIN DO GIVEAWAY", "GIVEAWAY SKIN")}</span>
                  <small>{pick("PRÉMIO", "PRIZE")}</small>
                </div>

                <div className="plinko-giveaway-prize-media">
                  {giveawayPrizeImageUrl ? (
                    <img
                      src={giveawayPrizeImageUrl}
                      alt={giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                    />
                  ) : (
                    <span>{pick("SEM IMAGEM", "NO IMAGE")}</span>
                  )}
                </div>

                <strong title={giveawayPrizeName}>
                  {giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Prémio não configurado", "Prize not configured")}
                </strong>

                {giveawayPrizeValue && (
                  <b>{Number(giveawayPrizeValue.replace(",", ".")).toFixed(2)} €</b>
                )}

                <p>
                  {pick(
                    "Este é o prémio configurado na roda para este giveaway.",
                    "This is the prize configured on the wheel for this giveaway.",
                  )}
                </p>
              </aside>
            </div>

          </section>
        </main>

        {plinkoRewardNotice && (
          <div
            className="plinko-reward-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plinko-reward-title"
          >
            <div className="plinko-reward-modal">

              <div className="plinko-reward-skin">
                {plinkoRewardNotice.reward ? (
                  <img
                    src={plinkoRewardNotice.reward.imageUrl}
                    alt={plinkoRewardNotice.reward.skinName}
                  />
                ) : (
                  <div className="plinko-reward-skin-placeholder" aria-hidden="true">
                    <span>SKIN</span>
                  </div>
                )}
              </div>

              <h2 id="plinko-reward-title">
                <strong>{plinkoRewardNotice.playerName}</strong>{" "}
                {pick("tirou uma", "pulled a")}{" "}
                {plinkoRewardNotice.reward ? (
                  <>
                    <strong>{plinkoRewardNotice.reward.skinName}</strong>{" "}
                    {pick("no valor de", "worth")}{" "}
                    <em>{plinkoRewardNotice.reward.valueEur.toFixed(2)} €</em>!
                  </>
                ) : (
                  <>{pick("skin!", "skin!")}</>
                )}
              </h2>

              <p>{pick(
                "Parabéns e boa sorte!",
                "Congratulations and good luck!",
              )}</p>
              <button
                type="button"
                className="plinko-reward-continue"
                onClick={closePlinkoRewardNotice}
                autoFocus
              >
                {plinkoPhaseComplete
                  ? plinkoTiebreakIndexes
                    ? pick("VER RESULTADO DO DESEMPATE", "SEE TIEBREAK RESULT")
                    : pick("VER RESULTADO DA RONDA", "SEE ROUND RESULT")
                  : pick("PRÓXIMO DROP", "NEXT DROP")}
              </button>
            </div>
          </div>
        )}

        {plinkoEliminationNotice && (
          <div
            className="plinko-elimination-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plinko-elimination-title"
          >
            <div className="plinko-elimination-modal">
              <span className="plinko-elimination-kicker">
                {pick("FIM DA RONDA", "END OF ROUND")}
              </span>

              <div className="plinko-elimination-icon" aria-hidden="true">×</div>

              <h2 id="plinko-elimination-title">
                <strong>{plinkoEliminationNotice.playerName}</strong>,
                <br />
                {pick("foste eliminado.", "you've been eliminated.")}
              </h2>

              <p>
                {pick(
                  "Tenta de novo no próximo giveaway! Obrigado por teres participado.",
                  "Try again in the next giveaway! Thanks for taking part.",
                )}
              </p>

              <button
                type="button"
                className="plinko-elimination-continue"
                onClick={startNextPlinkoRound}
                autoFocus
              >
                {plinkoEliminationNotice.survivors.length === 1
                  ? pick("VER VENCEDOR", "SEE WINNER")
                  : pick("PRÓXIMA RONDA", "NEXT ROUND")}
              </button>
            </div>
          </div>
        )}

        {plinkoTieNotice && (
          <div
            className="plinko-tie-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plinko-tie-title"
          >
            <div className="plinko-tie-modal">
              <span>{pick("DESEMPATE!", "TIEBREAK!")}</span>
              <h2 id="plinko-tie-title">
                <strong>
                  {plinkoTieNotice.names.join(
                    plinkoTieNotice.names.length === 2 ? " e " : " · ",
                  )}
                </strong>
                <br />
                {plinkoTieNotice.skinName
                  ? pick(
                      `tiraram uma ${plinkoTieNotice.skinName}!`,
                      `pulled the same ${plinkoTieNotice.skinName}!`,
                    )
                  : pick(
                      `empataram com o menor valor: ${plinkoTieNotice.valueEur.toFixed(2)} €!`,
                      `tied for the lowest value: ${plinkoTieNotice.valueEur.toFixed(2)} €!`,
                    )}
              </h2>
              <p>
                {pick(
                  "Só estes jogadores vão fazer um novo drop para decidir quem é eliminado.",
                  "Only these players will drop again to decide who is eliminated.",
                )}
              </p>
              <button type="button" onClick={startPlinkoTiebreak} autoFocus>
                {pick("DESEMPATE", "TIEBREAK")}
              </button>
            </div>
          </div>
        )}

        {plinkoWinnerNotice && (
          <div
            className="plinko-winner-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plinko-winner-title"
          >
            <div className="plinko-confetti" aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <span
                  key={index}
                  className={`confetti-${index % 3 === 0 ? "gold" : index % 3 === 1 ? "green" : "white"}`}
                  style={{
                    "--confetti-left": `${(index * 37) % 100}%`,
                    "--confetti-delay": `${-((index * 0.19) % 4.2)}s`,
                    "--confetti-duration": `${3.2 + (index % 7) * 0.23}s`,
                    "--confetti-drift": `${-42 + (index % 9) * 11}px`,
                    "--confetti-rotate": `${180 + (index % 8) * 90}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>

            <div className="plinko-winner-modal">
              <span className="plinko-winner-kicker">
                {pick("TEMOS VENCEDOR!", "WE HAVE A WINNER!")}
              </span>

              {winnerGiveawayPrizeImageUrl && (
                <div className="plinko-winner-prize-image">
                  <img
                    src={winnerGiveawayPrizeImageUrl}
                    alt={winnerGiveawayPrizeName || pick("Skin do giveaway", "Giveaway skin")}
                  />
                </div>
              )}

              <h2 id="plinko-winner-title">
                <strong>{plinkoWinnerNotice.playerName}</strong>
                {winnerGiveawayPrizeName ? (
                  <>
                    {pick(", ganhaste o giveaway desta ", ", you won the giveaway for this ")}
                    <span className="plinko-winner-brand">{formatFactoryNewSkinName(winnerGiveawayPrizeName)}</span>!
                  </>
                ) : (
                  <>{pick(", ganhaste o giveaway!", ", you won the giveaway!")}</>
                )}
              </h2>

              <p className="plinko-winner-congrats">
                {pick("MUITOS PARABÉNS!", "CONGRATULATIONS!")}
              </p>

              <p className="plinko-winner-trade">
                {pick(
                  "Manda já o teu trade link no chat para poderes receber o teu giveaway!",
                  "Send your trade link in chat now so you can receive your giveaway!",
                )}
              </p>

              <button
                type="button"
                className="plinko-winner-close"
                onClick={() => closeWinnerCelebration("plinko")}
                autoFocus
              >
                {pick("FECHAR", "CLOSE")}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (configuring && session) {
    return (
      <>
        <Header />
        {soundToggle}
        <main className="wheel-mobile-block">
          <span>{pick("APENAS PC", "DESKTOP ONLY")}</span>
          <h1>{pick("RODA DO CHYNAO", "CHYNA WHEEL")}</h1>
          <p>{pick(
            "Esta ferramenta foi feita para usar no PC durante as streams.",
            "This tool was built for desktop use during streams.",
          )}</p>
        </main>
        <main className="wheel-page wheel-page-config">
          <section className="wheel-config-layout">
            <div className="wheel-config-stage">
              <div className="wheel-config-glow" />
              <div className="wheel-config-pointer" />

              <div className={`wheel-prize-card${giveawayPrizeEditing ? "" : " is-display"}`}>
                <div className="wheel-prize-card-head">
                  <span>{pick("SKIN DO GIVEAWAY", "GIVEAWAY SKIN")}</span>

                  {giveawayPrizeEditing ? (
                    <small>{pick("PRÉMIO", "PRIZE")}</small>
                  ) : (
                    <button
                      type="button"
                      className="wheel-prize-back"
                      onClick={() => {
                        setGiveawayPrizeEditing(true);
                        setGiveawayPrizeMessage("");
                      }}
                    >
                      <ArrowLeft />
                      {pick("VOLTAR", "BACK")}
                    </button>
                  )}
                </div>

                {giveawayPrizeEditing ? (
                  <>
                    <button
                      type="button"
                      className={`wheel-prize-preview${giveawayPrizeImageUrl ? " has-image" : ""}`}
                      onClick={() => prizeImageInputRef.current?.click()}
                      disabled={giveawayPrizeSaving}
                      title={pick("Carregar ou trocar imagem", "Upload or replace image")}
                    >
                      {giveawayPrizeImageUrl ? (
                        <img
                          src={giveawayPrizeImageUrl}
                          alt={giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                        />
                      ) : (
                        <>
                          <Upload />
                          <strong>{pick("UPLOAD DA SKIN", "UPLOAD SKIN")}</strong>
                          <small>PNG · JPG · WEBP · 5 MB</small>
                        </>
                      )}
                    </button>

                    <input
                      ref={prizeImageInputRef}
                      className="wheel-prize-file-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={uploadGiveawayPrizeImage}
                      tabIndex={-1}
                    />

                    <label className="wheel-prize-field">
                      <span>{pick("NOME DA SKIN", "SKIN NAME")}</span>
                      <input
                        type="text"
                        value={giveawayPrizeName}
                        onChange={(event) => {
                          setGiveawayPrizeName(event.target.value);
                          setGiveawayPrizeMessage("");
                        }}
                        placeholder="AK-47 | Wild Lotus"
                        disabled={giveawayPrizeSaving}
                      />
                    </label>

                    <label className="wheel-prize-field">
                      <span>{pick("VALOR", "VALUE")}</span>
                      <div className="wheel-prize-value-input">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={giveawayPrizeValue}
                          onChange={(event) => {
                            setGiveawayPrizeValue(event.target.value);
                            setGiveawayPrizeMessage("");
                          }}
                          placeholder="100.00"
                          disabled={giveawayPrizeSaving}
                        />
                        <b>€</b>
                      </div>
                    </label>

                    <div className="wheel-prize-actions">
                      <button
                        type="button"
                        className="wheel-prize-upload"
                        onClick={() => prizeImageInputRef.current?.click()}
                        disabled={giveawayPrizeSaving}
                      >
                        <Upload />
                        {giveawayPrizeImageUrl ? pick("TROCAR", "REPLACE") : pick("UPLOAD", "UPLOAD")}
                      </button>

                      <button
                        type="button"
                        className="wheel-prize-save"
                        onClick={saveGiveawayPrize}
                        disabled={giveawayPrizeSaving}
                      >
                        <Save />
                        {giveawayPrizeSaving ? pick("A GUARDAR...", "SAVING...") : pick("GUARDAR", "SAVE")}
                      </button>
                    </div>

                    {(giveawayPrizeImagePath || giveawayPrizeName || giveawayPrizeValue) && (
                      <button
                        type="button"
                        className="wheel-prize-remove"
                        onClick={removeGiveawayPrize}
                        disabled={giveawayPrizeSaving}
                      >
                        <Trash2 />
                        {pick("REMOVER PRÉMIO", "REMOVE PRIZE")}
                      </button>
                    )}

                    {giveawayPrizeMessage && (
                      <small className="wheel-prize-message">{giveawayPrizeMessage}</small>
                    )}
                  </>
                ) : (
                  <div className="wheel-prize-showcase">
                    <div className="wheel-prize-showcase-media">
                      {giveawayPrizeImageUrl ? (
                        <img
                          src={giveawayPrizeImageUrl}
                          alt={giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                        />
                      ) : (
                        <span>{pick("SEM IMAGEM", "NO IMAGE")}</span>
                      )}
                    </div>

                    <strong title={giveawayPrizeName}>
                      {giveawayPrizeName ? formatFactoryNewSkinName(giveawayPrizeName) : pick("Skin do giveaway", "Giveaway skin")}
                    </strong>

                    {giveawayPrizeValue && (
                      <b>{Number(giveawayPrizeValue.replace(",", ".")).toFixed(2)} €</b>
                    )}
                  </div>
                )}
              </div>
              {qualificationModeActive && (
                <div className="qualification-panel" aria-label={pick("Apurados", "Qualified players")}>
                  <div className="qualification-panel-head">
                    <div>
                      <span>{pick("MODO APURAMENTO", "QUALIFYING MODE")}</span>
                      <strong>{pick("APURADOS", "QUALIFIED")}</strong>
                    </div>
                    <b>{qualifiedParticipants.length}/5</b>
                  </div>

                  <div className="qualification-panel-list">
                    {Array.from({ length: 5 }, (_, index) => {
                      const name = qualifiedParticipants[index];

                      return (
                        <div
                          className={`qualification-panel-row${name ? " is-filled" : ""}`}
                          key={index}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong>{name || "—"}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                className="giveaway-wheel"
                aria-label={pick("Roda do sorteio", "Giveaway wheel")}
              >
                <div
                  ref={wheelRotorRef}
                  className={`giveaway-wheel-rotor${spinning ? " is-spinning" : ""}${spinning && fastWheelSpin ? " is-fast" : ""}`}
                  style={{
                    background: configGradient,
                    transform: `rotate(${rotation}deg)`,
                  }}
                  onTransitionEnd={(event) => {
                    if (
                      event.propertyName !== "transform" ||
                      !spinning ||
                      pendingWinner === null ||
                      pendingWinnerIndex === null
                    ) return;

                    stopWheelSpinAudio();

                    const eliminatedName = pendingWinner;
                    const eliminatedIndex = pendingWinnerIndex;
                    const normalizedName = eliminatedName.trim().toLocaleLowerCase();

                    setSpinning(false);
                    setWinner(eliminatedName);

                    if (qualificationModeActive) {
                      const entryCount = participants.filter(
                        (name) => name.trim().toLocaleLowerCase() === normalizedName,
                      ).length;
                      const nextParticipants = participants.filter(
                        (name) => name.trim().toLocaleLowerCase() !== normalizedName,
                      );
                      const alreadyQualified = qualifiedParticipants.some(
                        (name) => name.trim().toLocaleLowerCase() === normalizedName,
                      );
                      const nextQualified = alreadyQualified
                        ? qualifiedParticipants
                        : [...qualifiedParticipants, eliminatedName];

                      setParticipants(nextParticipants);
                      setQualifiedParticipants(nextQualified);
                      if (!alreadyQualified) {
                        setQualifiedEntryCounts((current) => ({
                          ...current,
                          [normalizedName]: entryCount,
                        }));
                      }
                      setEliminationNotice({
                        kind: "qualification",
                        name: eliminatedName,
                        position: nextQualified.length,
                      });
                      playStillAlivePlim();

                      if (nextQualified.length >= 5) {
                        setPendingTopFive(nextQualified.slice(0, 5));
                      }
                    } else {
                      const nextParticipants = participants.filter(
                        (_, index) => index !== eliminatedIndex,
                      );
                      const remainingEntries = nextParticipants.filter(
                        (name) => name.trim().toLocaleLowerCase() === normalizedName,
                      ).length;

                      setParticipants(nextParticipants);

                      if (nextParticipants.length === 1) {
                        setWheelWinnerNotice(nextParticipants[0]);
                        void finalizeCurrentGiveaway(nextParticipants[0]);
                      } else {
                        setEliminationNotice({
                          kind: "elimination",
                          name: eliminatedName,
                          remainingEntries,
                        });

                        if (remainingEntries > 0) {
                          playStillAlivePlim();
                        } else {
                          playEliminatedSound();
                        }

                        if (nextParticipants.length === 5) {
                          setPendingTopFive(nextParticipants.slice(0, 5));
                        }
                      }
                    }

                    setPendingWinner(null);
                    setPendingWinnerIndex(null);
                  }}
                >
                  <WheelDividers count={visualWheelSegmentCount} />
                  {largeWheelVisual
                    ? renderLargeWheelNames()
                    : participants.length > 0 && renderWheelNames(participants)}
                </div>
                <button
                  type="button"
                  className={`giveaway-wheel-center${autoSpin ? " is-auto" : ""}`}
                  onClick={requestAutoSpinToggle}
                  disabled={
                    participants.length < 1 ||
                    (!qualificationModeActive && participants.length <= 1) ||
                    Boolean(topFive) ||
                    Boolean(wheelWinnerNotice)
                  }
                  aria-pressed={autoSpin}
                  aria-label={pick(
                    autoSpin ? "Desativar modo automático" : "Ativar modo automático",
                    autoSpin ? "Disable automatic mode" : "Enable automatic mode",
                  )}
                  title={pick(
                    autoSpin ? "Modo automático ativo — clicar para parar" : "Clicar para ativar o modo automático",
                    autoSpin ? "Automatic mode active — click to stop" : "Click to enable automatic mode",
                  )}
                >
                  <span>RODA DO</span>
                  <strong>CHYNAO</strong>
                  <small>{autoSpin ? "AUTO" : "MANUAL"}</small>
                </button>
              </div>

              <div className="wheel-rule">
                <span>
                  {qualificationModeActive
                    ? pick("MODO APURAMENTO", "QUALIFYING MODE")
                    : pick("REGRA", "RULE")}
                </span>
                <p>
                  {qualificationModeActive
                    ? pick(
                        "Mais de 200 entradas: cada pessoa escolhida fica diretamente apurada para o Plinko. Todas as entradas desse nome saem da roda e o processo repete-se até termos 5 apurados.",
                        "More than 200 entries: each selected person qualifies directly for Plinko. All entries for that name leave the wheel and the process repeats until 5 players qualify.",
                      )
                    : pick(
                        "Em cada rodada, a pessoa escolhida pela roda é eliminada. Quando restarem apenas 5 entradas, o TOP 5 avança para o Plinko, onde será decidido o vencedor final do sorteio.",
                        "Each round, the person selected by the wheel is eliminated. When only 5 entries remain, the TOP 5 advances to Plinko, where the final giveaway winner will be decided.",
                      )}
                </p>
              </div>
            </div>

            <aside className="participants-panel">
              <div className="participants-panel-head">
                <div>
                  <h2><Users /> {pick("PARTICIPANTES", "PARTICIPANTS")}</h2>
                  {isTestGiveaway && (
                    <span className="participants-test-mode">
                      {pick("MODO TESTE · NÃO ENTRA NO HISTÓRICO", "TEST MODE · NOT SAVED TO HISTORY")}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="participants-back"
                  onClick={() => {
                    setAutoSpin(false);
                    setConfiguring(false);
                  }}
                  disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                >
                  <ArrowLeft /> {pick("VOLTAR", "BACK")}
                </button>
              </div>

              <div className="participants-count-row">
                <span>{pick("ENTRADAS NA LISTA", "ENTRIES IN LIST")}</span>
                <strong>{draftCount}</strong>
              </div>

              <div className="participants-quick-add">
                <div className="participants-quick-name">
                  <span>{pick("NOME", "NAME")}</span>
                  <input
                    type="text"
                    value={quickParticipantName}
                    onChange={(event) => {
                      setQuickParticipantName(event.target.value);
                      setParticipantMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addQuickParticipant();
                    }}
                    placeholder={pick("Chyna", "Chyna")}
                    disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                  />
                </div>

                <div className="participants-quick-multiplier">
                  <span>{pick("ENTRADAS", "ENTRIES")}</span>
                  <div>
                    <button
                      type="button"
                      onClick={() => setQuickParticipantCount((count) => Math.max(1, count - 1))}
                      disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice) || quickParticipantCount <= 1}
                      aria-label={pick("Retirar uma entrada", "Remove one entry")}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={MAX_PARTICIPANT_MULTIPLIER}
                      value={quickParticipantCount}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setQuickParticipantCount(
                          Number.isFinite(value)
                            ? Math.max(1, Math.min(MAX_PARTICIPANT_MULTIPLIER, Math.floor(value)))
                            : 1,
                        );
                      }}
                      disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                    />
                    <button
                      type="button"
                      onClick={() => setQuickParticipantCount((count) => Math.min(MAX_PARTICIPANT_MULTIPLIER, count + 1))}
                      disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice) || quickParticipantCount >= MAX_PARTICIPANT_MULTIPLIER}
                      aria-label={pick("Adicionar uma entrada", "Add one entry")}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="participants-quick-submit"
                  onClick={addQuickParticipant}
                  disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                >
                  {pick("ADICIONAR", "ADD")}
                </button>
              </div>

              <textarea
                className="participants-input"
                value={participantInput}
                onChange={(event) => {
                  setParticipantInput(event.target.value);
                  setParticipantMessage("");
                }}
                placeholder={pick(
                  "Um nome por linha...\nChyna 100x\nRui 25x\nMiguel\nMáximo: 500x por nome",
                  "One name per line...\nChyna 100x\nRui 25x\nMiguel\nMaximum: 500x per name",
                )}
                spellCheck={false}
                disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
              />

              <div className="participants-actions">
                <button type="button" className="participants-load" onClick={loadParticipants} disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}>
                  {pick("ADICIONA NA RODA", "ADD TO WHEEL")}
                </button>
                <button type="button" className="participants-clear" onClick={clearParticipants} disabled={spinning || Boolean(eliminationNotice) || Boolean(wheelWinnerNotice)} aria-label={pick("Limpar participantes", "Clear participants")}>
                  <Trash2 />
                </button>
              </div>

              <div className="participants-loaded">
                <div className="participants-loaded-head">
                  <span>{pick("NA RODA", "ON WHEEL")}</span>
                  <input
                    className="participants-search"
                    type="search"
                    value={participantSearch}
                    onChange={(event) => setParticipantSearch(event.target.value)}
                    placeholder={pick("Pesquisar nome...", "Search name...")}
                    aria-label={pick("Pesquisar participante na roda", "Search participant on wheel")}
                    spellCheck={false}
                  />
                  <strong>{participants.length}</strong>
                </div>
                <div className="participants-list">
                  {participants.length === 0 ? (
                    <p>{pick("Ainda não carregaste participantes.", "No participants loaded yet.")}</p>
                  ) : filteredGroupedParticipants.length === 0 ? (
                    <p>
                      {pick(
                        `Nenhum resultado para "${participantSearch.trim()}".`,
                        `No results for "${participantSearch.trim()}".`,
                      )}
                    </p>
                  ) : displayedGroupedParticipants.map((participant, index) => (
                    <div className="participant-row participant-row-grouped" key={participant.name.trim().toLocaleLowerCase()}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong title={participant.name}>{participant.name}</strong>
                      <b>×{participant.count}</b>
                      <button
                        type="button"
                        className="participant-remove-one"
                        onClick={() => removeOneParticipantEntry(participant.name)}
                        disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                        aria-label={pick(
                          `Retirar uma entrada de ${participant.name}`,
                          `Remove one entry from ${participant.name}`,
                        )}
                        title={pick("Retirar 1 entrada", "Remove 1 entry")}
                      >
                        −1
                      </button>
                      <button
                        type="button"
                        className="participant-remove"
                        onClick={() => removeAllParticipantEntries(participant.name)}
                        disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive) || Boolean(wheelWinnerNotice)}
                        aria-label={pick(
                          `Remover todas as entradas de ${participant.name}`,
                          `Remove all entries from ${participant.name}`,
                        )}
                        title={pick("Remover todas as entradas", "Remove all entries")}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                  {hiddenGroupedParticipantCount > 0 && (
                    <p className="participants-render-limit">
                      {pick(
                        `+ ${hiddenGroupedParticipantCount} nomes não mostrados · usa a pesquisa para encontrar qualquer participante`,
                        `+ ${hiddenGroupedParticipantCount} names hidden · use search to find any participant`,
                      )}
                    </p>
                  )}
                </div>
              </div>

              {participants.length > 0 && !topFive && (
                <button
                  type="button"
                  className="wheel-spin-btn"
                  onClick={requestManualSpin}
                  disabled={autoSpin || spinning || Boolean(eliminationNotice)}
                >
                  {autoSpin ? pick("AUTO ATIVO", "AUTO ACTIVE") : "SPINNNNNNNNN"}
                </button>
              )}

              {topFive && (
                <div className="wheel-top-five-status">
                  <span>TOP 5</span>
                  <strong>{pick("DEFINIDO", "LOCKED IN")}</strong>
                </div>
              )}
            </aside>
          </section>
        </main>

        {showQualificationIntro && qualificationModeActive && (
          <div
            className="qualification-intro-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qualification-intro-title"
          >
            <div className="qualification-intro-cloud" />
            <div className="qualification-intro-content">
              <strong id="qualification-intro-title">
                {pick("APURAMENTO DO TOP 5", "TOP 5 QUALIFYING")}
              </strong>
              <p>
                {pick(
                  "A roda vai agora escolher diretamente os 5 apurados para o Plinko.",
                  "The wheel will now select the 5 players who qualify directly for Plinko.",
                )}
              </p>
              <button
                type="button"
                className="qualification-intro-start"
                onClick={startQualificationMode}
                autoFocus
              >
                {pick("VAMOS!", "LET'S GO!")}
              </button>
            </div>
          </div>
        )}

        {eliminationNotice && (
          <div
            className="wheel-elimination-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wheel-elimination-title"
          >
            <div className="wheel-elimination-modal">
              {eliminationNotice.kind === "qualification" ? (
                <>
                  <span className="wheel-elimination-kicker wheel-still-in-kicker">
                    {pick(
                      `APURADO #${eliminationNotice.position}`,
                      `QUALIFIED #${eliminationNotice.position}`,
                    )}
                  </span>
                  <h2 id="wheel-elimination-title" className="wheel-still-in-title">
                    <strong>{eliminationNotice.name}</strong>{" "}
                    {pick(
                      "estás apurado para o Plinko!",
                      "you qualified for Plinko!",
                    )}
                  </h2>
                  <p>
                    {pick(
                      `${eliminationNotice.position}/5 lugares do TOP 5 preenchidos.`,
                      `${eliminationNotice.position}/5 TOP 5 spots filled.`,
                    )}
                  </p>
                </>
              ) : eliminationNotice.remainingEntries > 0 ? (
                <>
                  <span className="wheel-elimination-kicker wheel-still-in-kicker">
                    {pick("AINDA ESTÁS EM JOGO", "STILL IN THE GAME")}
                  </span>
                  <h2 id="wheel-elimination-title" className="wheel-still-in-title">
                    <strong>{eliminationNotice.name}</strong>,{" "}
                    {pick(
                      eliminationNotice.remainingEntries === 1
                        ? "ainda te resta 1 entrada! Não desanimes!"
                        : `ainda te restam ${eliminationNotice.remainingEntries} entradas! Não desanimes!`,
                      eliminationNotice.remainingEntries === 1
                        ? "you still have 1 entry left! Don't give up!"
                        : `you still have ${eliminationNotice.remainingEntries} entries left! Don't give up!`,
                    )}
                  </h2>
                </>
              ) : (
                <>
                  <span className="wheel-elimination-kicker">{pick("ELIMINADO", "ELIMINATED")}</span>
                  <h2 id="wheel-elimination-title">
                    <strong>{eliminationNotice.name}</strong>{" "}
                    {pick("foste eliminado!", "you were eliminated!")}
                  </h2>
                  <p>{pick("Obrigado por participares.", "Thanks for taking part.")}</p>
                </>
              )}

              {!autoSpin && (
                <button
                  type="button"
                  className="wheel-elimination-continue"
                  onClick={() => {
                    setEliminationNotice(null);

                    if (pendingTopFive) {
                      setTopFive(pendingTopFive);
                      setPendingTopFive(null);
                      setShowTopFiveModal(true);
                    }
                  }}
                  autoFocus
                >
                  {pick("CONTINUAR", "CONTINUE")}
                </button>
              )}
            </div>
          </div>
        )}

        {wheelWinnerNotice && (
          <div
            className="plinko-winner-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wheel-winner-title"
          >
            <div className="plinko-confetti" aria-hidden="true">
              {Array.from({ length: 42 }, (_, index) => (
                <span
                  key={index}
                  className={`confetti-${index % 3 === 0 ? "gold" : index % 3 === 1 ? "green" : "white"}`}
                  style={{
                    "--confetti-left": `${(index * 37) % 100}%`,
                    "--confetti-delay": `${-((index * 0.19) % 4.2)}s`,
                    "--confetti-duration": `${3.2 + (index % 7) * 0.23}s`,
                    "--confetti-drift": `${-42 + (index % 9) * 11}px`,
                    "--confetti-rotate": `${180 + (index % 8) * 90}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>

            <div className="plinko-winner-modal">
              <span className="plinko-winner-kicker">
                {pick("TEMOS VENCEDOR!", "WE HAVE A WINNER!")}
              </span>

              {winnerGiveawayPrizeImageUrl && (
                <div className="plinko-winner-prize-image">
                  <img
                    src={winnerGiveawayPrizeImageUrl}
                    alt={winnerGiveawayPrizeName || pick("Skin do giveaway", "Giveaway skin")}
                  />
                </div>
              )}

              <h2 id="wheel-winner-title">
                <strong>{wheelWinnerNotice}</strong>
                {winnerGiveawayPrizeName ? (
                  <>
                    {pick(", ganhaste o giveaway desta ", ", you won the giveaway for this ")}
                    <span className="plinko-winner-brand">{formatFactoryNewSkinName(winnerGiveawayPrizeName)}</span>!
                  </>
                ) : (
                  <>{pick(", ganhaste o giveaway!", ", you won the giveaway!")}</>
                )}
              </h2>

              <p className="plinko-winner-congrats">
                {pick("MUITOS PARABÉNS!", "CONGRATULATIONS!")}
              </p>

              <p className="plinko-winner-trade">
                {pick(
                  "Manda já o teu trade link no chat para poderes receber o teu giveaway!",
                  "Send your trade link in chat now so you can receive your giveaway!",
                )}
              </p>

              <button
                type="button"
                className="plinko-winner-close"
                onClick={() => closeWinnerCelebration("wheel")}
                autoFocus
              >
                {pick("FECHAR", "CLOSE")}
              </button>
            </div>
          </div>
        )}

        {showPlinkoTransition && (
          <div className="plinko-transition-overlay" aria-hidden="true">
            <div className="plinko-transition-cloud" />
            <div className="plinko-transition-content">
              <span>FINALISSIMAAAA</span>
              <strong>PLINKO MODE</strong>
            </div>
          </div>
        )}

        {showCaseTransition && (
          <div className="case-transition-overlay" aria-hidden="true">
            <div className="case-transition-cloud" />
            <div className="case-transition-content">
              <span>TOP 5 LOCKED</span>
              <strong>CHYNAO CASE MODE</strong>
            </div>
          </div>
        )}

        {topFive && showTopFiveModal && (
          <div
            className="wheel-elimination-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wheel-top-five-title"
          >
            <div className="wheel-top-five-modal">
              <span className="wheel-top-five-kicker">TOP 5</span>
              <h2 id="wheel-top-five-title">{pick("FINALISTAS DEFINIDOS!", "FINALISTS LOCKED IN!")}</h2>
              <div className="wheel-top-five-list">
                {topFive.map((name, index) => (
                  <div className="wheel-top-five-row" key={`${name}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{name}</strong>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="wheel-top-five-close"
                onClick={startFinalModeTransition}
                autoFocus
              >
                {wheelMode === "qualification" ? "CHYNAO CASE" : "FINALISSIMAAAA"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="wheel-mobile-block">
        <span>{pick("APENAS PC", "DESKTOP ONLY")}</span>
        <h1>{pick("RODA DO CHYNAO", "CHYNA WHEEL")}</h1>
        <p>{pick(
          "Esta ferramenta foi feita para usar no PC durante as streams.",
          "This tool was built for desktop use during streams.",
        )}</p>
      </main>
      <main className="wheel-page">
        <section className="wheel-hero">
          <h1>{pick("RODA DO", "CHYNA'S")} <strong>{pick("CHYNAO", "WHEEL")}</strong></h1>
          <p>{pick(
            "Survivor Wheel → TOP 5 → Plinko. Sorteios rápidos, visuais e feitos para giveaways.",
            "Survivor Wheel → TOP 5 → Plinko. Fast, visual and built for giveaways.",
          )}</p>
        </section>

        {monthlyHistoryDemo && monthlyHistoryDemo.phase !== "landed" && (
          <article
            ref={monthlyHistoryFlightRef}
            className={`giveaway-history-card giveaway-history-card-monthly monthly-history-arrival${monthlyHistoryFlightStyle ? " is-flying" : ""}`}
            style={monthlyHistoryFlightStyle ?? undefined}
          >
            <div className="monthly-history-smoke" aria-hidden="true" />
            <div className="monthly-history-art" aria-hidden="true">
              <img src={monthlyHistoryDemo.imageUrl} alt="" />
            </div>
            <small className="monthly-history-date">{formatHistoryDate(monthlyHistoryDemo.completedAt)}</small>
            <div className="monthly-history-content">
              <div className="monthly-history-top">
                <div className="monthly-history-heading">
                  <b>{pick("GIVEAWAY MENSAL", "MONTHLY GIVEAWAY")}</b>
                </div>
              </div>
              <em>
                {pick("OFERECIDO POR", "OFFERED BY")} · <b>Chyna</b>
              </em>
              <strong>
                <span>{pick("VENCEDOR", "WINNER")}: </span>
                <b>{monthlyHistoryDemo.winnerName}</b>
              </strong>
              <span className="monthly-history-skin">{monthlyHistoryDemo.skinName}</span>
            </div>
            <b className="monthly-history-value monthly-history-value-under-art">
              $ {monthlyHistoryDemo.skinValue.toFixed(2)}
            </b>
          </article>
        )}

        <section className="wheel-showcase">
          <aside className="giveaway-history" aria-label={pick("Vencedores dos giveaways", "Giveaway winners")}>
            <div className="giveaway-history-head">
              <h2>{pick("VENCEDORES DOS GIVEAWAYS", "GIVEAWAY WINNERS")}</h2>
            </div>

            <div className={`giveaway-history-window${giveawayHistory.length >= 5 ? " is-rolling" : ""}`}>
              {giveawayHistory.length > 0 ? (
                <div className={`giveaway-history-track${giveawayHistory.length >= 5 ? " is-rolling" : ""}${monthlyHistoryDemo && monthlyHistoryDemo.phase !== "landed" ? " is-arrival-paused" : ""}`}>
                  {(giveawayHistory.length >= 5 ? [0, 1] : [0]).map((groupIndex) => (
                    <div
                      className="giveaway-history-group"
                      key={groupIndex}
                      aria-hidden={groupIndex === 1}
                    >
                      {monthlyHistoryDemo && (
                        monthlyHistoryDemo.phase === "landed" ? (
                          <article
                            className="giveaway-history-card giveaway-history-card-monthly"
                            key={`${groupIndex}-monthly-demo`}
                          >
                            <div className="monthly-history-smoke" aria-hidden="true" />
                            <div className="monthly-history-art" aria-hidden="true">
                              <img src={monthlyHistoryDemo.imageUrl} alt="" />
                            </div>
                            <small className="monthly-history-date">{formatHistoryDate(monthlyHistoryDemo.completedAt)}</small>
                            <div className="monthly-history-content">
                              <div className="monthly-history-top">
                                <div className="monthly-history-heading">
                                                  <b>{pick("GIVEAWAY MENSAL", "MONTHLY GIVEAWAY")}</b>
                                </div>
                              </div>
                              <em>
                                {pick("OFERECIDO POR", "OFFERED BY")} · <b>Chyna</b>
                              </em>
                              <strong>
                                <span>{pick("VENCEDOR", "WINNER")}: </span>
                                <b>{monthlyHistoryDemo.winnerName}</b>
                              </strong>
                              <span className="monthly-history-skin">{monthlyHistoryDemo.skinName}</span>
                            </div>
                            <b className="monthly-history-value monthly-history-value-under-art">
                              $ {monthlyHistoryDemo.skinValue.toFixed(2)}
                            </b>
                          </article>
                        ) : (
                          <div
                            ref={groupIndex === 0 ? monthlyHistorySlotRef : undefined}
                            className="giveaway-history-monthly-slot"
                            aria-hidden="true"
                          />
                        )
                      )}

                      {giveawayHistory.map((item) => {
                        if (item.giveawayType === "monthly") {
                          return (
                            <article
                              className="giveaway-history-card giveaway-history-card-monthly"
                              key={`${groupIndex}-${item.id}`}
                            >
                              <div className="monthly-history-smoke" aria-hidden="true" />
                              {item.imageUrl && (
                                <div className="monthly-history-art" aria-hidden="true">
                                  <img src={item.imageUrl} alt="" loading="lazy" />
                                </div>
                              )}
                              <small className="monthly-history-date">{formatHistoryDate(item.completedAt)}</small>
                              <div className="monthly-history-content">
                                <div className="monthly-history-top">
                                  <div className="monthly-history-heading">
                                    <b>{pick("GIVEAWAY MENSAL", "MONTHLY GIVEAWAY")}</b>
                                  </div>
                                </div>
                                <em>
                                  {pick("OFERECIDO POR", "OFFERED BY")} · <b>{item.offeredBy}</b>
                                </em>
                                <strong>
                                  <span>{pick("VENCEDOR", "WINNER")}: </span>
                                  <b>{item.winnerName}</b>
                                </strong>
                                <span className="monthly-history-skin">
                                  {item.skinName ? formatFactoryNewSkinName(item.skinName) : pick("Prémio não indicado", "Prize not specified")}
                                </span>
                              </div>
                              {item.skinValue !== null && (
                                <b className="monthly-history-value monthly-history-value-under-art">
                                  $ {item.skinValue.toFixed(2)}
                                </b>
                              )}
                            </article>
                          );
                        }

                        const skinImage = historySkinImage(item.skinName);

                        return (
                          <article
                            className={`giveaway-history-card${skinImage ? " has-skin-image" : ""}`}
                            key={`${groupIndex}-${item.id}`}
                          >
                            {skinImage && (
                              <div className="giveaway-history-skin-art" aria-hidden="true">
                                <img src={skinImage} alt="" loading="lazy" />
                              </div>
                            )}

                            <div className="giveaway-history-top">
                              <em>
                                {pick("OFERECIDO POR", "OFFERED BY")} · <b>{item.offeredBy}</b>
                              </em>
                              <small>{formatHistoryDate(item.completedAt)}</small>
                            </div>

                            <strong className="giveaway-history-winner">
                              <span>{pick("VENCEDOR", "WINNER")}: </span>
                              <b>{item.winnerName}</b>
                            </strong>

                            <div className="giveaway-history-prize-row">
                              <span className="giveaway-history-skin">
                                {item.skinName ? formatFactoryNewSkinName(item.skinName) : pick("Prémio não indicado", "Prize not specified")}
                              </span>
                              {item.skinValue !== null && (
                                <b className="giveaway-history-value">{item.skinValue.toFixed(2)} €</b>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="giveaway-history-empty">
                  {pick("Ainda não há giveaways concluídos.", "No completed giveaways yet.")}
                </div>
              )}
            </div>

            <div className="giveaway-history-live">
              <i />
              <span>
                {pick("TOTAL DADO EM GIVEAWAYS (GERAL)", "TOTAL GIVEN IN GIVEAWAYS (TOTAL)")}
                <b>{giveawayHistoryTotal.toFixed(2)} €</b>
              </span>
            </div>
          </aside>

          <div className="wheel-preview-wrap">
            <div className="wheel-preview-glow" />
            <div className="wheel-pointer" />
            <div className="wheel-preview" aria-label={pick("Pré-visualização da roda", "Wheel preview")}>
              <div
                className={`wheel-preview-rotor${previewSpinning ? " is-spinning" : ""}`}
                style={{ transform: `rotate(${previewRotation}deg)` }}
                onTransitionEnd={(event) => {
                  if (event.propertyName === "transform") {
                    setPreviewSpinning(false);
                  }
                }}
              >
                <WheelDividers count={previewNames.length} />
                {renderWheelNames(previewNames, true)}
              </div>

              <button
                type="button"
                className="wheel-preview-center"
                onClick={spinPreviewWheel}
                disabled={previewSpinning}
                aria-label={pick("Rodar a roda de demonstração", "Spin demo wheel")}
              >
                <span>RODA DO</span>
                <small>CHYNAO</small>
              </button>
            </div>
            <div className="wheel-stage-label">SURVIVOR WHEEL &amp; PLINKO</div>
          </div>

          <aside className="wheel-side-panel">
            {loadingSession ? (
              <div className="wheel-loading">{pick("A carregar...", "Loading...")}</div>
            ) : !session && !showAuth ? (
              <div className="wheel-use-card">
                <span className="wheel-side-kicker">{pick("PRONTO PARA COMEÇAR?", "READY TO START?")}</span>
                <h2>{pick("USA JÁ PARA FAZER OS TEUS SORTEIOS!", "USE IT NOW FOR YOUR GIVEAWAYS!")}</h2>
                <p>{pick(
                  "Cria uma conta ou inicia sessão para guardar os teus Day Passes e usar a Roda do Chynao.",
                  "Create an account or sign in to keep your Day Passes and use Chyna's Wheel.",
                )}</p>
                <button className="wheel-use-btn" onClick={() => setShowAuth(true)}>
                  {pick("USAR", "USE NOW")} <ArrowRight />
                </button>
                <small>{pick("A roda fica visível para todos. Só precisas de conta para a usar.", "Everyone can see the wheel. You only need an account to use it.")}</small>
              </div>
            ) : !session ? (
              <div className="wheel-auth-card">
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

                <button className="wheel-back-btn" type="button" onClick={() => setShowAuth(false)}>
                  {pick("VOLTAR", "BACK")}
                </button>

                {message && <p className="wheel-auth-message">{message}</p>}
              </div>
            ) : (
              <div className="wheel-user-card">
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
                    <span>DAY PASSES</span>
                    <strong>{account?.role === "admin" ? "∞" : account?.dayPasses ?? 0}</strong>
                  </div>
                  <div>
                    <span>{pick("ACESSO", "ACCESS")}</span>
                    <strong className={account?.role === "admin" || (!ADMIN_ONLY_WHEEL && hasActivePass) ? "active" : ""}>
                      {account?.role === "admin"
                        ? "UNLIMITED"
                        : ADMIN_ONLY_WHEEL
                          ? pick("EM DESENVOLVIMENTO", "IN DEVELOPMENT")
                          : hasActivePass
                            ? pick("ATIVO", "ACTIVE")
                            : pick("SEM PASSE ATIVO", "NO ACTIVE PASS")}
                    </strong>
                    {activeUntil && hasActivePass && account?.role !== "admin" && <small>{pick("Até", "Until")} {activeUntil.toLocaleString()}</small>}
                  </div>
                </div>

                <button
                  className="wheel-use-btn logged"
                  type="button"
                  onClick={openConfigurator}
                  disabled={busy || loadingAccount || (ADMIN_ONLY_WHEEL && account?.role !== "admin")}
                >
                  {ADMIN_ONLY_WHEEL && account?.role !== "admin"
                    ? pick("EM DESENVOLVIMENTO", "IN DEVELOPMENT")
                    : busy
                      ? pick("A ATIVAR...", "ACTIVATING...")
                      : pick("CONFIGURAR SORTEIO", "SET UP GIVEAWAY")}{" "}
                  {(!ADMIN_ONLY_WHEEL || account?.role === "admin") && <ArrowRight />}
                </button>
                {account?.role === "admin" && (
                  <>
                    <button
                      className="wheel-monthly-btn"
                      type="button"
                      onClick={openMonthlyGiveaway}
                      disabled={busy || loadingAccount}
                    >
                      {pick("GIVEAWAY MENSAL", "MONTHLY GIVEAWAY")} <ArrowRight />
                    </button>
                    <button
                      className="wheel-test-btn"
                      type="button"
                      onClick={openTestConfigurator}
                      disabled={busy || loadingAccount}
                    >
                      {pick("TESTE", "TEST")}
                    </button>
                  </>
                )}
                {message && <p className="wheel-auth-message">{message}</p>}
              </div>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
