import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/db/auth";
import { ANON_MSG_LIMIT } from "@/constants";
import { getUserWithLimits } from "@/lib/db/users";

export async function GET() {
  const user = await getServerUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      canAsk: true,
      remainingFree: ANON_MSG_LIMIT,
    });
  }

  const limits = await getUserWithLimits(user.id);

  return NextResponse.json({
    user,
    ...limits,
  });
}
