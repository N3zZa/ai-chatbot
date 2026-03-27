"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chat } from "@/types/chat.types";
import { chatService } from "@/services/chats";
import { chatKeys } from "./keys";

export function useChats(initialChats?: Chat[]) {
  const queryClient = useQueryClient();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery<Chat[]>({
    queryKey: chatKeys.lists(),
    queryFn: chatService.getChats,
    initialData: initialChats,
  });

  const createChatMutation = useMutation({
    mutationFn: ({ title }: { title?: string }) =>
      chatService.createChat(title),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      toast.success("Новый чат создан");
      return newChat;
    },
    onError: () => toast.error("Не удалось создать чат"),
  });

  const deleteChatMutation = useMutation({
    mutationFn: chatService.deleteChat,
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      queryClient.removeQueries({ queryKey: chatKeys.messages(chatId) });
      toast.success("Чат удалён");
    },
    onError: (error) => {
      console.log('error: ', error)
      toast.error("Не удалось удалить чат");
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      chatService.updateChatTitle(chatId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: () => toast.error("Не удалось обновить название"),
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
