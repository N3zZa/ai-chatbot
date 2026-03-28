import { ANON_MSG_LIMIT } from "@/constants";

export const authService = {
  async login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }

    return data;
  },

  async signUp(email: string, password: string) {
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Sign-up failed");

    return res.json();
  },

  async logout() {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Logout failed");

    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!res.ok) throw new Error("Failed");

    return res.json();
  },

  async updatePassword(password: string) {
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    if (!res.ok) throw new Error("Failed");

    return res.json();
  },

  async signInAnonymously() {
    const res = await fetch("/api/auth/login-anonymously", {
      method: "POST",
    });

    if (!res.ok) throw new Error("Failed to auth anonymously");

    return res.json();
  },

  async me() {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return { user: null, canAsk: true, remaining: ANON_MSG_LIMIT };
    return res.json();
  },
};
