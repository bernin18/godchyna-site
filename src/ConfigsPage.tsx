import { useState } from "react";
import "./configs.css";

type ConfigsPageProps = {
  Header: () => JSX.Element;
  Footer: () => JSX.Element;
};

type GearItem = {
  category: string;
  name: string;
  detail?: string;
};

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

export default function ConfigsPage({ Header, Footer }: ConfigsPageProps) {
  const [active, setActive] = useState<"gear" | "pc">("gear");
  const items = active === "gear" ? peripherals : pcSpecs;

  return (
    <>
      <Header />
      <main className="configs-page">
        <section className="configs-intro">
          <span className="configs-kicker">SETUP DO CHYNA</span>
          <h1>CONFIGS <span>&</span> SPECS</h1>
          <p>O equipamento e o hardware que uso no dia a dia para jogar, competir e fazer stream.</p>

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
          </div>
        </section>

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
      </main>
      <Footer />
    </>
  );
}
