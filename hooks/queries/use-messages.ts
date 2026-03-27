"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Message } from "@/types/chat.types";
import { chatService } from "@/services/chats";
import { chatKeys } from "./keys";
import { DefaultChatTransport, UIMessage } from "ai";
import { fileToBase64 } from "@/lib/utils";


export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");

  const { data: historyMessages, isLoading: isLoadingHistory } = useQuery<
    Message[]
  >({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => chatService.getChatMessages(chatId),
    enabled: !!chatId,
  });

  const initialMessages = useMemo(() => {
    if (!historyMessages) return [];

    return historyMessages.map((m) => ({
      id: m.id,
      role: m.role,
      parts: [
        {
          type: "text",
          text: m.content,
          state: "done",
        },
      ],
    }));
  }, [historyMessages]);

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error: streamError,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/chats/${chatId}/chat`,
    }),
    id: chatId,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: (error) => {
      console.log(error, error.message);
      toast.error(error.message || "Ошибка при отправке сообщения");
    },
  });

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages as UIMessage[]);
    }
  }, [initialMessages, setMessages]); 


  const handleSubmit = async (e: React.FormEvent, files?: File[]) => {
    e.preventDefault();

    if (!input.trim() && (!files || files.length === 0)) return;

    let fileParts = undefined;

    if (files && files.length > 0) {
      fileParts = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);

          return {
            type: "file" as const,
            url: base64,
            mediaType: file.type,
            filename: file.name,
          };
        }),
      );
    }

    sendMessage({
      text: input.trim(),
      files: fileParts,
    });

    setInput("");
  };

  const sendText = (text: string) => {
    if (text.trim()) {
      sendMessage({ text: text.trim() });
      setInput("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setInput(e.target.value);
  };

  const isLoading = status === "submitted" || status === "streaming";

  return {
    messages,
    isLoading,
    isLoadingHistory,
    error: streamError,
    stop,
    input,
    handleInputChange,
    sendMessage: handleSubmit,
    sendText,
  };
}
