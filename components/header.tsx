import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "./auth-button";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";

export const Header = ({ type = "default" }: { type?: "chat" | "default" }) => {
  return (
    <header
      className={cn(
        "w-full flex justify-center border-b border-b-foreground/10 h-16",
        { "h-10": type !== "default" },
      )}
    >
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>OpenAI ChatBot</Link>
        </div>
        {type === "default" ? (
          <Suspense>
            <AuthButton />
          </Suspense>
        ) : <ThemeSwitcher />}
      </div>
    </header>
  );
};
