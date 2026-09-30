import { readFile, writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/faceit.json", import.meta.url);
const FACEIT_SOURCE = "https://www.faceit.com/api/users/v1/nicknames/Chyna";
const STATS_SOURCE = "https://fplleaderboards.com/players/Chyna";

function cleanText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");
}

function num(match, index = 1) {
  if (!match?.[index]) return null;
  const value = Number(String(match[index]).replace(/,/g, ""));
  return Number.isFinite(value) ? value : null;
}

function within(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function levelFromElo(elo) {
  if (typeof elo !== "number" || !Number.isFinite(elo)) return null;
  if (elo >= 2001) return 10;
  if (elo >= 1751) return 9;
  if (elo >= 1531) return 8;
  if (elo >= 1351) return 7;
  if (elo >= 1201) return 6;
  if (elo >= 1051) return 5;
  if (elo >= 901) return 4;
  if (elo >= 751) return 3;
  if (elo >= 501) return 2;
  return 1;
}

function mapName(raw = "") {
  const name = raw.replace(/^de_/i, "").toLowerCase();
  return name ? name[0].toUpperCase() + name.slice(1) : "—";
}

function parseRecentMatches(text) {
  const start = text.search(/CS2 MATCHES HISTORY/i);
  const section = start >= 0 ? text.slice(start) : text;
  const regex = /Result\s+(Win|Loss).*?K\s*-\s*A\s*-\s*D\s+(\d+)\s*-\s*(\d+)\s*-\s*(\d+).*?Rating\s+([\d.]+).*?Score\s+(\d+)\s*\/\s*(\d+).*?Map\s+(?:de_)?([a-z0-9]+).*?Date\s+(.+?)\s+Elo Point\s+(\d+)(?:\s*\(([+-]\d+)\))?/gi;
  const matches = [];
  for (const match of section.matchAll(regex)) {
    matches.push({
      result: match[1].toLowerCase() === "win" ? "W" : "L",
      map: mapName(match[8]),
      score: `${match[6]}–${match[7]}`,
      kills: Number(match[2]),
      assists: Number(match[3]),
      deaths: Number(match[4]),
      rating: Number(match[5]),
      elo: Number(match[10]),
      eloChange: match[11] ? Number(match[11]) : null,
      date: match[9].trim(),
    });
    if (matches.length >= 5) break;
  }
  return matches;
}

async function main() {
  const fallback = JSON.parse(await readFile(OUTPUT, "utf8"));

  let officialElo = null;
  let officialLevel = null;
  let officialOk = false;

  try {
    const faceitResponse = await fetch(FACEIT_SOURCE, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; GODCHYNA-site/1.0)",
        accept: "application/json,text/plain,*/*",
      },
    });

    if (!faceitResponse.ok) {
      throw new Error(`FACEIT profile request failed: ${faceitResponse.status}`);
    }

    const faceitPayload = await faceitResponse.json();
    const cs2 = faceitPayload?.payload?.games?.cs2;

    officialElo = within(Number(cs2?.faceit_elo), 1000, 6000);
    officialLevel = within(Number(cs2?.skill_level), 1, 15);
    officialOk = officialElo !== null || officialLevel !== null;

    if (!officialOk) {
      throw new Error("FACEIT profile response did not include CS2 ELO");
    }
  } catch (error) {
    console.warn("Official FACEIT refresh failed", error);
  }

  let text = "";
  let statsOk = false;

  try {
    const statsResponse = await fetch(STATS_SOURCE, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; GODCHYNA-site/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (!statsResponse.ok) {
      throw new Error(`FACEIT stats request failed: ${statsResponse.status}`);
    }

    const html = await statsResponse.text();
    text = cleanText(html);
    statsOk = true;
  } catch (error) {
    console.warn("Extended FACEIT stats refresh failed", error);
  }

  const elo = statsOk
    ? within(num(text.match(/\b(\d{4})\s+ELO\b/i)), 1000, 6000)
    : null;
  const scrapedLevel = statsOk
    ? within(
        num(text.match(/(?:FACEIT\s*)?(?:SKILL\s*)?LEVEL\s*#?\s*(\d{1,2})/i)),
        1,
        15,
      )
    : null;
  const rankingPt = statsOk
    ? within(num(text.match(/Ranking\s+pt\s*#?\s*([\d,]+)/i)), 1, 100000)
    : null;
  const matches = statsOk
    ? within(num(text.match(/\b(\d{3,6})\s+Total Matches\b/i)) ?? num(text.match(/Total Stats\s+(\d{3,6})\s+Matches\b/i)), 1, 100000)
    : null;
  const winRate = statsOk
    ? within(num(text.match(/Win Rate\s+(\d+(?:\.\d+)?)%/i)), 0, 100)
    : null;
  const parsedKd = statsOk
    ? num(text.match(/K\/D Ratio\s+([\d.]+)/i)) ?? num(text.match(/\bK\/D\s+([\d.]+)/i))
    : null;
  const kd = within(parsedKd, 0.1, 5);
  const headshots = statsOk
    ? within(num(text.match(/Headshot\s*%\s*(\d+(?:\.\d+)?)%/i)) ?? num(text.match(/Headshots\s*%?\s*(\d+(?:\.\d+)?)%/i)), 0, 100)
    : null;
  const adr = statsOk ? within(num(text.match(/\bADR\s+([\d.]+)/i)), 1, 250) : null;

  const recentMatches = statsOk ? parseRecentMatches(text) : [];
  const formMatch = statsOk ? text.match(/Recent Results\s+((?:[WL]\s*){3,10})/i) : null;
  const scrapedForm = formMatch ? (formMatch[1].toUpperCase().match(/[WL]/g) ?? []).slice(0, 5) : [];
  const recentResults = recentMatches.length
    ? recentMatches.map((match) => match.result).slice(0, 5)
    : scrapedForm.length
      ? scrapedForm
      : fallback.recentResults;

  const resolvedElo = officialElo ?? elo ?? fallback.elo;
  const resolvedLevel =
    officialLevel ??
    scrapedLevel ??
    levelFromElo(resolvedElo) ??
    fallback.level;

  if (!officialOk && !statsOk) {
    throw new Error("All FACEIT data sources failed");
  }

  const output = {
    ...fallback,
    updatedAt: new Date().toISOString(),
    source: officialOk ? FACEIT_SOURCE : STATS_SOURCE,
    level: resolvedLevel,
    elo: resolvedElo,
    rankingPt: rankingPt ?? fallback.rankingPt,
    stats: {
      matches: matches ?? fallback.stats?.matches,
      winRate: winRate ?? fallback.stats?.winRate,
      kd: kd ?? fallback.stats?.kd,
      adr: adr ?? fallback.stats?.adr,
      headshots: headshots ?? fallback.stats?.headshots,
    },
    recentResults,
    recentMatches: recentMatches.length ? recentMatches : fallback.recentMatches,
  };

  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log("FACEIT stats synced", JSON.stringify(output));
}

main().catch((error) => {
  console.error("FACEIT sync failed", error);
  process.exitCode = 1;
});
