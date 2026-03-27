import type { Metadata } from "next";
import { defaultUrl } from "@/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "OpenAI Chatbot Auth",
  description:
    "OpenAI ChatBot created with Nextjs,supabase,tailwind,shadcn, tanstack-query",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Button asChild className="absolute left-5 top-5" variant={"ghost"}>
        <Link href="/chat">OpenAI Chat</Link>
      </Button>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
