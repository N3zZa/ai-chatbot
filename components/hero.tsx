"use client";
import { useAuth } from "@/hooks/queries/use-auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Hero() {
  const { user, isAnonymous, remaining, canAsk, isLoading, error } =
    useAuth();
  return (
    <div className="flex flex-col gap-16 items-center">
      <Link
        className="border p-5 rounded-3xl group hover:border-primary transition-all"
        href={`/chat`}
      >
        <div className="flex gap-8 text-2xl justify-center items-center">
          AI
          <span className="border-l group-hover:border-primary transition-all rotate-45 h-6" />
          Chatbot
        </div>
      </Link>
      <div className="text-center">
        {isLoading ? (
          "Loading..."
        ) : (
          <div>
            {isAnonymous ? (
              <span>
                Anonymous mode (Remaining questions: {remaining})
              </span>
            ) : (
              <div className="flex flex-col gap-2 items-start">
                {error && (
                  <p className="text-sm text-red-500">{error.message}</p>
                )}
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <div className="text-center text-2xl flex flex-col gap-5 ">
                    Hello, {user?.email}
                    <Button>
                      <Link href={`/chat`}>Go to chat</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!canAsk && <span className="text-red-500">The limit has been reached</span>}
          </div>
        )}
      </div>
    </div>
  );
}
