import { supabase } from "@/lib/infra/supabase";

export async function getDetailJournal(
  journalId: string
) {
  const { data, error } = await supabase
    .from("trade_journal")
    .select("*")
    .eq("id", journalId)
    .single();

  if (error) throw error;

  return data;
}