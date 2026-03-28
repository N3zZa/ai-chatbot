import { ANON_MSG_LIMIT } from "@/constants";
import { supabaseAdmin } from "../admin";
import { UserResponse } from "@/types/auth.types";

export async function getUserWithLimits(userId: string) {
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("is_anonymous, free_messages_count")
    .eq("id", userId)
    .single<Omit<UserResponse, "id" | "email">>();


  if (!dbUser) {
    return { isAnonymous: true, remaining: ANON_MSG_LIMIT, canAsk: true };
  }

  const isAnon = dbUser?.is_anonymous ?? true;
  const remaining = dbUser?.free_messages_count ?? ANON_MSG_LIMIT;

  return {
    isAnonymous: isAnon,
    remaining: isAnon ? Math.max(0, remaining) : 999,
    canAsk: isAnon ? remaining > 0 : true,
  };
}


export async function ensureUserExists(userId: string, isAnonymous: boolean, email?: string) {
  const { data: existingUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", userId)
    .single<Pick<UserResponse, "id">>();

  if (!existingUser) {
    const { error } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email || null,
      is_anonymous: isAnonymous,
      free_messages_count: isAnonymous ? 3 : 0,
    });

    if (error) {
      console.error("Error ensuring user exists:", error);
      throw error;
    }
  }
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

export async function canCreateChat(userId: string): Promise<boolean> {
  const {canAsk} = await getUserWithLimits(userId);
  return canAsk;
}


