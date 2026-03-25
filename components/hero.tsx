"use client";
import { useAuth } from "@/hooks/queries/use-auth";

export function Hero() {
  const { user, isAnonymous, remaining, canAsk, isLoading } = useAuth();
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        OpenAI
        <span className="border-l rotate-45 h-6" />
        Chatbot
      </div>
      <div>
        User info:
        {isLoading ? (
          "Загрузка..."
        ) : (
          <div>
            {isAnonymous ? (
              <span>Анонимный режим (осталось вопросов: {remaining})</span>
            ) : (
              <span>Привет, {user?.email}</span>
            )}
            {!canAsk && <span className="text-red-500">Лимит исчерпан</span>}
          </div>
        )}
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
