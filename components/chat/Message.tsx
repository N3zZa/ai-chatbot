import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "../ui/markdown";
import { memo } from "react";
import Link from "next/link";

interface MessageProps {
  message: UIMessage;
  isStreaming?: boolean;
}

const remarkPlugins = [remarkGfm];

const MemoizedMarkdown = memo(
  ({ content }: { content: string }) => (
    <ReactMarkdown
      components={markdownComponents}
      remarkPlugins={remarkPlugins}
    >
      {content}
    </ReactMarkdown>
  ),
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

export const Message = memo(
  function Message({ message, isStreaming }: MessageProps) {
    const { role, parts } = message;
    const isAssistant = role === "assistant";

    return (
      <div
        className={cn(
          "w-full py-6 overflow-hidden",
          isAssistant ? "bg-muted/50" : "bg-background",
        )}
      >
        <div className="container max-w-4xl flex gap-4 mx-auto px-4 min-w-0">
          <Avatar className="h-8 w-8 border shrink-0">
            {isAssistant ? (
              <>
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

          <div className="flex-1 space-y-3 overflow-hidden min-w-0">
            <p className="font-medium text-xs text-foreground/50 uppercase tracking-wider">
              {isAssistant ? "Assistant" : "You"}
            </p>

            <div className="space-y-4">
              {parts?.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={`${part.type}-${i}`}
                      className="text-sm max-w-none break-words leading-relaxed w-full min-w-0 overflow-hidden"
                    >
                      <MemoizedMarkdown content={part.text} />

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
                    <Link
                      key={i}
                      href={part.url}
                      className="flex items-center gap-2 p-2 border rounded-md text-sm hover:bg-muted"
                    >
                      📎 {part.filename || "File"}
                    </Link>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    if (prev.isStreaming !== next.isStreaming) return false;

    if (next.isStreaming) return false;

    const prevParts = prev.message.parts;
    const nextParts = next.message.parts;

    if (prevParts.length !== nextParts.length) return false;

    const lastIdx = nextParts.length - 1;
    const pLast = prevParts[lastIdx];
    const nLast = nextParts[lastIdx];

    if (pLast.type !== nLast.type) return false;

    if ("text" in pLast && "text" in nLast) {
      return pLast.text === nLast.text;
    }

    return true;
  },
);
