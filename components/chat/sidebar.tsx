"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Settings, Edit2, Trash2, Loader2, Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AvatarFallback, Avatar } from "../ui/avatar";

import { LogoutButton } from "../logout-button";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/hooks/queries/use-auth";
import { useChats } from "@/hooks/queries/use-chats";
import { Chat } from "@/types/chat.types";

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 h-full border-r bg-card flex-col shrink-0">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} side="left" className="w-64 p-0">
        <VisuallyHidden>
          <SheetDescription />
          <SheetTitle>Navigation menu</SheetTitle>
        </VisuallyHidden>
        <SidebarContent isMobile setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({
  isMobile,
  setOpen,
}: {
  isMobile?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, remaining, isLoading } = useAuth();
  const {
    chats,
    createChatAsync,
    deleteChat,
    updateChatTitle,
    isCreatingChat,
  } = useChats(user?.id);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleCreateChat = async () => {
    const newChat = await createChatAsync({});
    if (newChat) {
      router.push(`/chat/${newChat.id}`);
      if (isMobile) setOpen?.(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    if (pathname === `/chat/${chatId}`) router.push("/chat");
  };

  const startEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const saveEdit = async (chatId: string) => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle) {
      await updateChatTitle({ chatId, title: trimmedTitle });
    }
    setEditingId(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    chatId: string,
  ) => {
    if (e.key === "Enter") saveEdit(chatId);
    if (e.key === "Escape") setEditingId(null);
  };

  const menuItems = [
    {
      label: "Logout",
      content: <LogoutButton type="chat" />,
    },
  ];

  const isAnonymous = user?.is_anonymous;

  return (
    <>
      <div className="p-4 border-b mb-4">
        <button
          onClick={handleCreateChat}
          disabled={isCreatingChat}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isCreatingChat ? "Creating..." : "New chat"}
        </button>
      </div>

      <ScrollArea className="max-w-68 overflow-y-auto px-2">
        <div className="space-y-1 max-w-60">
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.id}`;
            const isEditing = editingId === chat.id;

            return (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                  isActive && "bg-muted",
                )}
              >
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(chat.id)}
                      onKeyDown={(e) => handleKeyDown(e, chat.id)}
                      className="w-full bg-transparent border-b border-primary focus:outline-none"
                    />
                  ) : (
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={() => isMobile && setOpen?.(false)}
                      className="group-hover:block max-md:block w-full truncate pr-2 text-left transition-all"
                    >
                      {chat.title}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 max-md:opacity-100 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button
                    onClick={() => startEdit(chat)}
                    title="Edit"
                    className="p-1 hover:bg-muted-foreground/10 rounded"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    title="Delete"
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
          {isLoading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            <>
              <p className="font-semibold">
                Free messages:{" "}
                {remaining === 999 ? "Unlimited" : `${remaining}/3`}
              </p>
              <div className="w-full bg-background h-1.5 mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{
                    width: `${remaining > 0 ? (remaining / 3) * 100 : 1}%`,
                  }}
                />
              </div>
            </>
          )}
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
                {user && !isAnonymous ? user.email : "Anonymous"}
              </span>
              {!isAnonymous && (
                <span className="text-[10px] text-muted-foreground truncate">
                  Free Plan
                </span>
              )}
            </div>
            {!isAnonymous ? (
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
    </>
  );
}
