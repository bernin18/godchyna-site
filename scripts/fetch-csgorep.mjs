import fs from "node:fs";
import path from "node:path";

const STEAM_ID = "76561198018758818";
const API_URL = "https://api.csgo-rep.com/";
const OUTPUT_PATH = path.join(process.cwd(), "public", "csgorep.json");

async function post(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://csgo-rep.com",
      Referer: "https://csgo-rep.com/",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`CSGORep API request failed with ${response.status}`);
  }

  return response.json();
}

const reputationPayload = {
  id: "204",
  query: {
    filter: { to_steam_id: STEAM_ID },
    view: "creator",
    offset: 0,
    limit: 1000,
    nulls_last: 1,
    order_by: [{ field: "id", order: "DESC" }],
  },
};

const profilePayload = {
  id: "206",
  query: { steam_id: STEAM_ID },
};

try {
  const [reputationResult, profileResult] = await Promise.allSettled([
    post(reputationPayload),
    post(profilePayload),
  ]);

  if (reputationResult.status !== "fulfilled") {
    throw reputationResult.reason;
  }

  const repsData = reputationResult.value ?? {};
  const profileData = profileResult.status === "fulfilled" ? profileResult.value ?? {} : {};
  const allReviews = Array.isArray(repsData.data) ? repsData.data : [];

  if (allReviews.length > 0) {
    console.log("CSGOREP_FIRST_REVIEW_RAW", JSON.stringify(allReviews[0]));
  }

  const normalizedReviews = allReviews
    .map((review) => ({
      rate: Number(review?.rate),
      trade_position: Number(review?.trade_position),
      body: typeof review?.body === "string" ? review.body.trim() : "",
    }))
    .filter((review) => review.body.length > 0);

  const positive = normalizedReviews.filter((review) => review.rate === 1).length;
  const neutral = normalizedReviews.filter((review) => review.rate === 0).length;
  const negative = normalizedReviews.filter((review) => review.rate !== 1 && review.rate !== 0).length;
  const total = Number.isFinite(Number(repsData.total)) ? Number(repsData.total) : normalizedReviews.length;

  const output = {
    updatedAt: new Date().toISOString(),
    steamId: STEAM_ID,
    profile: profileData.profile ?? null,
    ban: profileData.ban ?? profileData.banned ?? null,
    stats: {
      positive,
      neutral,
      negative,
      total,
    },
    reps: {
      total,
      filtered: Number.isFinite(Number(repsData.filtered)) ? Number(repsData.filtered) : normalizedReviews.length,
      recent: normalizedReviews.slice(0, 12),
    },
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`CSGORep synced: ${total} reviews, ${positive} positive.`);
} catch (error) {
  console.error("Unable to refresh CSGORep data:", error);
  process.exitCode = 1;
}
