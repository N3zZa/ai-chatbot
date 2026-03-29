import { Chat } from "@/types/chat.types";
import { supabaseAdmin } from "../admin";

export async function getUserChats(userId: string): Promise<Chat[]> {
  const { data, error } = await supabaseAdmin
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    throw new Error("Failed to fetch chats");
  }

  return data ?? [];
}

export async function createChat(
  userId: string,
  title?: string,
): Promise<Chat> {
  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({ user_id: userId, title: title || "New chat" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChatTitle(chatId: string, title: string) {
  const { error } = await supabaseAdmin
    .from("chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", chatId);

  if (error) throw error;
}

export async function checkChatOwnership(
  chatId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("chats")
    .select("id")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  return !!data && !error;
}

export async function deleteChat(chatId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", userId);

  if (error) throw error;
}
