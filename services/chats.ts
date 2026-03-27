import { Chat, Message } from "@/types/chat.types";

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const res = await fetch("/api/chats");
    if (!res.ok) throw new Error("Failed to fetch chats");
    return res.json();
  },

  async createChat(title?: string): Promise<Chat> {
    const res = await fetch("/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create chat");
    return res.json();
  },

  async deleteChat(chatId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete chat");
    return res.json();
  },

  async updateChatTitle(
    chatId: string,
    title: string,
  ): Promise<{ success: boolean }> {
    const res = await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to update chat title");
    return res.json();
  },

  async getChatMessages(chatId: string): Promise<Message[]> {
    const res = await fetch(`/api/chats/${chatId}/messages`);
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },
};
