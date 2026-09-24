import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import "./configs.css";
import { useLanguage } from "./i18n";

type ConfigsPageProps = {
  Header: ComponentType;
  Footer: ComponentType;
};

type GearItem = {
  category: string;
  name: string;
  detail?: string;
  detailEn?: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string;
};

type ConfigTab = "Mouse" | "Video" | "Viewmodel" | "HUD" | "Radar" | "Audio";
type ConfigRow = { label: string; value: string };
type SettingsPayload = {
  downloadUrl?: string;
  tabs?: Partial<Record<ConfigTab, ConfigRow[]>>;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const peripherals: GearItem[] = [
  {
    category: "MOUSE",
    name: "Razer DeathAdder V3 PRO",
    image: "ChatGPT Image 22_09_2026, 19_57_59 (6).png",
    imageWidth: "70%",
    imageHeight: "82%",
  },
  {
    category: "TECLADO",
    name: "XTRFY K4 RGB TKL",
    image: "ChatGPT Image 22_09_2026, 19_57_58 (5).png",
    imageWidth: "94%",
    imageHeight: "78%",
  },
  {
    category: "MONITOR",
    name: "BenQ XL2566X+",
    detail: "Fast TN · 400Hz",
    image: "ChatGPT Image 22_09_2026, 19_57_57 (3).png",
    imageWidth: "92%",
    imageHeight: "88%",
  },
  {
    category: "HEADSET",
    name: "HyperX Cloud II",
    detail: "7.1",
    image: "ChatGPT Image 22_09_2026, 19_57_58 (4).png",
    imageWidth: "80%",
    imageHeight: "86%",
  },
  {
    category: "MOUSEPAD",
    name: "SteelSeries QcK Heavy",
    image: "ChatGPT Image 22_09_2026, 19_57_57 (2).png",
    imageWidth: "92%",
    imageHeight: "76%",
  },
];

const pcSpecs: GearItem[] = [
  {
    category: "CPU",
    name: "Intel Core i7-14700K",
    detail: "até 5.6GHz",
    detailEn: "up to 5.6GHz",
    image: "intel-i7-14700k-14th-gen-desktop-cpu-main-1600px-v1.webp",
    imageWidth: "74%",
    imageHeight: "76%",
  },
  {
    category: "GPU",
    name: "MSI GeForce RTX 4060 Ti Gaming X Slim",
    detail: "16GB GDDR6 · DLSS 3",
    image: "ChatGPT Image 22_09_2026, 19_57_59 (7).png",
    imageWidth: "94%",
    imageHeight: "82%",
  },
  {
    category: "MOTHERBOARD",
    name: "MSI MAG Z790 TOMAHAWK",
    image: "ChatGPT Image 22_09_2026, 19_58_01 (8).png",
    imageWidth: "90%",
    imageHeight: "86%",
  },
  {
    category: "RAM",
    name: "Kingston FURY Beast DDR5",
    detail: "32GB · 2x16GB · 6400MHz",
    image: "ChatGPT Image 22_09_2026, 19_58_45.png",
    imageWidth: "92%",
    imageHeight: "78%",
  },
  {
    category: "SSD",
    name: "Samsung 990 PRO 1TB",
    detail: "M.2 2280",
    image: "ChatGPT Image 22_09_2026, 19_57_56 (1).png",
    imageWidth: "90%",
    imageHeight: "68%",
  },
];

const configTabs: ConfigTab[] = ["Mouse", "Video", "Viewmodel", "HUD", "Radar", "Audio"];

const englishConfigText: Record<string,string> = {
  "Dispositivo de áudio": "Audio device",
  "Perfil de equalização": "EQ profile",
  "Correção de perspetiva": "Perspective correction",
  "Som quando o jogo está em segundo plano": "Play audio when game is in background",
  "Modo de voz/microfone": "Voice / microphone mode",
  "Dispositivo de entrada de voz": "Voice input device",
  "Ouvir a minha própria voz": "Hear my own voice",
  "Pressionar para falar simplificado": "Streamlined push to talk",
  "Limiar de ativação do microfone": "Microphone activation threshold",
  "Silenciar música de MVP se ambas as equipas estiverem vivas": "Mute MVP music if players from both teams are alive",
  "Equalização - Competitivo": "EQ - Competitive",
  "Equalização - Casual": "EQ - Casual",
  "Equalização - Deathmatch": "EQ - Deathmatch",
  "Equalização - Corrida às Armas": "EQ - Arms Race",
  "Sim": "Yes",
  "Não": "No",
  "Desligado": "Off",
  "Pressionar para falar": "Push to talk",
  "Predefinição": "Default",
};

function englishGearCategory(category:string){
  return ({
    "TECLADO":"KEYBOARD",
    "MONITOR":"MONITOR",
    "HEADSET":"HEADSET",
    "MOUSEPAD":"MOUSEPAD",
    "MOUSE":"MOUSE",
    "CPU":"CPU",
    "GPU":"GPU",
    "MOTHERBOARD":"MOTHERBOARD",
    "RAM":"RAM",
    "SSD":"SSD",
  } as Record<string,string>)[category] ?? category;
}

function translateConfigText(value:string, lang:"pt"|"en"){
  return lang==="en" ? (englishConfigText[value] ?? value) : value;
}


const fallbackData: Record<ConfigTab, ConfigRow[]> = {
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
  Audio: [
    { label: "Dispositivo de áudio", value: "HyperX Virtual Surround Sound" },
    { label: "Perfil de equalização", value: "Natural" },
    { label: "Correção de perspetiva", value: "Sim" },
    { label: "Som quando o jogo está em segundo plano", value: "Não" },
    { label: "Modo de voz/microfone", value: "Pressionar para falar" },
    { label: "Dispositivo de entrada de voz", value: "HyperX Virtual Surround Sound" },
    { label: "Ouvir a minha própria voz", value: "Desligado" },
    { label: "Pressionar para falar simplificado", value: "Não" },
    { label: "Limiar de ativação do microfone", value: "-120" },
    { label: "Silenciar música de MVP se ambas as equipas estiverem vivas", value: "Não" },
    { label: "Equalização - Competitivo", value: "Predefinição" },
    { label: "Equalização - Casual", value: "Predefinição" },
    { label: "Equalização - Deathmatch", value: "Predefinição" },
    { label: "Equalização - Corrida às Armas", value: "Predefinição" },
  ],
};

const fallbackDownloadUrl = "https://gg.settings.gg/api/download/cs2/58493090";

function GearCard({ item }: { item: GearItem }) {
  const { lang, pick } = useLanguage();
  return (
    <article className="gear-card">
      <div className="gear-card-visual">
        {item.image ? (
          <img
            src={asset(item.image)}
            alt={item.name}
            loading="lazy"
            style={{
              position: "relative",
              zIndex: 2,
              width: item.imageWidth ?? "84%",
              height: item.imageHeight ?? "80%",
              objectFit: "contain",
              borderRadius: "9px",
              filter: "drop-shadow(0 18px 22px rgba(0,0,0,.48)) drop-shadow(0 0 16px rgba(32,243,154,.08))",
            }}
          />
        ) : (
          <>
            <div className="gear-placeholder-ring" />
            <span>{pick("IMAGEM EM BREVE","IMAGE COMING SOON")}</span>
          </>
        )}
      </div>
      <div className="gear-card-copy">
        <span className="gear-category">{lang==="en"?englishGearCategory(item.category):item.category}</span>
        <h3>{item.name}</h3>
        {item.detail && <p>{lang==="en"?(item.detailEn ?? item.detail):item.detail}</p>}
      </div>
    </article>
  );
}

function Cs2Configs() {
  const { lang, pick } = useLanguage();
  const [configTab, setConfigTab] = useState<ConfigTab>("Mouse");
  const [configData, setConfigData] = useState<Record<ConfigTab, ConfigRow[]>>(fallbackData);
  const [downloadUrl, setDownloadUrl] = useState(fallbackDownloadUrl);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(`${asset("settingsgg.json")}?v=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`settings.gg data request failed: ${response.status}`);
        const payload = (await response.json()) as SettingsPayload;
        if (cancelled) return;

        setConfigData((current) => ({
          Mouse: payload.tabs?.Mouse?.length ? payload.tabs.Mouse : current.Mouse,
          Video: payload.tabs?.Video?.length ? payload.tabs.Video : current.Video,
          Viewmodel: payload.tabs?.Viewmodel?.length ? payload.tabs.Viewmodel : current.Viewmodel,
          HUD: payload.tabs?.HUD?.length ? payload.tabs.HUD : current.HUD,
          Radar: payload.tabs?.Radar?.length ? payload.tabs.Radar : current.Radar,
          Audio: payload.tabs?.Audio?.length ? payload.tabs.Audio : current.Audio,
        }));

        if (payload.downloadUrl) setDownloadUrl(payload.downloadUrl);
      } catch (error) {
        console.warn("Unable to load settings.gg data", error);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = configData[configTab];

  return (
    <section className="cs-config-section">
      <div className="gear-section-head configs-head">
        <div>
          <span>COUNTER-STRIKE 2</span>
          <h2>CS2 CONFIG</h2>
        </div>
        <a href={downloadUrl} rel="noopener noreferrer">{pick("DESCARREGAR CONFIG","DOWNLOAD CONFIG")}</a>
      </div>

      <div className="config-subtabs" role="tablist" aria-label={pick("Parâmetros CS2","CS2 settings")}>
        {configTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={configTab === tab}
            className={configTab === tab ? "active" : ""}
            onClick={() => setConfigTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="config-panel">
        <div className="config-panel-title">
          <span>{configTab.toUpperCase()}</span>
          <strong>{configTab === "Mouse" ? "Mouse & Sensitivity" : configTab}</strong>
        </div>

        {rows.length ? (
          <div className="config-table">
            {rows.map((row) => (
              <div className="config-row" key={`${configTab}-${row.label}-${row.value}`}>
                <span>{translateConfigText(row.label,lang)}</span>
                <strong>{translateConfigText(row.value,lang)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="config-empty">
            <strong>{configTab}</strong>
            <span>{pick("Sem dados públicos disponíveis nesta categoria.","No public data available in this category.")}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ConfigsPage({ Header, Footer }: ConfigsPageProps) {
  const { lang, pick } = useLanguage();
  const [active, setActive] = useState<"gear" | "pc" | "configs">("gear");
  const items = active === "gear" ? peripherals : pcSpecs;

  return (
    <>
      <Header />
      <main className="configs-page">
        <section className="configs-intro">
          <div className="configs-hero-row">
            <h1 className="configs-title-art">
              <img src={asset("chynao.png?v=1")} alt={pick("Setup do Chynao","Chynao setup")} />
              <span className="configs-title-mobile" aria-hidden="true">
                <b>SETUP DO</b> <em>CHYNAO</em>
              </span>
            </h1>
            <div className="configs-agent" aria-hidden="true">
              <div className="configs-agent-glow" />
              <img src={asset("hero-chyna.png?v=1")} alt="" />
            </div>
          </div>

          <div className="configs-switch" role="tablist" aria-label={pick("Categorias do setup","Setup categories")}>
            <button
              type="button"
              role="tab"
              aria-selected={active === "gear"}
              className={active === "gear" ? "active" : ""}
              onClick={() => setActive("gear")}
            >
              {pick("PERIFÉRICOS","PERIPHERALS")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={active === "pc"}
              className={active === "pc" ? "active" : ""}
              onClick={() => setActive("pc")}
            >
              PC
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={active === "configs"}
              className={active === "configs" ? "active" : ""}
              onClick={() => setActive("configs")}
            >
              CONFIGS
            </button>
          </div>
        </section>

        {active === "configs" ? (
          <Cs2Configs />
        ) : (
          <section className="gear-section">
            <div className="gear-section-head">
              <div>
                <span>{active === "gear" ? "GEAR" : "HARDWARE"}</span>
                <h2>{active === "gear" ? pick("PERIFÉRICOS","PERIPHERALS") : "PC SPECS"}</h2>
              </div>
            </div>

            <div className="gear-grid">
              {items.map((item) => <GearCard key={item.category} item={item} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
