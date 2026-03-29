CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text unique,
  is_anonymous boolean DEFAULT false,
  free_messages_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text default 'Новый чат',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE INDEX idx_chats_user_id ON public.chats(user_id);

CREATE TABLE public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role TEXT not null check (role IN ('user', 'assistant', 'system')),
  content TEXT not null,
  image_url TEXT, 
  created_at timestamp with time zone default now()
);

CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);