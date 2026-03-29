import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import { getChatMessages } from "@/lib/db/queries/messages";
import { checkChatOwnership } from "@/lib/db/queries/chats";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await checkChatOwnership(chatId, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  try {
    const messages = await getChatMessages(chatId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error [Chat messages]" },
      { status: 500 },
    );
  }
}
