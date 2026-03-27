import { Header } from "@/components/header";
import { Sidebar } from "@/components/chat/sidebar";
import { NewChatPlaceholder } from "@/components/chat/NewChatPlaceholder";

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <Header type="chat" />

        <NewChatPlaceholder />
      </main>
    </div>
  );
}
