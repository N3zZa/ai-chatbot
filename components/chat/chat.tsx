"use client";

import { Message } from "./Message";
import { ScrollArea } from "../ui/scroll-area";
import { use, useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { useMessages } from "@/hooks/queries/use-messages";
import { useRouter, useSearchParams } from "next/navigation";

type ChatProps = {
  params: Promise<{ chatId: string }>;
};

export const Chat = ({ params }: ChatProps) => {
  const { chatId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    isLoadingHistory,
    stop,
    sendMessage,
    sendText,
  } = useMessages(chatId);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const size_close_down = 100;
    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      size_close_down;

    if (isScrolledToBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const pendingMsg = searchParams.get("message");
    if (pendingMsg && !isLoadingHistory && messages.length === 0) {
      router.replace(`/chat/${chatId}`);
      sendText(pendingMsg);
    }
  }, [
    searchParams,
    router,
    chatId,
    sendText,
    isLoadingHistory,
    messages.length,
  ]);

  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="mx-auto w-full px-4 py-6 space-y-6 pb-20">
          {isLoadingHistory && (
            <div className="absolute top-1/2 left-1/2 tranform -translate-x-1/2 -translate-y-1/2">
              Loading...
            </div>
          )}
          {messages.length === 0 && !isLoadingHistory && (
            <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
              Start a dialogue with the AI assistant
            </div>
          )}

          {messages.map((message, index) => {
            const isCurrentlyStreaming =
              message.role === "assistant" &&
              index === messages.length - 1 &&
              isLoading;

            return (
              <Message
                key={message.id}
                message={message}
                isStreaming={isCurrentlyStreaming}
              />
            );
          })}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="mx-auto w-full max-w-5xl px-4 py-4 space-y-2">
        {isLoading && (
          <div className="flex justify-center">
            <button
              onClick={stop}
              className="text-xs flex items-center gap-2 px-3 py-1 border rounded-full hover:bg-muted transition-colors"
            >
              <div className="w-2 h-2 bg-red-500 rounded-sm" />
              Stop generating
            </button>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSend={sendMessage}
          disabled={isLoading || isLoadingHistory}
        />
      </div>
    </div>
  );
};
