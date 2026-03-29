import { createClient } from "@/lib/db/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign-in error:", error.message);
    return NextResponse.json(
      { error: "Couldn't create anonymous session" },
      { status: 500 },
    );
  }
  console.log(data.user);
  return NextResponse.json({ user: data.user });
}
