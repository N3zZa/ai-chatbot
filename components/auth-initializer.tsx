"use client";
import { useAuth } from "@/hooks/queries/use-auth";
import { useEffect } from "react";

export function AuthInitializer() {
  const { user, isLoading, signInAnonymously } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log(user)
      signInAnonymously();
    }
  }, [user, isLoading, signInAnonymously]);

  return null;
}
