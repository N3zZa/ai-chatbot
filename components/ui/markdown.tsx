import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Components } from "react-markdown";
import Image from "next/image";

const CodeBlock = ({
  language,
  children,
}: {
  language: string;
  children: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children.replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1 rounded bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        PreTag="div"
        className="rounded-md text-sm"
      >
        {children.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

export const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const isInline = !className || !/language-/.test(className);
    const codeString = String(children).replace(/\n$/, "");

    if (!isInline) {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
      }
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  h1({ children, ...props }) {
    return (
      <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }) {
    return (
      <h2 className="text-xl font-bold mt-5 mb-3" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }) {
    return (
      <h3 className="text-lg font-semibold mt-4 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4({ children, ...props }) {
    return (
      <h4 className="text-base font-semibold mt-3 mb-1" {...props}>
        {children}
      </h4>
    );
  },
  h5({ children, ...props }) {
    return (
      <h5 className="text-sm font-semibold mt-2 mb-1" {...props}>
        {children}
      </h5>
    );
  },
  h6({ children, ...props }) {
    return (
      <h6 className="text-xs font-semibold mt-2 mb-1 uppercase" {...props}>
        {children}
      </h6>
    );
  },

  ul({ children, ...props }) {
    return (
      <ul className="list-disc pl-5 my-2 space-y-1" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }) {
    return (
      <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>
        {children}
      </ol>
    );
  },
  li({ children, ...props }) {
    return (
      <li className="my-1" {...props}>
        {children}
      </li>
    );
  },

  hr({ ...props }) {
    return (
      <hr
        className="my-4 border-t border-gray-300 dark:border-gray-700"
        {...props}
      />
    );
  },

  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-700 dark:text-gray-300"
        {...props}
      >
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
