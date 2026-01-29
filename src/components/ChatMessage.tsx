import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import smartAssistLogo from "@/assets/smartassist-logo.png";
import { User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-card border border-border shadow-sm"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-primary-foreground" />
        ) : (
          <img
            src={smartAssistLogo}
            alt="SmartAssist"
            className="h-7 w-7 object-contain"
          />
        )}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-chat-user-bg text-chat-user-fg rounded-tr-sm"
            : "bg-chat-assistant-bg text-chat-assistant-fg border border-border rounded-tl-sm"
        )}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
