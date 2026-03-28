"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Settings, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogoutButton } from "../logout-button";
import { AvatarFallback, Avatar } from "../ui/avatar";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/hooks/queries/use-auth";
import { useChats } from "@/hooks/queries/use-chats";
import { useState } from "react";
import { Chat } from "@/types/chat.types";

export function Sidebar() {
  const pathname = usePathname();
  const { user, remaining } = useAuth();

  const router = useRouter();
  const {
    chats,
    createChatAsync,
    deleteChat,
    updateChatTitle,
    isCreatingChat,
  } = useChats();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreateChat = async () => {
    const newChat = await createChatAsync({});
    if (newChat) router.push(`/chat/${newChat.id}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    console.log(chatId);
    await deleteChat(chatId);
    if (pathname === `/chat/${chatId}`) router.push("/chat");
  };

  const startEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = async (chatId: string) => {
    if (editTitle.trim())
      await updateChatTitle({ chatId, title: editTitle.trim() });
    setEditingId(null);
  };

  const menuItems = [
    {
      label: "Logout",
      content: <LogoutButton type="chat" />,
    },
  ];

  return (
    <div className="w-64 h-full border-r bg-card flex flex-col">
      <div className="p-4 border-b mb-4">
        <button
          onClick={handleCreateChat}
          disabled={isCreatingChat}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isCreatingChat ? "Создание..." : "Новый чат"}
        </button>
      </div>

      <ScrollArea className="max-w-68 overflow-y-auto px-2">
        <div className="space-y-1 max-w-60">
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}`;

            return (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                  isActive && "bg-muted",
                )}
              >
                <div className="flex-1 min-w-0">
                  {editingId === chat.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(chat.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full bg-transparent border-b border-primary focus:outline-none"
                    />
                  ) : (
                    <Link
                      href={`/chat/${chat.id}`}
                      className="group-hover:block w-full truncate pr-2 text-left transition-all"
                    >
                      {chat.title}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button
                    onClick={() => startEdit(chat)}
                    className="p-1 hover:bg-muted-foreground/10 rounded"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-4">
        <div className="bg-muted p-3 rounded-lg text-[12px]">
          <p className="font-semibold">
            Free messages: {remaining === 999 ? "Unlimited" : `${remaining}/3`}
          </p>
          <div className="w-full bg-secondary h-1.5 mt-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all"
              style={{ width: `${(remaining / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar size="default">
              <AvatarFallback>
                {user?.email ? user?.email[0].toUpperCase() : "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user ? user.email : "Anonymous"}
              </span>
              {user && (
                <span className="text-[10px] text-muted-foreground truncate">
                  Free Plan
                </span>
              )}
            </div>
            {user ? (
              <UserDropdown
                items={menuItems}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 ml-auto"
                  >
                    <Settings size={16} className="text-muted-foreground" />
                  </Button>
                }
              />
            ) : (
              <Button asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
