import { generateText, ModelMessage, UIMessage } from "ai";
import { updateChatTitle } from "@/lib/db/queries/chats";

import { AI_MODEL, google } from "@/lib/llm/config";
import { ALLOWED_MIME_TYPES } from "@/constants";

export const formatAIMessages = (messages: UIMessage[]): ModelMessage[] => {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.parts
      .map((part) => {
        if (part.type === "text") {
          return { type: "text" as const, text: part.text };
        }
        if (part.type === "file") {
          const rawBase64 = part.url.startsWith("data:")
            ? part.url.slice(part.url.indexOf(",") + 1)
            : part.url;

          if (
            part.mediaType?.startsWith("image/") ||
            ALLOWED_MIME_TYPES.includes(part.mediaType ?? "")
          ) {
            return {
              type: "file" as const,
              data: rawBase64,
              mediaType: part.mediaType,
              filename: part.filename,
            };
          }
          return { type: "text" as const, text: `[Файл ${part.filename}]` };
        }
        return undefined;
      })
      .filter(Boolean),
  })) as ModelMessage[];
};

export const generateChatTitle = async (
  chatId: string,
  messageText: string,
) => {
  try {
    const { text: newTitle } = await generateText({
      model: google(AI_MODEL),
      system:
        "Ты — полезный ассистент. Твоя задача — кратко (3-5 слов) пересказать суть запроса пользователя для заголовка чата. Не используй кавычки.",
      prompt: messageText,
    });
    await updateChatTitle(chatId, newTitle.trim());
  } catch (error) {
    console.error("Error generating title:", error);
  }
};
