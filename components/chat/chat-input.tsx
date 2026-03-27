"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, SendHorizontal, X } from "lucide-react";
import Image from "next/image";

interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: (e: React.FormEvent, files?: File[]) => void;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() && files.length === 0) return;
    onSend(e, files);
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;

    let hasImage = false;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          setFiles((prev) => [...prev, file]);
          hasImage = true;
        }
      }
    }

    if (hasImage) {
      e.preventDefault();
    }
  };

  const handleTextareaInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e); 

    const el = textareaRef.current;
    if (el) {
      const MAX_TEXTAREA_HEIGHT = 200
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT) + "px";
    }
  };

  return (
    <div className="border-t bg-background px-4 py-3">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, i) => (
              <div
                key={i}
                className="relative group size-16 border rounded-lg overflow-hidden bg-muted"
              >
                {file.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[10px] p-1 text-center break-all">
                    {file.name}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 rounded-2xl border bg-muted/40 px-3 py-2 focus-within:ring-1 ring-ring transition">
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextareaInput}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="
              flex-1
              border-0
              bg-transparent
              resize-none
              px-0
              py-2
              leading-6
              min-h-[36px]
              max-h-[200px]
              overflow-y-auto
              focus-visible:ring-0
            "
          />

          <Button
            type="submit"
            size="icon"
            disabled={disabled || (!value.trim() && files.length === 0)}
            className="shrink-0"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-[10px] text-center mt-2 text-muted-foreground">
          AI can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
