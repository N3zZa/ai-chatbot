import { streamText, UIMessage } from "ai";
import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import { checkChatOwnership } from "@/lib/db/queries/chats";
import { addMessage } from "@/lib/db/queries/messages";
import {
  decrementFreeMessagesCount,
  getUserWithLimits,
} from "@/lib/db/queries/users";
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

  const { canAsk } = await getUserWithLimits(user.id);
  console.log(canAsk)
  if (!canAsk) {
    return NextResponse.json(
      {
        error: "Free question limit reached. Please sign up to continue.",
        isAnonymous: user.is_anonymous,
      },
      { status: 403 },
    );
  }

  const lastMessage: UIMessage = messages[messages.length - 1];
  const messageText =
    lastMessage.parts?.find((p) => p.type === "text")?.text || "";
  const hasFiles = lastMessage.parts?.some((p) => p.type === "file");

  if (!messageText && !hasFiles)
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  const dbContent = hasFiles
    ? `${messageText} [Attachment]`.trim()
    : messageText;

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
      
      if (user.is_anonymous) {
        await decrementFreeMessagesCount(user.id);
      }

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
