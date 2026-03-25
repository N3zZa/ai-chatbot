import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db/client";
import { ANON_MSG_LIMIT } from "@/constants";

export async function GET() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      canAsk: true,
      remainingFree: ANON_MSG_LIMIT,
    });
  }

  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("is_anonymous, free_messages_count")
    .eq("id", user.id)
    .single();

    const isAnon = dbUser?.is_anonymous ?? true;
    const count = dbUser?.free_messages_count ?? 0;

  return NextResponse.json({
    user,
    isAnonymous: isAnon,
    remaining: isAnon ? Math.max(0, ANON_MSG_LIMIT - count) : 999,
    canAsk: isAnon ? count < ANON_MSG_LIMIT : true,
  });
}
