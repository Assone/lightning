import { createClient } from "@supabase/supabase-js";
import { env } from "@lightning/env/web";

export const supabaseClient = createClient(
	env.VITE_SUPABASE_URL,
	env.VITE_SUPABASE_ANON_KEY
);
