import { createClient } from "@/lib/db/server";

export async function POST() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return Response.json({ success: true });
}
