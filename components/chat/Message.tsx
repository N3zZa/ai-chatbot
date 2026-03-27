import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../ui/markdown";

interface MessageProps {
  message: UIMessage;
}

export function Message({ message }: MessageProps) {
  const { role, parts } = message;
  const isAssistant = role === "assistant";
  return (
    <div
      className={cn(
        "w-full py-6",
        isAssistant ? "bg-muted/50" : "bg-background",
      )}
    >
      <div className="container max-w-4xl flex gap-4 mx-auto px-4">
        <Avatar className="h-8 w-8 border shrink-0">
          {isAssistant ? (
            <>
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback className="bg-blue-600 text-white">
                AI
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback>
              <User size={18} />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 space-y-3 overflow-hidden">
          <p className="font-medium text-xs text-foreground/50 uppercase tracking-wider">
            {isAssistant ? "Assistant" : "You"}
          </p>

          <div className="space-y-4">
            {parts.map((part, i) => {
              if (part.type === "text") {
                const isStreaming = part.state !== "done" && isAssistant;
                return (
                  <div
                    key={part.type + "-" + i}
                    className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed"
                  >
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm]}
                    >
                      {part.text}
                    </ReactMarkdown>

                    {isStreaming && (
                      <span className="inline-block w-0.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
                    )}
                  </div>
                );
              }

              if (part.type === "reasoning") {
                return (
                  <div
                    key={i}
                    className="text-sm text-muted-foreground border-l-2 pl-4 py-1 italic bg-muted/30 rounded-r-lg"
                  >
                    {part.text}
                  </div>
                );
              }

              if (part.type === "file") {
                if (part.mediaType?.startsWith("image/")) {
                  return (
                    <div
                      key={i}
                      className="relative aspect-video max-w-sm rounded-lg overflow-hidden border shadow-sm mt-2"
                    >
                      <Image
                        src={part.url}
                        fill
                        className="object-cover"
                        alt="attachment"
                      />
                    </div>
                  );
                }
                return (
                  <a
                    key={i}
                    href={part.url}
                    className="flex items-center gap-2 p-2 border rounded-md text-sm hover:bg-muted"
                  >
                    📎 {part.filename || "Файл"}
                  </a>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
