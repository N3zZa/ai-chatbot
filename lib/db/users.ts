import { ANON_MSG_LIMIT } from "@/constants";
import { supabaseAdmin } from "./client";

export async function getUserWithLimits(userId: string) {
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("is_anonymous, free_messages_count")
    .eq("id", userId)
    .single();

  const isAnon = dbUser?.is_anonymous ?? true;
  const remaining = dbUser?.free_messages_count ?? ANON_MSG_LIMIT;

  return {
    isAnonymous: isAnon,
    remaining: isAnon ? Math.max(0, remaining) : 999,
    canAsk: isAnon ? remaining > 0 : true,
  };
}

export async function createUser(userId: string, email: string) {
  const { error } = await supabaseAdmin.from("users").insert({
    id: userId,
    email,
    is_anonymous: false,
    free_messages_count: 0,
  });

  if (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function decrementFreeMessagesCount(userId: string) {
  const { error } = await supabaseAdmin.rpc("decrement_free_messages", {
    user_id: userId,
  });
  if (error) throw error;
}

export async function getRemainingFreeMessages(
  userId: string,
): Promise<number> {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("is_anonymous, free_messages_count")
    .eq("id", userId)
    .single();

  if (!user || !user.is_anonymous) return 999;
  return Math.max(0, user.free_messages_count ?? ANON_MSG_LIMIT);
}

export async function canCreateChat(userId: string): Promise<boolean> {
  const remaining = await getRemainingFreeMessages(userId);
  return remaining > 0;
}
