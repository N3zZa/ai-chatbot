"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/queries/use-auth";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
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
    <Button onClick={handleLogout}>
      {isLoggingOut ? (
        <Loader className="transform animate-spin transition-all" />
      ) : (
        "Logout"
      )}
    </Button>
  );
}
