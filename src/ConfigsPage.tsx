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
};

type ConfigTab = "Mouse" | "Video" | "Viewmodel" | "HUD" | "Radar" | "Audio";
type ConfigRow = { label: string; value: string };
type SettingsPayload = {
  downloadUrl?: string;
  tabs?: Partial<Record<ConfigTab, ConfigRow[]>>;
};

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const peripherals: GearItem[] = [
  { category: "MOUSE", name: "Razer DeathAdder V3 PRO" },
  { category: "TECLADO", name: "XTRFY K4 RGB TKL" },
  { category: "MONITOR", name: "BenQ XL2566X+", detail: "Fast TN · 400Hz" },
  { category: "HEADSET", name: "HyperX Cloud II", detail: "7.1" },
  { category: "MOUSEPAD", name: "SteelSeries QcK Heavy" },
];

const pcSpecs: GearItem[] = [
  { category: "CPU", name: "Intel Core i7-14700K", detail: "até 5.6GHz" },
  { category: "GPU", name: "MSI GeForce RTX 4060 Ti Gaming X Slim", detail: "16GB GDDR6 · DLSS 3" },
  { category: "MOTHERBOARD", name: "MSI MAG Z790 TOMAHAWK" },
  { category: "RAM", name: "32GB DDR5", detail: "2x16GB · 6400MHz" },
  { category: "SSD", name: "Samsung 990 PRO 1TB", detail: "M.2 2280" },
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
  Audio: [],
};

const fallbackDownloadUrl = "https://gg.settings.gg/api/download/cs2/58493090";

function GearCard({ item }: { item: GearItem }) {
  return (
    <article className="gear-card">
      <div className="gear-card-visual" aria-hidden="true">
        <div className="gear-placeholder-ring" />
        <span>IMAGEM EM BREVE</span>
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
          Video: payload.tabs?.Video ?? current.Video,
          Viewmodel: payload.tabs?.Viewmodel ?? current.Viewmodel,
          HUD: payload.tabs?.HUD ?? current.HUD,
          Radar: payload.tabs?.Radar ?? current.Radar,
          Audio: payload.tabs?.Audio ?? current.Audio,
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
