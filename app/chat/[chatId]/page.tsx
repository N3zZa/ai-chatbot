import { Header } from "@/components/header";
import {  Sidebar } from "@/components/chat/sidebar";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Chat = dynamic(
  () => import("@/components/chat/chat").then((mod) => mod.Chat),
  {
    ssr: true,
    loading: () => <div className="flex-1 bg-background" />,
  },
);

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Suspense fallback={<div className="w-64 bg-background" />}>
        <Sidebar />
      </Suspense>
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header type="chat" />
        <Suspense fallback={<div className="flex-1 bg-background" />}>
          <Chat params={params} />
        </Suspense>
      </main>
    </div>
  );
}
