import { createClient } from "@supabase/supabase-js";

export type PublicEventShareData = {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  cover_image: string | null;
  bride_name: string | null;
  groom_name: string | null;
  event_type: string;
  is_published: boolean;
};

export async function getPublicEventBySlug(slug: string): Promise<PublicEventShareData | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !slug) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("events")
    .select("id, slug, name, date, time, cover_image, bride_name, groom_name, event_type, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  return data as PublicEventShareData;
}

