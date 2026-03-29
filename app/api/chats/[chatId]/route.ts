import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import {
  checkChatOwnership,
  updateChatTitle,
  deleteChat,
} from "@/lib/db/queries/chats";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const isOwner = await checkChatOwnership(chatId, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  try {
    await updateChatTitle(chatId, title);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error [Update chat title]" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteChat(chatId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error [Delete chat]" },
      { status: 500 },
    );
  }
}
