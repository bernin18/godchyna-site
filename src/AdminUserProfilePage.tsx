import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, ShieldCheck, UserRound } from "lucide-react";
import { useAuthSession } from "./auth";
import { useLanguage } from "./i18n";
import { supabase } from "./supabase";
import "./admin-user-profile.css";

type ProfileRow = {
  id:string;
  display_name:string|null;
  avatar_url:string|null;
  twitch_login:string|null;
  steam_id:string|null;
  steam_display_name:string|null;
  trade_url:string|null;
};

export default function AdminUserProfilePage({Header,Footer}:{Header:React.ComponentType;Footer:React.ComponentType}) {
  const { pick } = useLanguage();
  const { user, loading: authLoading } = useAuthSession();
  const [profile,setProfile] = useState<ProfileRow|null>(null);
  const [state,setState] = useState<"loading"|"ready"|"denied"|"missing">("loading");
  const targetUserId = typeof window!=="undefined" ? new URLSearchParams(window.location.search).get("user") : null;

  useEffect(()=>{
    if(authLoading) return;
    if(!user || !targetUserId){ setState("denied"); return; }

    let cancelled=false;
    (async()=>{
      const role=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
      if(cancelled) return;
      if(role.error || role.data?.role!=="admin"){ setState("denied"); return; }

      const result=await supabase
        .from("profiles")
        .select("id,display_name,avatar_url,twitch_login,steam_id,steam_display_name,trade_url")
        .eq("id",targetUserId)
        .maybeSingle();

      if(cancelled) return;
      if(result.error || !result.data){ setState("missing"); return; }
      setProfile(result.data as ProfileRow);
      setState("ready");
    })();

    return()=>{ cancelled=true; };
  },[authLoading,user,targetUserId]);

  const name=profile?.display_name || profile?.twitch_login || pick("Utilizador","User");

  return (
    <>
      <Header/>
      <main className="admin-user-page">
        {state==="loading" ? (
          <section className="admin-user-state"><span className="admin-user-loader"/><p>{pick("A carregar…","Loading…")}</p></section>
        ) : state==="denied" ? (
          <section className="admin-user-state"><ShieldCheck/><h1>{pick("ACESSO RESTRITO","RESTRICTED ACCESS")}</h1><p>{pick("Apenas administradores podem ver este perfil.","Only administrators can view this profile.")}</p></section>
        ) : state==="missing" || !profile ? (
          <section className="admin-user-state"><UserRound/><h1>{pick("UTILIZADOR NÃO ENCONTRADO","USER NOT FOUND")}</h1></section>
        ) : (
          <section className="admin-user-shell">
            <a className="admin-user-back" href={`${import.meta.env.BASE_URL}resgates`}><ArrowLeft/>{pick("VOLTAR AOS RESGATES","BACK TO REDEMPTIONS")}</a>

            <header className="admin-user-hero">
              <div className="admin-user-avatar">
                {profile.avatar_url ? <img src={profile.avatar_url} alt={name}/> : <span>{name.slice(0,1).toUpperCase()}</span>}
              </div>
              <div>
                <span>{pick("PERFIL DO CLIENTE","CUSTOMER PROFILE")}</span>
                <h1>{name}</h1>
                {profile.twitch_login && <p>@{profile.twitch_login}</p>}
              </div>
            </header>

            <div className="admin-user-grid">
              <article className="admin-user-panel">
                <span>TWITCH</span>
                <strong>{profile.twitch_login ? `@${profile.twitch_login}` : "—"}</strong>
              </article>
              <article className="admin-user-panel">
                <span>STEAM</span>
                {profile.steam_id ? (
                  <a
                    className="admin-user-steam-profile-link"
                    href={`https://steamcommunity.com/profiles/${profile.steam_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <strong>{profile.steam_display_name || profile.steam_id}</strong>
                    <ExternalLink />
                  </a>
                ) : (
                  <strong>{pick("Não ligada","Not connected")}</strong>
                )}
              </article>
            </div>

            <article className={`admin-user-trade ${profile.trade_url ? "ready" : "missing"}`}>
              <span>STEAM TRADE URL</span>
              <h2>{profile.trade_url ? pick("PRONTO PARA ENTREGA","READY FOR DELIVERY") : pick("NÃO CONFIGURADO","NOT SET")}</h2>
              {profile.trade_url ? (
                <div className="admin-user-trade-url">{profile.trade_url}</div>
              ) : (
                <p>{pick("Este utilizador ainda não guardou um Trade URL.","This user has not saved a Trade URL yet.")}</p>
              )}
            </article>
          </section>
        )}
      </main>
      <Footer/>
    </>
  );
}
