"use client";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/chat/sidebar";
import { useAuth } from "@/hooks/queries/use-auth";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Suspense } from "react";

const Chat = dynamic(
  () => import("@/components/chat/chat").then((mod) => mod.Chat),
  {
    ssr: false,
    loading: () => <div className="flex-1 bg-background" />,
  },
);

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { remaining, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar remaining={remaining} />

      <main className="flex flex-1 flex-col overflow-hidden">
        <Header type="chat" />
        <Suspense fallback={<div className="flex-1 bg-background" />}>
          <Chat chatId={chatId} />
        </Suspense>
      </main>
    </div>
  );
}
