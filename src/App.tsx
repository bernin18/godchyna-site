import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Menu,
  ShoppingCart,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import ReputationSection from "./ReputationSection";
import ConfigsPage from "./ConfigsPage";
import "./about.css";
import "./extra-pages.css";

const asset = (name: string) => `${import.meta.env.BASE_URL}${name}`;

const socials = {
  twitch: "https://www.twitch.tv/godchyna",
  tiktok: "https://www.tiktok.com/@godchyna",
  instagram: "https://www.instagram.com/godchyna_/",
  discord: "https://discord.gg/AfPMSzSK8",
  x: "https://x.com/GODChyna",
};

const socialIconUrls = {
  instagram: "https://cdn.simpleicons.org/instagram/FFFFFF",
  twitch: "https://cdn.simpleicons.org/twitch/FFFFFF",
  tiktok: "https://cdn.simpleicons.org/tiktok/FFFFFF",
  x: "https://cdn.simpleicons.org/x/FFFFFF",
  discord: "https://cdn.simpleicons.org/discord/FFFFFF",
} as const;

type SocialName = keyof typeof socialIconUrls;
type FaceitSnapshot = { level?: number; elo?: number; updatedAt?: string | null };

const profileLinks = {
  faceit: "https://www.faceit.com/pt/players/Chyna/cs2",
  steam: "https://steamcommunity.com/profiles/76561198018758818",
  x: "https://x.com/GODChyna",
  shanghaiMasters: "https://x.com/ShanghaiMasters",
};

const partners = [
  {
    name: "TOPSKIN",
    code: "godchyna",
    benefit: "15% de bónus em todos os depósitos",
    url: "https://topskin.net/utm/godchyna",
    tone: "orange",
    logo: "topskin-logo.png?v=3",
  },
  {
    name: "CSGO-SKINS",
    code: "GODCHYNA",
    benefit: "10% de bónus em todos os depósitos",
    url: "https://csgo-skins.com/?ref=GODCHYNA",
    tone: "blue",
    logo: "csgoskins-logo.png?v=3",
  },
] as const;

type Giveaway = {
  id:string;
  title:string;
  condition:string;
  price:string;
  minDeposit:string;
  image:string;
  imageAlt:string;
  provider:"topskin"|"csgoskins";
  providerName:string;
  providerLogo:string;
  url:string;
  requiresProof:boolean;
  note?:string;
};

const giveaways:Giveaway[] = [
  {
    id:"ursus-marble-fade",
    title:"Ursus | Marble Fade",
    condition:"Factory New / FN",
    price:"$150.00",
    minDeposit:"€10",
    image:"ursus-marble-fade.png",
    imageAlt:"Ursus Marble Fade Factory New",
    provider:"topskin",
    providerName:"TOPSKIN",
    providerLogo:"topskin-logo.png?v=3",
    url:"https://topskin.net/utm/godchyna",
    requiresProof:true,
    note:"Faz um depósito mínimo de €10 e manda-me uma prova do depósito por Discord ou Instagram para eu saber que estás a participar.",
  },
  {
    id:"awp-wildfire",
    title:"AWP | Wildfire",
    condition:"Field-Tested / FT",
    price:"$60.00",
    minDeposit:"€4",
    image:"wildfire.png",
    imageAlt:"AWP Wildfire Field-Tested",
    provider:"csgoskins",
    providerName:"CSGO-SKINS",
    providerLogo:"csgoskins-logo.png?v=3",
    url:"https://csgo-skins.com/?ref=GODCHYNA",
    requiresProof:false,
    note:"A participação fica registada automaticamente no CSGO-SKINS.",
  },
];

function Brand() {
  return <a className="brand" href="./">CHYNA</a>;
}

function BrandGlyph({network,className=""}:{network:SocialName;className?:string}) {
  return <img className={`brand-glyph ${className}`.trim()} src={socialIconUrls[network]} alt="" aria-hidden="true" />;
}

