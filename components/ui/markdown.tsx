import { Copy, Check } from "lucide-react";
import { memo, useState } from "react";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Components } from "react-markdown";
import Image from "next/image";
import dynamic from "next/dynamic";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  { ssr: false },
);

const CodeBlock = memo(
  ({ language, children }: { language: string; children: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(children.replace(/\n$/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="relative group my-2 w-full max-w-full rounded-md bg-[#1e1e1e] border border-gray-800">
        <span className="absolute top-2 left-4 text-xs text-gray-400 font-sans z-10 select-none">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 p-1.5 rounded bg-gray-700/50 max-md:bg-gray-700 max-md:opacity-100 text-white opacity-0 group-hover:opacity-100 transition z-10 hover:bg-gray-700"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        <div className="grid grid-cols-1 w-full">
          {" "}
          <div className="w-full overflow-x-auto rounded-md">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              PreTag="div"
              className="text-sm !my-0 !mt-0 w-full"
              customStyle={{
                margin: 0,
                padding: "2.5rem 1rem 1rem 1rem",
                maxWidth: "100%",
                width: "100%",
                background: "transparent",
                overflowX: "auto",
              }}
            >
              {children.replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.children === next.children && prev.language === next.language,
);

CodeBlock.displayName = "CodeBlock";

export const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;
    const codeString = String(children).replace(/\n$/, "");

    if (!isInline) {
      return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
    }
    return (
      <code
        className={`${className || ""} break-words whitespace-pre-wrap bg-muted px-1.5 py-0.5 rounded-md text-sm`}
        {...props}
      >
        {children}
      </code>
    );
  },
  table({ children }) {
    return (
      <div className="w-full overflow-x-auto my-4">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="border px-4 py-2 bg-muted/50 font-semibold text-left">
        {children}
      </th>
    );
  },
  td({ children }) {
    return <td className="border px-4 py-2">{children}</td>;
  },
  h1({ children }) {
    return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>;
  },
  h4({ children }) {
    return <h4 className="text-base font-semibold mt-3 mb-1">{children}</h4>;
  },
  h5({ children }) {
    return <h5 className="text-sm font-semibold mt-2 mb-1">{children}</h5>;
  },
  h6({ children }) {
    return (
      <h6 className="text-xs font-semibold mt-2 mb-1 uppercase">{children}</h6>
    );
  },

  ul({ children }) {
    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="my-1">{children}</li>;
  },

  hr() {
    return (
      <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />
    );
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-700 dark:text-gray-300">
        {children}
      </blockquote>
    );
  },

  img({ src, alt }) {
    if (!src || typeof src !== "string") return null;

    return (
      <div className="relative w-full max-w-md h-64 my-2">
        <Image
          src={src}
          alt={alt ?? "md_img"}
          fill
          className="object-contain rounded-md"
        />
      </div>
    );
  },
};
