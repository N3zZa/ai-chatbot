import { createClient } from "@/lib/db/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/chat";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=No_valid_token_or_code_found`,
  );
}
