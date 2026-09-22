import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import "./configs.css";

type ConfigsPageProps = {
  Header: ComponentType;
  Footer: ComponentType;
};

type GearItem = {
  category: string;
  name: string;
  detail?: string;
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
    image: "chu_t_razer_deathadder_v3_pro_wireless_8khz.png",
    imageWidth: "68%",
    imageHeight: "78%",
  },
  {
    category: "TECLADO",
    name: "XTRFY K4 RGB TKL",
    image: "XG-K4-RGB-TKL-R-US1.webp",
    imageWidth: "92%",
    imageHeight: "72%",
  },
  {
    category: "MONITOR",
    name: "BenQ XL2566X+",
    detail: "Fast TN · 400Hz",
    image: "XL2566X 01.jpg",
    imageWidth: "88%",
    imageHeight: "82%",
  },
  {
    category: "HEADSET",
    name: "HyperX Cloud II",
    detail: "7.1",
    image: "hyperx_cloud_ii_red_3_detachable.webp",
    imageWidth: "76%",
    imageHeight: "82%",
  },
  {
    category: "MOUSEPAD",
    name: "SteelSeries QcK Heavy",
    image: "549729-02.webp",
    imageWidth: "88%",
    imageHeight: "68%",
  },
];

const pcSpecs: GearItem[] = [
  {
    category: "CPU",
    name: "Intel Core i7-14700K",
    detail: "até 5.6GHz",
    image: "intel-i7-14700k-14th-gen-desktop-cpu-main-1600px-v1.webp",
    imageWidth: "74%",
    imageHeight: "76%",
  },
  {
    category: "GPU",
    name: "MSI GeForce RTX 4060 Ti Gaming X Slim",
    detail: "16GB GDDR6 · DLSS 3",
    image: "Karta-graficzna-MSI-GeForce-RTX-4060-Ti-Gaming-X-Slim-16GB-DLSS-3-front-box.jpg",
    imageWidth: "92%",
    imageHeight: "76%",
  },
  {
    category: "MOTHERBOARD",
    name: "MSI MAG Z790 TOMAHAWK",
    image: "1_36.webp",
    imageWidth: "78%",
    imageHeight: "80%",
  },
  { category: "RAM", name: "32GB DDR5", detail: "2x16GB · 6400MHz" },
  {
    category: "SSD",
    name: "Samsung 990 PRO 1TB",
    detail: "M.2 2280",
    image: "612Z9aQdaSL._SL400_.jpg",
    imageWidth: "78%",
    imageHeight: "66%",
  },
];

const configTabs: ConfigTab[] = ["Mouse", "Video", "Viewmodel", "HUD", "Radar", "Audio"];

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
            <span>IMAGEM EM BREVE</span>
          </>
        )}
      </div>
      <div className="gear-card-copy">
        <span className="gear-category">{item.category}</span>
        <h3>{item.name}</h3>
        {item.detail && <p>{item.detail}</p>}
      </div>
    </article>
  );
}

function Cs2Configs() {
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
        <a href={downloadUrl} rel="noopener noreferrer">DOWNLOAD CONFIG</a>
      </div>

      <div className="config-subtabs" role="tablist" aria-label="Parâmetros CS2">
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
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="config-empty">
            <strong>{configTab}</strong>
            <span>Sem dados públicos disponíveis nesta categoria.</span>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ConfigsPage({ Header, Footer }: ConfigsPageProps) {
  const [active, setActive] = useState<"gear" | "pc" | "configs">("gear");
  const items = active === "gear" ? peripherals : pcSpecs;

  return (
    <>
      <Header />
      <main className="configs-page">
        <section className="configs-intro">
          <span className="configs-kicker">SETUP DO CHYNA</span>
          <h1>SETUP <span>&</span> CONFIGS</h1>
          <p>O equipamento, o hardware e as configurações que uso no dia a dia para jogar, competir e fazer stream.</p>

          <div className="configs-switch" role="tablist" aria-label="Categorias do setup">
            <button
              type="button"
              role="tab"
              aria-selected={active === "gear"}
              className={active === "gear" ? "active" : ""}
              onClick={() => setActive("gear")}
            >
              PERIFÉRICOS
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
                <h2>{active === "gear" ? "PERIFÉRICOS" : "PC SPECS"}</h2>
              </div>
              <p>{active === "gear" ? "O setup que está em cima da secretária." : "A máquina por trás das streams e do CS2."}</p>
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
