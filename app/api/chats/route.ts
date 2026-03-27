import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import { getUserChats, createChat } from "@/lib/db/chats";
import { canCreateChat } from "@/lib/db/users";

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chats = await getUserChats(user.id);
    return NextResponse.json(chats);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowed = await canCreateChat(user.id);
  if (!allowed) {
    return NextResponse.json({ error: "Limit exceeded" }, { status: 403 });
  }

  try {
    const newChat = await createChat(user.id, "Новый чат");
    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
