import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Instagram,
  Menu,
  MessageCircle,
  ShoppingCart,
  Tag,
  TrendingUp,
  Twitch,
  Music2,
  X,
} from "lucide-react";

const socials = {
  twitch: "https://www.twitch.tv/godchyna",
  tiktok: "https://www.tiktok.com/@godchyna",
  instagram: "https://www.instagram.com/godchyna_/",
  discord: "https://discord.gg/AfPMSzSK8",
};

const partners = [
  {
    name: "TOPSKIN",
    code: "godchyna",
    benefit: "15% em todos os depósitos",
    url: "https://topskin.net/utm/godchyna",
    tone: "orange",
  },
  {
    name: "CSGO-SKINS",
    code: "GODCHYNA",
    benefit: "10% em todos os depósitos",
    url: "https://csgo-skins.com/?ref=GODCHYNA",
    tone: "blue",
  },
] as const;

function Brand() {
  return <a className="brand" href="/">CHYNA</a>;
}

function SocialIcons() {
  return (
    <div className="social-icons">
      <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a>
      <a href={socials.twitch} target="_blank" rel="noreferrer" aria-label="Twitch"><Twitch /></a>
      <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 /></a>
      <a href={socials.discord} target="_blank" rel="noreferrer" aria-label="Discord"><MessageCircle /></a>
    </div>
  );
}

function Header() {
  const [open,setOpen]=useState(false);
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Brand />
        <nav className={open ? "nav open" : "nav"}>
          <a href="/#inicio" onClick={()=>setOpen(false)}>INÍCIO</a>
          <a href="/#parcerias" onClick={()=>setOpen(false)}>PARCERIAS</a>
          <a href="/giveaways" onClick={()=>setOpen(false)}>GIVEAWAY</a>
          <a href="/loja" onClick={()=>setOpen(false)}>LOJA</a>
        </nav>
        <div className="desktop-social"><SocialIcons /></div>
        <button className="menu-btn" onClick={()=>setOpen(v=>!v)} aria-label="Abrir menu">
          {open ? <X/> : <Menu/>}
        </button>
      </div>
    </header>
  );
}

function ServiceCard({icon:Icon, children}:{icon:any; children:string}) {
  return <div className="service-card"><Icon/><strong>{children}</strong></div>;
}

function PartnerCard({partner}:{partner:typeof partners[number]}) {
  const [copied,setCopied]=useState(false);
  async function copy(){
    await navigator.clipboard.writeText(partner.code);
    setCopied(true);
    setTimeout(()=>setCopied(false),1600);
  }
  return (
    <article className={`partner-card ${partner.tone}`}>
      <div className="partner-name">{partner.name}</div>
      <div className="partner-info">
        <div className="code-row"><span>Código: <b>{partner.code}</b></span><button onClick={copy} aria-label="Copiar código">{copied?<Check/>:<Copy/>}</button></div>
        <p>{partner.benefit}</p>
        <a className="partner-cta" href={partner.url} target="_blank" rel="noopener noreferrer sponsored">USAR CÓDIGO</a>
      </div>
    </article>
  );
}

