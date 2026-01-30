import { useState } from "react";
import { MessageSquare, Plus, Trash2, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  user,
  onSignIn,
  onSignOut,
}: ConversationSidebarProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Chats</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewConversation}
          className="h-8 w-8"
          title="New chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {!user ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Sign in to save your chat history
            </p>
          ) : conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                  currentConversationId === conversation.id && "bg-accent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
                onMouseEnter={() => setHoveredId(conversation.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">{conversation.title}</span>
                {hoveredId === conversation.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        {user ? (
          <div className="space-y-2">
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={onSignIn}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        )}
      </div>
    </aside>
  );
};

export default ConversationSidebar;
