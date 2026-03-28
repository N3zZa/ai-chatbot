import { createClient } from "@/lib/db/server";
import { createUser } from "@/lib/db/queries/users";
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
  const user = authData.user;

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  if (user) {
    if (!user.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await createUser(user.id, user.email);
  }

  return NextResponse.json({ error: "Confirmation email sent" });
}
