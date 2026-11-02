import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function getUserAvatar(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  return meta.avatar_url ?? meta.picture ?? meta.profile_image_url ?? "";
}

export function getUserDisplayName(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  return (
    meta.display_name ??
    meta.full_name ??
    meta.name ??
    meta.preferred_username ??
    meta.user_name ??
    meta.nickname ??
    user.email?.split("@")[0] ??
    "Viewer"
  );
}

export function getTwitchLogin(user: User | null) {
  if (!user) return "";
  const meta = user.user_metadata ?? {};
  return meta.user_name ?? meta.preferred_username ?? meta.nickname ?? "";
}

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export async function signInWithTwitch(returnPath = "perfil") {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedPath = returnPath.replace(/^\\/+/, "");
  const redirectTo = new URL(`${base}${normalizedPath}`, window.location.origin).toString();

  return supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
