import { generateText, ModelMessage, streamText, UIMessage } from "ai";
import { getServerUser } from "@/lib/db/auth";
import { NextResponse } from "next/server";
import { checkChatOwnership, updateChatTitle } from "@/lib/db/chats";
import { addMessage } from "@/lib/db/messages";
import {
  decrementFreeMessagesCount,
  getRemainingFreeMessages,
} from "@/lib/db/users";
import { AI_MODEL, google } from "@/lib/llm/config";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const { chatId } = await params;
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = await checkChatOwnership(chatId, user.id);
  if (!isOwner) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const remaining = await getRemainingFreeMessages(user.id);
  if (remaining <= 0) {
    return NextResponse.json(
      { error: "Free question limit reached. Please sign up." },
      { status: 403 },
    );
  }

  const lastMessage: UIMessage = messages[messages.length - 1];

  const textPart = lastMessage.parts?.find((p) => p.type === "text");
  const messageText = textPart?.text || "";

  const hasFiles = lastMessage.parts?.some((p) => p.type === "file");

  if (!messageText && !hasFiles) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const dbContent = hasFiles ? `${messageText} [Вложение]`.trim() : messageText;
  await addMessage(chatId, "user", dbContent);

  await decrementFreeMessagesCount(user.id);


  const aiMessages = messages.map((msg: UIMessage) => {
    const contentParts = msg.parts
      .map((part) => {
        if (part.type === "text") {
          return { type: "text" as const, text: part.text };
        }
        if (part.type === "file") {
          let rawBase64 = part.url;

          if (rawBase64.startsWith("data:")) {
            const commaIndex = rawBase64.indexOf(",");
            if (commaIndex !== -1) rawBase64 = rawBase64.slice(commaIndex + 1);
          }

          if (
            part.mediaType?.startsWith("image/") ||
            part.mediaType === "application/pdf"
          ) {
            return {
              type: "file" as const,
              data: rawBase64,
              mediaType: part.mediaType, 
              filename: part.filename,
            };
          }

          return {
            type: "text" as const,
            text: `[Файл ${part.filename}]`,
          };
        }
        return undefined;
      })
      .filter(Boolean);

    return {
      role: msg.role,
      content: contentParts,
    };
  });


  const result = await streamText({
    model: google(AI_MODEL),
    messages: aiMessages as ModelMessage[],
    // onChunk: ({ chunk }) => {
    //   console.log("Chunk:", chunk);
    // },
    onFinish: async (event) => {
      await addMessage(chatId, "assistant", event.text);

      if (messages.length === 1 && messageText) {
        try {
          const { text: newTitle } = await generateText({
            model: google(AI_MODEL),
            system:
              "Ты — полезный ассистент. Твоя задача — кратко (3-5 слов) пересказать суть запроса пользователя для заголовка чата. Не используй кавычки.",
            prompt: messageText,
          });
          await updateChatTitle(chatId, newTitle.trim());
        } catch (titleError) {
          console.error("Error generating title:", titleError);
        }
      }
    },
    onError: (error) => {
      console.error(error)
      console.log("error, last message content: ", aiMessages[aiMessages.length - 1].content)
    },
  });

  return result.toUIMessageStreamResponse();
}