function SocialIcons() {
  return (
    <div className="social-icons">
      <a className="social-icon instagram" href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><BrandGlyph network="instagram" /></a>
      <a className="social-icon twitch" href={socials.twitch} target="_blank" rel="noreferrer" aria-label="Twitch"><BrandGlyph network="twitch" /></a>
      <a className="social-icon tiktok" href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok"><BrandGlyph network="tiktok" /></a>
      <a className="social-icon x" href={socials.x} target="_blank" rel="noreferrer" aria-label="X"><BrandGlyph network="x" /></a>
      <a className="social-icon discord" href={socials.discord} target="_blank" rel="noreferrer" aria-label="Discord"><BrandGlyph network="discord" /></a>
    </div>
  );
}

function StreamStatus() {
  const [status,setStatus]=useState<"checking"|"live"|"offline">("checking");

  useEffect(()=>{
    let cancelled=false;

    async function checkStream(){
      try{
        const response=await fetch(`https://decapi.me/twitch/uptime/godchyna?offline_msg=0&_=${Date.now()}`,{
          cache:"no-store",
        });
        if(!response.ok) throw new Error(`Twitch status request failed: ${response.status}`);
        const text=(await response.text()).trim().toLowerCase();
        if(cancelled) return;
        const isOffline=text==="0" || text.includes("offline") || text.includes("not live");
        setStatus(isOffline?"offline":"live");
      }catch(error){
        console.warn("Unable to refresh Twitch status",error);
      }
    }

    checkStream();
    const timer=window.setInterval(checkStream,60000);
    return ()=>{
      cancelled=true;
      window.clearInterval(timer);
    };
  },[]);

  const isLive=status==="live";
  const label=status==="checking"?"A VERIFICAR":isLive?"LIVE":"OFFLINE";

  return (
    <a
      className={`stream-status ${isLive?"live":"offline"}`}
      href={socials.twitch}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Estado da stream na Twitch: ${label}`}
      aria-live="polite"
    >
      <span className="stream-dot" />
      <span className="stream-status-text">{label}</span>
    </a>
  );
}

function Header() {
  const [open,setOpen]=useState(false);
  const path=window.location.pathname.replace(/\/$/,"");
  const isHome=!path.endsWith("/sobre")&&!path.endsWith("/configs")&&!path.endsWith("/giveaways")&&!path.endsWith("/parcerias")&&!path.endsWith("/loja");
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div
          className="brand-lockup"
          style={{
            position:"relative",
            display:"inline-flex",
            flexDirection:"row",
            alignItems:"center",
            justifyContent:"center",
            paddingTop:"8px",
          }}
        >
          <Brand />
          <span
            className="brand-beta"
            style={{
              position:"absolute",
              top:"-3px",
              left:"1px",
              margin:0,
            }}
          >
            BETA
          </span>
        </div>
        <nav className={open ? "nav open" : "nav"}>
          <a className={isHome?"active":""} href="./#inicio" onClick={()=>setOpen(false)}>INÍCIO</a>
          <a className={path.endsWith("/sobre")?"active":""} href="./sobre" onClick={()=>setOpen(false)}>SOBRE MIM</a>
          <a className={path.endsWith("/parcerias")?"active":""} href="./parcerias" onClick={()=>setOpen(false)}>PARCERIAS</a>
          <a className={path.endsWith("/giveaways")?"active":""} href="./giveaways" onClick={()=>setOpen(false)}>GIVEAWAYS</a>
          <a className={path.endsWith("/configs")?"active":""} href="./configs" onClick={()=>setOpen(false)}>SETUP & CONFIGS</a>
          <a className={path.endsWith("/loja")?"active":""} href="./loja" onClick={()=>setOpen(false)}>LOJA</a>
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
      <div className="partner-name">
        <img className="partner-logo" src={asset(partner.logo)} alt={partner.name} />
      </div>
      <div className="partner-info">
        <div className="code-row">
          <div className="code-block">
            <span className="code-label">CÓDIGO</span>
            <b>{partner.code.toUpperCase()}</b>
          </div>
          <button onClick={copy} aria-label="Copiar código">{copied?<Check/>:<Copy/>}</button>
        </div>
        <p>{partner.benefit}</p>
        <a className="partner-cta" href={partner.url} target="_blank" rel="noopener noreferrer sponsored">USAR CÓDIGO</a>
      </div>
    </article>
  );
}

function GiveawayCard({giveaway}:{giveaway:Giveaway}) {
  const isTopskin=giveaway.provider==="topskin";
  return (
    <article className={`giveaway-card giveaway-${giveaway.provider}`}>
      <div className={`knife-stage ${isTopskin?"":"wildfire-stage"}`}>
        <div className="knife-ambient-glow" />
        <div className="knife-shine" />
        <div className="knife-sparkle sparkle-1" />
        <div className="knife-sparkle sparkle-2" />
        <div className="knife-sparkle sparkle-3" />
        <img src={asset(giveaway.image)} alt={giveaway.imageAlt} />
        <span>CS2</span>
      </div>
      <div className="giveaway-info">
        <div className="giveaway-head">
          <div>
            <h3>{giveaway.title}</h3>
            <p>{giveaway.condition}</p>
            <strong className="price">{giveaway.price}</strong>
          </div>
          <div className="giveaway-provider-status">
            <span className="active-pill">ATIVO</span>
            <img className={`giveaway-provider-logo ${giveaway.provider}`} src={asset(giveaway.providerLogo)} alt={giveaway.providerName} />
          </div>
        </div>
        <div className="divider"/>
        <strong className="minimum">Depósito mínimo: {giveaway.minDeposit}</strong>
        {giveaway.note && <p className="giveaway-copy">{giveaway.note}</p>}
        <div className={`giveaway-actions ${giveaway.requiresProof?"":"single-action"}`}>
          <a className="participate" href={giveaway.url} target="_blank" rel="noopener noreferrer sponsored">PARTICIPAR</a>
          {giveaway.requiresProof && <>
            <a className="discord-btn" href={socials.discord} target="_blank" rel="noopener noreferrer"><BrandGlyph network="discord" /> ENVIAR POR DISCORD</a>
            <a className="instagram-btn" href={socials.instagram} target="_blank" rel="noopener noreferrer"><BrandGlyph network="instagram" /> ENVIAR POR INSTAGRAM</a>
          </>}
        </div>
      </div>
    </article>
  );
}

function HomeGiveawayRotator(){
  const [activeIndex,setActiveIndex]=useState(0);

  useEffect(()=>{
    if(giveaways.length<2) return;
    const timer=window.setInterval(()=>{
      setActiveIndex(current=>(current+1)%giveaways.length);
    },5000);
    return ()=>window.clearInterval(timer);
  },[]);

  const activeGiveaway=giveaways[activeIndex];
  return (
    <div className="home-giveaway-rotator">
      <div key={activeGiveaway.id} className="home-giveaway-slide">
        <GiveawayCard giveaway={activeGiveaway}/>
      </div>
      <div className="giveaway-rotator-dots" aria-label="Selecionar giveaway">
        {giveaways.map((giveaway,index)=>(
          <button
            key={giveaway.id}
            type="button"
            className={index===activeIndex?"active":""}
            onClick={()=>setActiveIndex(index)}
            aria-label={`Mostrar giveaway ${giveaway.title}`}
          />
        ))}
      </div>
    </div>
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
      </div>
    </footer>
  );
}

function ProfileButton({kind,label,url}:{kind:"faceit"|"steam"|"x";label:string;url:string}){
  const iconUrl=kind==="faceit"
    ? "https://cdn.simpleicons.org/faceit/FF5500"
    : kind==="steam"
      ? "https://cdn.simpleicons.org/steam/FFFFFF"
      : "https://cdn.simpleicons.org/x/FFFFFF";
  return (
    <a className={`about-profile-btn ${kind}`} href={url} target="_blank" rel="noopener noreferrer">
      <img src={iconUrl} alt="" aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}

function FaceitProfileButton(){
  const [stats,setStats]=useState<FaceitSnapshot>({level:10});

  useEffect(()=>{
    let cancelled=false;
    async function refresh(){
      try{
        const response=await fetch(`${asset("faceit.json")}?v=${Date.now()}`,{cache:"no-store"});
        if(!response.ok) throw new Error(`FACEIT snapshot request failed: ${response.status}`);
        const payload=(await response.json()) as FaceitSnapshot;
        if(!cancelled) setStats(payload);
      }catch(error){
        console.warn("Unable to refresh FACEIT profile snapshot",error);
      }
    }
    refresh();
    const timer=window.setInterval(refresh,60000);
    return ()=>{
      cancelled=true;
      window.clearInterval(timer);
    };
  },[]);

  return (
    <a className="about-profile-btn faceit faceit-profile-btn" href={profileLinks.faceit} target="_blank" rel="noopener noreferrer" aria-label={`FACEIT nível ${stats.level ?? 10}, ${stats.elo ?? "—"} ELO`}>
      <span className="faceit-profile-main">
        <img src="https://cdn.simpleicons.org/faceit/FF5500" alt="" aria-hidden="true" />
        <span>FACEIT</span>
      </span>
      <span className="faceit-live-stats" aria-live="polite">
        <b className="faceit-level-badge">{stats.level ?? 10}</b>
        <span className="faceit-elo">{typeof stats.elo==="number"?stats.elo.toLocaleString("en-US"):"—"}<small>ELO</small></span>
      </span>
    </a>
  );
}

function AboutPage(){
  return (
    <>
      <Header/>
      <main className="about-page">
        <section className="about-hero">
          <img src={asset("chyna foto.png?v=1")} alt="Gonçalo Chyna Galveia" />
        </section>

        <section className="about-content">
          <div className="about-story">
            <span className="about-kicker">A HISTÓRIA</span>
            <h1>DO 1.6 ÀS STREAMS</h1>
            <p>A minha história no Counter-Strike começou em 2009, ainda no CS 1.6. Desde aí passei pelo CS:GO e, mais recentemente, pelo CS2, mantendo sempre o lado competitivo como uma parte importante da minha vida.</p>
            <p>Ao longo dos anos passei por várias equipas em Portugal e na Suíça e acabei também por criar os <a href={profileLinks.shanghaiMasters} target="_blank" rel="noopener noreferrer">ShanghaiMasters</a>, um projeto que nasceu da mesma vontade de competir e evoluir dentro do jogo.</p>
            <p>Durante muito tempo tentei transformar o Counter-Strike numa carreira. As diferentes fases da vida acabaram por levar-me por outros caminhos, mas nunca deixei realmente o jogo para trás.</p>
            <p>Hoje estou mais focado nas <strong>streams</strong>, em continuar a jogar CS a um bom nível e, desde 2024, também no <strong>mercado de skins</strong>, área onde tenho vindo a ganhar cada vez mais experiência.</p>
            <p className="about-closing">No fim, muita coisa mudou desde 2009 — mas a paixão pelo Counter-Strike continua exatamente a mesma.</p>
          </div>

          <aside className="about-side">
            <div className="about-profiles">
              <span className="about-kicker">PERFIS</span>
              <div className="about-profile-grid">
                <FaceitProfileButton/>
                <ProfileButton kind="steam" label="STEAM" url={profileLinks.steam}/>
                <ProfileButton kind="x" label="GODCHYNA" url={profileLinks.x}/>
                <ProfileButton kind="x" label="SHANGHAIMASTERS" url={profileLinks.shanghaiMasters}/>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer/>
    </>
  );
}

function Home(){
  return (
    <>
      <Header/>
      <main>
        <section
          id="inicio"
          className="hero"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(4,11,13,.98) 0%,rgba(4,12,14,.92) 31%,rgba(4,12,14,.62) 49%,rgba(3,8,10,.20) 72%,rgba(3,8,10,.44) 100%), url("${asset("hero-green-bg.png?v=3")}")`,
          }}
        >
          <div className="hero-glow"/>
          <div className="hero-copy">
            <p className="eyebrow">BEM-VINDO AO MUNDO DO</p>
            <h1>CHYNA</h1>
            <div className="hero-tags"><span>SKINS</span><i>•</i><span>GIVEAWAYS</span><i>•</i><span>COMUNIDADE</span></div>
            <p className="hero-text">Acompanha as streams, participa nos giveaways,<br className="desktop-break"/> usa os meus códigos e faz parte desta comunidade!</p>
            <div className="hero-cta-row">
              <a
                className="hero-social-btn twitch-btn"
                href={socials.twitch}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrandGlyph network="twitch" />
                TWITCH
              </a>
              <a
                className="hero-social-btn tiktok-btn"
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrandGlyph network="tiktok" />
                TIKTOK
              </a>
            </div>
            <StreamStatus />
          </div>
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
              <ServiceCard icon={Tag}>VENDO SKINS</ServiceCard>
              <ServiceCard icon={TrendingUp}>FAÇO UPGRADES</ServiceCard>
              <ServiceCard icon={ArrowLeftRight}>FAÇO TROCAS</ServiceCard>
            </div>
            <div id="contacto" className="contact-row">
              <a className="discord-btn big" href={socials.discord} target="_blank" rel="noopener noreferrer"><BrandGlyph network="discord" /> FALAR NO DISCORD</a>
              <a className="instagram-btn big" href={socials.instagram} target="_blank" rel="noopener noreferrer"><BrandGlyph network="instagram" /> FALAR NO INSTAGRAM</a>
            </div>
          </div>
        </section>

        <ReputationSection />

        <section id="parcerias" className="section">
          <header className="section-title"><h2>PARCERIAS</h2><p>Usa os meus códigos e apoia o canal!</p></header>
          <div className="partners-grid">{partners.map(p=><PartnerCard key={p.name} partner={p}/>)}</div>
        </section>

        <section id="giveaway" className="section">
          <header className="section-title"><h2>GIVEAWAYS EM CURSO</h2><p>Participa e tem a oportunidade de ganhar!</p></header>
          <HomeGiveawayRotator/>
        </section>
      </main>
      <Footer/>
    </>
  );
}

