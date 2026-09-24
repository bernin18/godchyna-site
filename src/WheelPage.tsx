import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import type { Session } from "@supabase/supabase-js";
import { ArrowLeft, ArrowRight, LogIn, LogOut, Ticket, Trash2, UserRound, Users } from "lucide-react";
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

const previewNames = ["NUNO","RUI","MIGUEL","ANA","DIOGO","TIAGO","SOFIA","PEDRO","LUIS","MARTA","ALEX","JOAO"];
const giveawayHistoryDemo = [
  { player: "PLAYER_01", giveaway: "GIVEAWAY #006" },
  { player: "PLAYER_02", giveaway: "GIVEAWAY #005" },
  { player: "PLAYER_03", giveaway: "GIVEAWAY #004" },
  { player: "PLAYER_04", giveaway: "GIVEAWAY #003" },
  { player: "PLAYER_05", giveaway: "GIVEAWAY #002" },
  { player: "PLAYER_06", giveaway: "GIVEAWAY #001" },
];
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

function uniqueParticipantNames(entries: string[]) {
  const unique = new Map<string, string>();

  entries.forEach((entry) => {
    const trimmed = entry.trim();
    const key = trimmed.toLocaleLowerCase();
    if (trimmed && !unique.has(key)) unique.set(key, trimmed);
  });

  return Array.from(unique.values());
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

export default function WheelPage({ Header, Footer }: WheelPageProps) {
  const { pick } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantMessage, setParticipantMessage] = useState("");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<string | null>(null);
  const [pendingWinnerIndex, setPendingWinnerIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [eliminationNotice, setEliminationNotice] = useState<{ name: string; remainingEntries: number } | null>(null);
  const [pendingTopFive, setPendingTopFive] = useState<string[] | null>(null);
  const [topFive, setTopFive] = useState<string[] | null>(null);
  const [showTopFiveModal, setShowTopFiveModal] = useState(false);
  const [showPlinko, setShowPlinko] = useState(false);
  const [showPlinkoTransition, setShowPlinkoTransition] = useState(false);
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
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const plinkoRoundLabel =
    plinkoPlayers.length > 2
      ? `TOP ${plinkoPlayers.length} → TOP ${plinkoPlayers.length - 1}`
      : pick("FINAL · TOP 2 → VENCEDOR", "FINAL · TOP 2 → WINNER");

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

  function loadParticipants() {
    const entries = participantInput
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (entries.length < 1) {
      setParticipantMessage(pick(
        "Adiciona pelo menos 1 entrada.",
        "Add at least 1 entry.",
      ));
      return;
    }

    setParticipants((current) => [...current, ...entries]);
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
      `${entries.length} ${entries.length === 1 ? "entrada adicionada" : "entradas adicionadas"}. Nomes repetidos contam como entradas separadas.`,
      `${entries.length} ${entries.length === 1 ? "entry added" : "entries added"}. Repeated names count as separate entries.`,
    ));
  }

  function clearParticipants() {
    if (spinning) return;
    setParticipantInput("");
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
    setRotation(0);
  }

  function removeParticipant(indexToRemove: number) {
    if (spinning || eliminationNotice || topFive) return;

    setParticipants((current) => current.filter((_, index) => index !== indexToRemove));
    setWinner(null);
    setPendingWinner(null);
    setPendingWinnerIndex(null);
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

  function spinWheel() {
    if (spinning || eliminationNotice || topFive || participants.length === 0) return;

    if (participants.length === 5) {
      setTopFive(participants.slice(0, 5));
      setShowTopFiveModal(true);
      return;
    }

    const winnerIndex = randomParticipantIndex(participants.length);
    const selectedName = participants[winnerIndex];
    const step = 360 / participants.length;
    const selectedCenter = winnerIndex * step + step / 2;
    const targetAngle = (360 - (selectedCenter % 360)) % 360;

    setWinner(null);
    setPendingWinner(selectedName);
    setPendingWinnerIndex(winnerIndex);
    setSpinning(true);

    setRotation((currentRotation) => {
      const currentAngle = ((currentRotation % 360) + 360) % 360;
      const alignment = (targetAngle - currentAngle + 360) % 360;
      return currentRotation + 6 * 360 + alignment;
    });
  }

  const draftCount = useMemo(
    () => participantInput.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean).length,
    [participantInput],
  );

  const fastWheelSpin = participants.length > 10;

  const configGradient = useMemo(() => wheelGradient(participants.length), [participants.length]);

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

  if (configuring && session && showPlinko && topFive) {
    const pegRows = Array.from({ length: 11 }, (_, rowIndex) =>
      Array.from({ length: rowIndex + 3 }, (_, pegIndex) => pegIndex),
    );
    const slotCount = activePlinkoSkins.length;

    return (
      <>
        <Header />
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
                        <strong>{name}</strong>

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

              <h2 id="plinko-winner-title">
                <strong>{plinkoWinnerNotice.playerName}</strong>{" "}
                {pick("foi o vencedor do PLINKO DO", "is the winner of")}{" "}
                <span className="plinko-winner-brand">CHYNAO</span>
                {pick("!", "'S PLINKO!")}
              </h2>

              <p className="plinko-winner-congrats">
                {pick("PARABÉNS!", "CONGRATULATIONS!")}
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
                onClick={() => setPlinkoWinnerNotice(null)}
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
              <div
                className="giveaway-wheel"
                aria-label={pick("Roda do sorteio", "Giveaway wheel")}
              >
                <div
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

                    const eliminatedName = pendingWinner;
                    const eliminatedIndex = pendingWinnerIndex;
                    const normalizedName = eliminatedName.trim().toLocaleLowerCase();

                    setSpinning(false);
                    setWinner(eliminatedName);
                    setParticipants((current) => {
                      const nextParticipants = current.filter((_, index) => index !== eliminatedIndex);
                      const remainingEntries = nextParticipants.filter(
                        (name) => name.trim().toLocaleLowerCase() === normalizedName,
                      ).length;

                      setEliminationNotice({
                        name: eliminatedName,
                        remainingEntries,
                      });

                      if (nextParticipants.length === 5) {
                        setPendingTopFive(nextParticipants.slice(0, 5));
                      }

                      return nextParticipants;
                    });
                    setPendingWinner(null);
                    setPendingWinnerIndex(null);
                  }}
                >
                  <WheelDividers count={participants.length} />
                  {participants.length > 0 && renderWheelNames(participants)}
                </div>
                <div className="giveaway-wheel-center">
                  <span>RODA DO</span>
                  <strong>CHYNAO</strong>
                </div>
              </div>
            </div>

            <aside className="participants-panel">
              <div className="participants-panel-head">
                <div>
                  <h2><Users /> {pick("PARTICIPANTES", "PARTICIPANTS")}</h2>
                </div>
                <button type="button" className="participants-back" onClick={() => setConfiguring(false)} disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive)}>
                  <ArrowLeft /> {pick("VOLTAR", "BACK")}
                </button>
              </div>

              <div className="participants-count-row">
                <span>{pick("ENTRADAS NA LISTA", "ENTRIES IN LIST")}</span>
                <strong>{draftCount}</strong>
              </div>

              <textarea
                className="participants-input"
                value={participantInput}
                onChange={(event) => {
                  setParticipantInput(event.target.value);
                  setParticipantMessage("");
                }}
                placeholder={pick(
                  "Um nome por linha...\nChyna\nChyna\nChyna\nChyna",
                  "One name per line...\nChyna\nChyna\nChyna\nChyna",
                )}
                spellCheck={false}
                disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive)}
              />

              <div className="participants-actions">
                <button type="button" className="participants-load" onClick={loadParticipants} disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive)}>
                  {pick("ADICIONA NA RODA", "ADD TO WHEEL")}
                </button>
                <button type="button" className="participants-clear" onClick={clearParticipants} disabled={spinning || Boolean(eliminationNotice)} aria-label={pick("Limpar participantes", "Clear participants")}>
                  <Trash2 />
                </button>
              </div>

              <div className="participants-loaded">
                <div className="participants-loaded-head">
                  <span>{pick("NA RODA", "ON WHEEL")}</span>
                  <strong>{participants.length}</strong>
                </div>
                <div className="participants-list">
                  {participants.length === 0 ? (
                    <p>{pick("Ainda não carregaste participantes.", "No participants loaded yet.")}</p>
                  ) : participants.map((participant, index) => (
                    <div className="participant-row" key={`${participant}-${index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>{participant}</strong>
                      <button
                        type="button"
                        className="participant-remove"
                        onClick={() => removeParticipant(index)}
                        disabled={spinning || Boolean(eliminationNotice) || Boolean(topFive)}
                        aria-label={pick(`Remover ${participant}`, `Remove ${participant}`)}
                        title={pick("Remover esta entrada", "Remove this entry")}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {participants.length > 0 && !topFive && (
                <button
                  type="button"
                  className="wheel-spin-btn"
                  onClick={spinWheel}
                  disabled={spinning || Boolean(eliminationNotice)}
                >
                  SPINNNNNNNNN
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

        {eliminationNotice && (
          <div
            className="wheel-elimination-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wheel-elimination-title"
          >
            <div className="wheel-elimination-modal">
              {eliminationNotice.remainingEntries > 0 ? (
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
                onClick={startPlinkoTransition}
                autoFocus
              >
                FINALISSIMAAAA
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

        <section className="wheel-showcase">
          <aside className="giveaway-history" aria-label={pick("Vencedores dos giveaways", "Giveaway winners")}>
            <div className="giveaway-history-head">
              <h2>{pick("VENCEDORES DOS GIVEAWAYS", "GIVEAWAY WINNERS")}</h2>
            </div>

            <div className="giveaway-history-window">
              <div className="giveaway-history-track">
                {[0, 1].map((groupIndex) => (
                  <div
                    className="giveaway-history-group"
                    key={groupIndex}
                    aria-hidden={groupIndex === 1}
                  >
                    {giveawayHistoryDemo.map((item, index) => (
                      <article className="giveaway-history-card" key={`${groupIndex}-${item.giveaway}`}>
                        <div className="giveaway-history-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="giveaway-history-info">
                          <strong>{item.player}</strong>
                          <span>{item.giveaway}</span>
                        </div>
                        <small>DEMO</small>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="giveaway-history-live">
              <i />
              <span>{pick("ÚLTIMOS VENCEDORES", "LATEST WINNERS")}</span>
            </div>
          </aside>

          <div className="wheel-preview-wrap">
            <div className="wheel-preview-glow" />
            <div className="wheel-pointer" />
            <div className="wheel-preview" aria-label={pick("Pré-visualização da roda", "Wheel preview")}>
              <WheelDividers count={previewNames.length} />
              <div className="wheel-preview-center"><span>RODA DO</span><small>CHYNAO</small></div>
              {renderWheelNames(previewNames, true)}
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
