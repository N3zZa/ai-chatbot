"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/queries/use-auth";
import { Loader, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton({ type = 'default' }: { type?: "chat" | "default" }) {
  const router = useRouter();
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/auth/login");
      },
    });
  };

  return (
    <>
      {type === "default" ? (
        <Button onClick={handleLogout}>
          {isLoggingOut ? (
            <Loader className="animate-spin transition-all" />
          ) : (
            "Logout"
          )}
        </Button>
      ) : (
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="justify-start w-full gap-2 text-destructive"
        >
          <LogOut size={16} /> Logout
        </Button>
      )}
    </>
  );
}
