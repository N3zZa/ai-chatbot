import { supabaseAdmin } from "@/lib/db/client"; // Твой админский клиент
import { createClient } from "@/lib/db/server"; // Твой SSR клиент (Anon)
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/confirm`,
    },
  });

  if (authError)
    return NextResponse.json({ error: authError.message }, { status: 400 });

  if (authData.user) {
    const { error: dbError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        email: authData.user.email,
        is_anonymous: false,
        free_messages_count: 0,
      },
    ]);

    if (dbError) console.error("Error adding user:", dbError);
  }

  return NextResponse.json({ message: "Confirmation email sent" });
}
