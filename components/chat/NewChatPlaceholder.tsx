"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChats } from "@/hooks/queries/use-chats";
import { ChatInput } from "./chat-input";
import { useAuth } from "@/hooks/queries/use-auth";

export const NewChatPlaceholder = () => {
  const router = useRouter();
  const { createChatAsync, isCreatingChat } = useChats();
  const { user, isLoading: isAuthLoading } = useAuth(); 
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;


    if (!user) {
      console.warn("Waiting for authorization to complete...");
      return;
    }

    try {
      const newChat = await createChatAsync({});
      router.push(`/chat/${newChat.id}?message=${encodeURIComponent(text)}`);
    } catch (error) {
      console.error("Failed to create chat", error);
    }
  };

  const isDisabled = isCreatingChat || isAuthLoading || !user;

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Start a dialogue with the AI assistant
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 py-4">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSend={handleSubmit}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};