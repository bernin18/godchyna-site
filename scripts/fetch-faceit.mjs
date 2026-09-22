import { readFile, writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/faceit.json", import.meta.url);
const SOURCE = "https://fplleaderboards.com/players/Chyna";

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
  const response = await fetch(SOURCE, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; GODCHYNA-site/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`FACEIT stats request failed: ${response.status}`);

  const html = await response.text();
  const text = cleanText(html);

  const elo = num(text.match(/\b(\d{4})\s+ELO\b/i));
  const rankingPt = num(text.match(/Ranking\s+pt\s*#?\s*([\d,]+)/i));
  const matches = num(text.match(/\b(\d{3,6})\s+Total Matches\b/i)) ?? num(text.match(/Total Stats\s+(\d{3,6})\s+Matches\b/i));
  const winRate = num(text.match(/Win Rate\s+(\d+(?:\.\d+)?)%/i));
  const kd = num(text.match(/K\/D Ratio\s+([\d.]+)/i));
  const headshots = num(text.match(/Headshot\s*%\s*(\d+(?:\.\d+)?)%/i)) ?? num(text.match(/Headshots\s*%?\s*(\d+(?:\.\d+)?)%/i));
  const adr = num(text.match(/\bADR\s+([\d.]+)/i));

  const formMatch = text.match(/Recent Results\s+((?:[WL]\s*){3,10})/i);
  const recentResults = formMatch ? (formMatch[1].toUpperCase().match(/[WL]/g) ?? []).slice(0, 5) : fallback.recentResults;
  const recentMatches = parseRecentMatches(text);

  const output = {
    ...fallback,
    updatedAt: new Date().toISOString(),
    source: SOURCE,
    level: 10,
    elo: elo ?? fallback.elo,
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
