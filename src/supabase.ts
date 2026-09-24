import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gualggfxcrkknsogcrfy.supabase.co";
const supabasePublishableKey = "sb_publishable_WFNvgghbfbS-WsrY8aOMPg_7-0aLM0Y";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
