import { Message } from "@/types/chat.types";
import { supabaseAdmin } from "./client";

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string,
): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({ chat_id: chatId, role, content, image_url: imageUrl })
    .select()
    .single();

  if (error) throw error;
  return data;
}
