import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import { streamChat, type Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi 👋 Welcome to SmartAssist. I'm here to help you with questions, learning, writing, and everyday tasks. How can I help you today?",
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (input: string) => {
    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > newMessages.length) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev.slice(0, newMessages.length), { role: "assistant", content: assistantContent }];
      });
    };

    await streamChat({
      messages: newMessages.map(({ role, content }) => ({ role, content })),
      onDelta: (chunk) => updateAssistant(chunk),
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl pb-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              SmartAssist may make mistakes. For critical matters, consult a professional.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
