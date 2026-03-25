import { User } from "@supabase/supabase-js";

export type UserRequest = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  email: string;
  is_anonymous: boolean;
  free_messages_count: number;
};

export type UserType = {
  user: User;
  remaining: number;
  isAnonymous: boolean;
  canAsk: boolean;
};
