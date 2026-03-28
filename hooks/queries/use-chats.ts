"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chat } from "@/types/chat.types";
import { chatService } from "@/services/chats";
import { chatKeys } from "./keys";
import { useEffect } from "react";
import { supabaseRealtime } from "@/lib/db/client";

export function useChats(userId?: string, initialChats?: Chat[]) {
  const queryClient = useQueryClient();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery<Chat[]>({
    queryKey: chatKeys.lists(),
    queryFn: chatService.getChats,
    initialData: initialChats,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabaseRealtime
      .channel(`sync-chats-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // console.log("Change received", payload);
          queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
          if (payload.eventType === "DELETE") {
            queryClient.removeQueries({
              queryKey: chatKeys.detail(payload.old.id),
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabaseRealtime.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const createChatMutation = useMutation({
    mutationFn: ({ title }: { title?: string }) =>
      chatService.createChat(title),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      toast.success("Новый чат создан");
      return newChat;
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не удалось создать чат");
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: chatService.deleteChat,
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.removeQueries({ queryKey: chatKeys.messages(chatId) });
      toast.success("Чат удалён");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не удалось удалить чат");
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      chatService.updateChatTitle(chatId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не удалось обновить название");
    },
  });

  return {
    chats: chats ?? [],
    isLoading,
    error,

    createChat: createChatMutation.mutate,
    deleteChat: deleteChatMutation.mutate,
    updateChatTitle: updateTitleMutation.mutate,
    // async
    createChatAsync: createChatMutation.mutateAsync,
    deleteChatAsync: deleteChatMutation.mutateAsync,
    updateChatTitleAsync: updateTitleMutation.mutateAsync,
    // loaders
    isCreatingChat: createChatMutation.isPending,
    isDeletingChat: deleteChatMutation.isPending,
    isUpdatingTitle: updateTitleMutation.isPending,
  };
}
