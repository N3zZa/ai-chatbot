import { supabaseAdmin } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. Регистрация в Supabase Auth через Admin SDK
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          // Ссылка, по которой пользователь перейдет из письма
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/confirm`,
        },
      });

    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });

    if (authData.user) {
      // 2. Создание профиля в вашей таблице users
      // Используем Admin-клиент, так как мы обходим RLS
      const { error: dbError } = await supabaseAdmin.from("users").insert([
        {
          id: authData.user.id,
          email: authData.user.email,
          is_anonymous: false,
          free_messages_count: 0,
        },
      ]);

      if (dbError) console.error("Ошибка БД:", dbError);
    }

    return NextResponse.json({ message: "Confirmation email sent" });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
