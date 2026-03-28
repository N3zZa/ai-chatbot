import { streamText, UIMessage } from "ai";
import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import { checkChatOwnership } from "@/lib/db/chats";
import { addMessage } from "@/lib/db/messages";
import {
  decrementFreeMessagesCount,
  getRemainingFreeMessages,
} from "@/lib/db/users";
import { AI_MODEL, google } from "@/lib/llm/config";
import { formatAIMessages, generateChatTitle } from "@/lib/llm/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  if (!messages?.length)
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });

  const user = await getServerUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isOwner = await checkChatOwnership(chatId, user.id);
  if (!isOwner)
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  const remaining = await getRemainingFreeMessages(user.id);
  if (remaining <= 0)
    return NextResponse.json({ error: "Free limit reached" }, { status: 403 });

  const lastMessage: UIMessage = messages[messages.length - 1];
  const messageText =
    lastMessage.parts?.find((p) => p.type === "text")?.text || "";
  const hasFiles = lastMessage.parts?.some((p) => p.type === "file");

  if (!messageText && !hasFiles)
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const dbContent = hasFiles ? `${messageText} [Вложение]`.trim() : messageText;
  await decrementFreeMessagesCount(user.id);


  const result = await streamText({
    model: google(AI_MODEL),
    messages: formatAIMessages(messages),
    // onChunk: ({ chunk }) => {
    //   console.log("Chunk:", chunk);
    // },
    onFinish: async (event) => {
      if (!event.text?.trim())
        return console.warn("AI returned empty response");
      if (["error", "other"].includes(event.finishReason))
        return console.error("Stream error");

      await Promise.all([
        addMessage(chatId, "user", dbContent),
        addMessage(chatId, "assistant", event.text),
      ]);

      if (messages.length === 1 && messageText) {
        await generateChatTitle(chatId, messageText);
      }
    },
    onError: (error) => console.error("Streaming error:", error),
  });

  return result.toUIMessageStreamResponse();
}
