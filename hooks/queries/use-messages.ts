"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Message } from "@/types/chat.types";
import { chatService } from "@/services/chats";
import { authKeys, chatKeys } from "./keys";
import { DefaultChatTransport, FileUIPart, UIMessage } from "ai";
import { fileToBase64 } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function useMessages(chatId: string) {
  const queryClient = useQueryClient();
  const router = useRouter()
  const [input, setInput] = useState("");

  const { data: historyMessages, isLoading: isLoadingHistory } = useQuery<
    Message[]
  >({
    queryKey: chatKeys.messages(chatId),
    queryFn: () => chatService.getChatMessages(chatId),
    enabled: !!chatId,
  });

  const initialMessages = useMemo(() => {
    return (historyMessages || []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      parts: [{ type: "text", text: m.content }],
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
    transport: new DefaultChatTransport({ api: `/api/chats/${chatId}/chat` }),
    id: chatId,
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
       queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error(error);
      if (error.message.includes("limit reached")) {
        toast.error("The limit of free questions has been exhausted", {
          description: "Register to continue communication.",
          action: {
            label: "Sign Up",
            onClick: () => router.push("/auth/sign-up"),
          },
        });
      } else {
        toast.error(error.message || "Error when sending");
      }
    },
  });

  useEffect(() => {
    if (initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages as UIMessage[]);
    }
  }, [initialMessages, setMessages, messages.length]);

  const handleSubmit = async (e: React.FormEvent, files?: File[]) => {
    e.preventDefault();

    const text = input.trim();
    if (!text && !files?.length) return;

    const fileParts: FileUIPart[] | undefined = files?.length
      ? await Promise.all(
          files.map(async (file) => ({
            type: "file" as const,
            url: await fileToBase64(file),
            mediaType: file.type,
            filename: file.name,
          })),
        )
      : undefined;

    sendMessage({
      text,
      files: fileParts,
    });

    setInput("");
  };

  const sendInitialMessage = (text: string, fileParts?: FileUIPart[]) => {
    const trimmed = text.trim();
    if (trimmed || (fileParts && fileParts.length > 0)) {
      sendMessage({
        text: trimmed,
        files: fileParts,
      });
      setInput("");
    }
  };


  return {
    messages,
    isLoading: status === "submitted" || status === "streaming",
    isLoadingHistory,
    error: streamError,
    stop,
    input,
    handleInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setInput(e.target.value),
    sendMessage: handleSubmit,
    sendInitialMessage,
  };
}
