import { defaultUrl } from "@/constants";
import { createClient } from "@/lib/db/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${defaultUrl}/auth/confirm?next=/auth/update-password`,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ success: true });
}
