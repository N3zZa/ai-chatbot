export type Message = {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  image_url?: string | null;
  created_at: string;
};

export type Chat = {
  id: string;
  user_id: string; 
  title: string;
  created_at: string;
  updated_at: string;
};
