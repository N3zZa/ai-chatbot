"use client";

import { Message } from "./Message";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { useMessages } from "@/hooks/queries/use-messages";
import { useRouter, useSearchParams } from "next/navigation";

type ChatProps = {
  chatId: string;
};

export const Chat = ({ chatId }: ChatProps) => {
  const searchParams = useSearchParams();
  const router = useRouter()
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

   const handleSubmit = (e: React.FormEvent, files?: File[]) => {
     e.preventDefault();
     if (!input.trim() && (!files || files.length === 0)) return;
     sendMessage(e, files);
   };


  return (
    <div className="flex flex-col flex-1 w-full overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full px-4 py-6 space-y-6 pb-20">
          {isLoadingHistory && (
            <div className="absolute top-1/2 left-1/2 tranform -translate-x-1/2 -translate-y-1/2">
              Loading...
            </div>
          )}
          {messages.length === 0 && !isLoadingHistory && (
            <div className="h-[50vh] flex items-center justify-center text-muted-foreground">
              Начните диалог с AI ассистентом
            </div>
          )}

          {messages.map((msg) => (
            <Message key={msg.id} message={msg} />
          ))}

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
              Остановить генерацию
            </button>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSend={handleSubmit}
          disabled={isLoading || isLoadingHistory}
        />
      </div>
    </div>
  );
};
