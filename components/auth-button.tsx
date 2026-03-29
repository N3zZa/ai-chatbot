'use client'
import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { useAuth } from "@/hooks/queries/use-auth";

export function AuthButton() {
  const { user } = useAuth();

  return user && !user.is_anonymous ? (
    <div className="flex items-center gap-4">
      {user.email}
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