function GiveawayCard() {
  return (
    <article className="giveaway-card">
      <div className="knife-stage">
        <img src="/ursus-marble-fade.png" alt="Ursus Marble Fade Factory New" />
        <span>CS2</span>
      </div>
      <div className="giveaway-info">
        <div className="giveaway-head">
          <div>
            <h3>Ursus | Marble Fade</h3>
            <p>Factory New / FN</p>
            <strong className="price">$150.00</strong>
          </div>
          <span className="active-pill">ATIVO</span>
        </div>
        <div className="divider"/>
        <strong className="minimum">Depósito mínimo: €10</strong>
        <p className="giveaway-copy">Faz um depósito mínimo de €10 e manda-me uma prova do depósito por Discord ou Instagram para eu saber que estás a participar.</p>
        <div className="giveaway-actions">
          <a className="participate" href="https://topskin.net/utm/godchyna" target="_blank" rel="noopener noreferrer">PARTICIPAR</a>
          <a className="discord-btn" href={socials.discord} target="_blank" rel="noopener noreferrer"><MessageCircle/> ENVIAR POR DISCORD</a>
          <a className="instagram-btn" href={socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram/> ENVIAR POR INSTAGRAM</a>
        </div>
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <Brand/>
        <div className="footer-center"><span>SKINS</span><i>•</i><span>GIVEAWAYS</span><i>•</i><span>COMUNIDADE</span></div>
        <SocialIcons/>
      </div>
      <div className="legal">
        <p>18+ | Joga com responsabilidade.</p>
        <p>Alguns links podem ser links de afiliado. GODCHYNA pode receber uma comissão sem custo adicional para ti.</p>
      </div>
    </footer>
  );
}

function Home(){
  return (
    <>
      <Header/>
      <main>
        <section id="inicio" className="hero">
          <div className="hero-glow"/>
          <div className="hero-copy">
            <p className="eyebrow">BEM-VINDO AO MUNDO DO</p>
            <h1>CHYNA</h1>
            <div className="hero-tags"><span>SKINS</span><i>•</i><span>GIVEAWAYS</span><i>•</i><span>COMUNIDADE</span></div>
            <p className="hero-text">Acompanha as streams, participa nos giveaways,<br className="desktop-break"/> usa os meus códigos e faz parte desta comunidade!</p>
            <a className="outline-cta" href="#contacto">SEGUE NAS REDES <span>›</span></a>
          </div>
          <div className="hero-character">
            <img src="/hero-chyna.png" alt="Chyna em estilo tático gaming" />
          </div>
          <div className="hero-slogan">GOOD<br/>SKINS.<br/><br/>BETTER<br/>PEOPLE.</div>
        </section>

        <section className="section skins-section">
          <div className="skins-copy">
            <h2>SKINS <span>CS2</span></h2>
            <h3>COMPRA, VENDA E TROCAS</h3>
            <p>Compro inventários, vendo skins, faço upgrades e trocas.<br/>Se tiveres interesse, fala comigo por Discord ou Instagram.</p>
          </div>
          <div className="services-wrap">
            <div className="services-grid">
              <ServiceCard icon={ShoppingCart}>COMPRO INVENTÁRIOS</ServiceCard>
              <ServiceCard icon={Tag}>COMPRO E VENDO SKINS</ServiceCard>
              <ServiceCard icon={TrendingUp}>FAÇO UPGRADES</ServiceCard>
              <ServiceCard icon={ArrowLeftRight}>FAÇO TROCAS</ServiceCard>
            </div>
            <div id="contacto" className="contact-row">
              <a className="discord-btn big" href={socials.discord} target="_blank" rel="noopener noreferrer"><MessageCircle/> FALAR NO DISCORD</a>
              <a className="instagram-btn big" href={socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram/> ENVIAR NO INSTAGRAM</a>
            </div>
          </div>
        </section>

        <section id="parcerias" className="section">
          <header className="section-title"><h2>PARCERIAS</h2><p>Usa os meus códigos e apoia o canal!</p></header>
          <div className="partners-grid">{partners.map(p=><PartnerCard key={p.name} partner={p}/>)}</div>
        </section>

        <section id="giveaway" className="section">
          <header className="section-title"><h2>GIVEAWAY EM CURSO</h2><p>Participa e tem a oportunidade de ganhar!</p></header>
          <GiveawayCard/>
        </section>
      </main>
      <Footer/>
    </>
  );
}

function GiveawaysPage(){
  return <><Header/><main className="subpage"><header className="section-title"><h1>GIVEAWAYS</h1><p>Todos os giveaways ativos aparecem nesta página.</p></header><GiveawayCard/></main><Footer/></>;
}

function StorePage(){
  return <><Header/><main className="store-page"><h1>LOJA</h1><p>EM BREVE</p></main><Footer/></>;
}

export default function App(){
  const path=window.location.pathname;
  if(path.startsWith("/giveaways")) return <GiveawaysPage/>;
  if(path.startsWith("/loja")) return <StorePage/>;
  return <Home/>;
}
