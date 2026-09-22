import fs from "node:fs/promises";

const profileId = "58493090";
const urls = [
  `https://settings.gg/user/${profileId}/cs2`,
  `https://gg.settings.gg/user/${profileId}/cs2`,
];
const outputPath = new URL("../public/settingsgg.json", import.meta.url);

const fallback = {
  sourceUrl: urls[0],
  downloadUrl: `https://gg.settings.gg/api/download/cs2/${profileId}`,
  updatedAt: null,
  tabs: {
    Mouse: [
      { label: "Sens (In-game)", value: "1.4" },
      { label: "Mouse DPI", value: "400" },
      { label: "Rate", value: "4000 Hz" },
      { label: "Acceleration", value: "No" },
      { label: "Raw Input", value: "1" },
      { label: "Windows", value: "6/11" },
      { label: "Zoom sensitivity", value: "1" },
      { label: "m_yaw", value: "0.022" },
    ],
    Video: [],
    Viewmodel: [],
    HUD: [],
    Radar: [],
    Audio: [],
  },
};

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(/<br\s*\/?\s*>/gi, " ")
      .replace(/<\/p>|<\/div>|<\/li>|<\/tr>|<\/h[1-6]>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function between(text, start, end) {
  const startIndex = text.indexOf(start);
  if (startIndex < 0) return "";
  const from = startIndex + start.length;
  const endIndex = end ? text.indexOf(end, from) : -1;
  return text.slice(from, endIndex >= 0 ? endIndex : undefined).trim();
}

function commandRows(raw) {
  if (!raw) return [];
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^([^\s]+)\s+(.*)$/);
      return match
        ? { label: match[1], value: match[2].trim() }
        : { label: "Command", value: part };
    });
}

const labels = [
  "DPI",
  "Mouse Sensitivity",
  "Zoom Sensitivity Multiplier",
  "Polling rate",
  "m_yaw",
  "Brightness",
  "Scaling mode",
  "Aspect Ratio",
  "Resolution",
  "Display Mode",
  "Refresh Rate",
  "Boost Player Contrast",
  "V-Sync",
  "Multisampling Anti-Aliasing Mode",
  "Global Shadow Quality",
  "Model / Texture Detail",
  "Texture Filtering Mode",
  "Shader Detail",
  "Particle Detail",
  "Dynamic Shadows",
  "Ambient Occlusion",
  "High Dynamic Range",
  "FidelityFX Super Resolution",
  "NVIDIA Reflex Low Latency",
  "Binds",
];

function valueAfter(text, label) {
  const index = text.indexOf(label);
  if (index < 0) return "";
  const start = index + label.length;
  let end = text.length;
  for (const other of labels) {
    if (other === label) continue;
    const next = text.indexOf(other, start);
    if (next >= 0 && next < end) end = next;
  }
  return text.slice(start, end).trim();
}

function cleanValue(value) {
  return value
    .replace(/^(Settings|Advanced Video)\s+/i, "")
    .replace(/\s+(Settings|Advanced Video)$/i, "")
    .trim();
}

async function fetchPage() {
  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; GODCHYNA-site/1.0)",
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en-US,en;q=0.9",
        },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const html = await response.text();
      if (html.length < 500) throw new Error("Unexpectedly short HTML response");
      return { url, html };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Unable to fetch settings.gg profile");
}

try {
  const { url, html } = await fetchPage();
  const text = htmlToText(html);

  const mouseRows = [
    ["Sens (In-game)", cleanValue(valueAfter(text, "Mouse Sensitivity"))],
    ["Mouse DPI", cleanValue(valueAfter(text, "DPI"))],
    ["Rate", cleanValue(valueAfter(text, "Polling rate"))],
    ["Zoom sensitivity", cleanValue(valueAfter(text, "Zoom Sensitivity Multiplier"))],
    ["m_yaw", cleanValue(valueAfter(text, "m_yaw"))],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => ({ label, value }));

  const knownMouseExtras = [
    { label: "Acceleration", value: "No" },
    { label: "Raw Input", value: "1" },
    { label: "Windows", value: "6/11" },
  ];

  const videoLabels = [
    "Brightness",
    "Scaling mode",
    "Aspect Ratio",
    "Resolution",
    "Display Mode",
    "Refresh Rate",
    "Boost Player Contrast",
    "V-Sync",
    "Multisampling Anti-Aliasing Mode",
    "Global Shadow Quality",
    "Model / Texture Detail",
    "Texture Filtering Mode",
    "Shader Detail",
    "Particle Detail",
    "Dynamic Shadows",
    "Ambient Occlusion",
    "High Dynamic Range",
    "FidelityFX Super Resolution",
    "NVIDIA Reflex Low Latency",
  ];

  const videoRows = videoLabels
    .map((label) => ({ label, value: cleanValue(valueAfter(text, label)) }))
    .filter((row) => row.value && !row.value.startsWith("Binds"));

  const viewmodel = commandRows(between(text, "Viewmodel", "HUD"));
  const hud = commandRows(between(text, "HUD", "Radar"));
  const radarRaw = between(text, "Radar", "Mouse Settings") || between(text, "Radar", "Mouse");
  const radar = commandRows(radarRaw);

  const data = {
    sourceUrl: url,
    downloadUrl: `https://gg.settings.gg/api/download/cs2/${profileId}`,
    updatedAt: new Date().toISOString(),
    tabs: {
      Mouse: [...mouseRows, ...knownMouseExtras],
      Video: videoRows,
      Viewmodel: viewmodel,
      HUD: hud,
      Radar: radar,
      Audio: [],
    },
  };

  if (!data.tabs.Mouse.length) data.tabs.Mouse = fallback.tabs.Mouse;

  await fs.writeFile(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(
    `settings.gg synced: mouse=${data.tabs.Mouse.length}, video=${data.tabs.Video.length}, viewmodel=${data.tabs.Viewmodel.length}, hud=${data.tabs.HUD.length}, radar=${data.tabs.Radar.length}`
  );
} catch (error) {
  console.warn("settings.gg sync failed; keeping fallback data:", error);
  try {
    await fs.access(outputPath);
  } catch {
    await fs.writeFile(outputPath, JSON.stringify(fallback, null, 2) + "\n", "utf8");
  }
  process.exitCode = 0;
}
