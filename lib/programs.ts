import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import type { Availability, Program } from "@/lib/types";

export async function getPublicPrograms(): Promise<Program[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("date", { ascending: true });
  if (error) {
    console.error("getPublicPrograms:", error.message);
    return [];
  }
  return (data ?? []) as Program[];
}

export async function getPublicAvailability(): Promise<Availability[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("availability").select("*");
  if (error) {
    console.error("getPublicAvailability:", error.message);
    return [];
  }
  return (data ?? []) as Availability[];
}

export async function getPublicProgramById(id: string): Promise<Program | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Program;
}