function PartnersPage(){
  return <><Header/><main className="subpage partners-page"><header className="section-title"><h1>PARCERIAS</h1><p>Usa os meus códigos e apoia o canal!</p></header><div className="partners-grid">{partners.map(p=><PartnerCard key={p.name} partner={p}/>)}</div></main><Footer/></>;
}

function GiveawaysPage(){
  return (
    <>
      <Header/>
      <main className="subpage giveaways-page">
        <header className="section-title"><h1>GIVEAWAYS</h1><p>Todos os giveaways ativos aparecem nesta página.</p></header>
        <div className="giveaways-page-list">
          {giveaways.map(giveaway=><GiveawayCard key={giveaway.id} giveaway={giveaway}/>)}
        </div>
      </main>
      <Footer/>
    </>
  );
}

function StorePage(){
  return <><Header/><main className="store-page"><h1>LOJA</h1><p>EM BREVE</p></main><Footer/></>;
}

export default function App(){
  const path = window.location.pathname.replace(/\/$/, "");
  if(path.endsWith("/sobre")) return <AboutPage/>;
  if(path.endsWith("/configs")) return <ConfigsPage Header={Header} Footer={Footer}/>;
  if(path.endsWith("/parcerias")) return <PartnersPage/>;
  if(path.endsWith("/giveaways")) return <GiveawaysPage/>;
  if(path.endsWith("/loja")) return <StorePage/>;
  return <Home/>;
}
