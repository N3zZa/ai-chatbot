import { generateText, ModelMessage, UIMessage } from "ai";
import { updateChatTitle } from "@/lib/db/queries/chats";

import { AI_MODEL, google } from "@/lib/llm/config";
import { ALLOWED_MIME_TYPES_SET } from "@/constants";

export const formatAIMessages = (messages: UIMessage[]): ModelMessage[] => {
  return messages.map((msg) => {
    const content: ModelMessage["content"][number][] = []; 

    for (const part of msg.parts) {
      if (part.type === "text") {
        content.push({ type: "text" as const, text: part.text });
        continue;
      }

      if (part.type === "file") {
        const mediaType = part.mediaType ?? "";

        const isAllowed =
          mediaType.startsWith("image/") ||
          ALLOWED_MIME_TYPES_SET.has(mediaType);

        if (isAllowed) {
          const rawBase64 = part.url.startsWith("data:")
            ? part.url.slice(part.url.indexOf(",") + 1)
            : part.url;

          content.push({
            type: "file" as const,
            data: rawBase64,
            mediaType: part.mediaType,
            filename: part.filename,
          });
        } else {
          content.push({
            type: "text" as const,
            text: `[File ${part.filename}]`,
          });
        }
      }
    }

    return {
      role: msg.role,
      content,
    };
  }) as ModelMessage[];
};

export const generateChatTitle = async (
  chatId: string,
  messageText: string,
) => {
  try {
    const { text: newTitle } = await generateText({
      model: google(AI_MODEL),
      system:
        "You're a useful assistant. Your task is to briefly (3-5 words) summarize the essence of the user's request for the chat header. Don't use quotation marks. Use user language",
      prompt: messageText,
    });
    await updateChatTitle(chatId, newTitle.trim());
  } catch (error) {
    console.error("Error generating title:", error);
  }
};
