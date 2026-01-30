import { useState, useRef, useEffect } from "react";
import { Menu } from "lucide-react";
import Header from "@/components/Header";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import ConversationSidebar from "@/components/ConversationSidebar";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { streamChat, type Message } from "@/lib/chat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useIsMobile } from "@/hooks/use-mobile";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi 👋 Welcome to SmartAssist. I'm here to help you with questions, learning, writing, and everyday tasks. How can I help you today?",
};

const Index = () => {
  const { user, signOut } = useAuth();
  const {
    conversations,
    currentConversationId,
    messages: savedMessages,
    setMessages: setSavedMessages,
    createConversation,
    addMessage,
    deleteConversation,
    selectConversation,
    startNewConversation,
  } = useConversations(user);

  const [localMessages, setLocalMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Determine which messages to show
  const displayMessages = currentConversationId
    ? savedMessages.length > 0
      ? savedMessages
      : [INITIAL_MESSAGE]
    : localMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  // Sync savedMessages to local when conversation changes
  useEffect(() => {
    if (currentConversationId && savedMessages.length > 0) {
      setLocalMessages(savedMessages);
    }
  }, [currentConversationId, savedMessages]);

  const handleSend = async (input: string) => {
    const userMessage: Message = { role: "user", content: input };
    
    let conversationId = currentConversationId;
    
    // If user is logged in and no current conversation, create one
    if (user && !conversationId) {
      conversationId = await createConversation(input);
    }

    // Update local state immediately
    const newMessages = [...displayMessages, userMessage];
    if (currentConversationId) {
      setSavedMessages(newMessages);
    } else {
      setLocalMessages(newMessages);
    }
    setIsLoading(true);

    // Save user message to DB
    if (conversationId) {
      await addMessage(conversationId, "user", input);
    }

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      const updateFn = currentConversationId ? setSavedMessages : setLocalMessages;
      updateFn((prev) => {
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
      onDone: async () => {
        setIsLoading(false);
        // Save assistant message to DB
        if (conversationId && assistantContent) {
          await addMessage(conversationId, "assistant", assistantContent);
        }
      },
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

  const handleNewConversation = () => {
    startNewConversation();
    setLocalMessages([INITIAL_MESSAGE]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setSidebarOpen(false);
  };

  const sidebarContent = (
    <ConversationSidebar
      conversations={conversations}
      currentConversationId={currentConversationId}
      onSelectConversation={handleSelectConversation}
      onNewConversation={handleNewConversation}
      onDeleteConversation={deleteConversation}
      user={user}
      onSignIn={() => setAuthModalOpen(true)}
      onSignOut={signOut}
    />
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="hidden md:block">
            {sidebarContent}
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex flex-1 flex-col">
          {/* Mobile menu button */}
          {isMobile && (
            <div className="border-b border-border p-2">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  {sidebarContent}
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl pb-4">
              {displayMessages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && displayMessages[displayMessages.length - 1]?.role === "user" && (
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

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;
