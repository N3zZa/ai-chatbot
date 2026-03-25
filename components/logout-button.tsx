"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    // const supabase = await createClient();
    // await supabase.auth.signOut();
    // do logic with api routes
    router.push("/auth/login");
  };

  return <Button onClick={logout}>Logout</Button>;
}
