"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { User } from "@supabase/supabase-js";
import { Send, ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  username: string;
}

const ChatPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Load existing messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase.rpc("get_messages_with_profiles");
        if (error) {
          console.error("Error loading messages:", error);
          toast.error("Failed to load messages");
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          // Get the user profile for the new message
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name, username")
            .eq("user_id", payload.new.user_id)
            .single();
          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            user_name: profileData?.name || "Unknown User",
            username: profileData?.username || "unknown",
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      const { error } = await supabase.from("messages").insert({
        content: newMessage.trim(),
        user_id: user.id,
      });
      if (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      } else {
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-foreground text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-secondary/80 backdrop-blur border-b border-border px-2 sm:px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 rounded-full bg-secondary hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-foreground" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight">Global Chat</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Chat with everyone</p>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-muted-foreground text-xs sm:text-sm">Signed in as</p>
            <p className="text-foreground font-medium break-all text-xs sm:text-base">@{user.email}</p>
          </div>
        </div>
      </header>
      {/* Messages */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 h-full px-2 sm:px-4 py-2 sm:py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-foreground/70">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-foreground/70">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No messages yet</p>
                <p>Be the first to start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {messages.map((message) => {
                const isOwnMessage = user && message.username === user.email?.split("@")[0];
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80vw] sm:max-w-md md:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-lg break-words ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground border border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs sm:text-sm">
                          {message.user_name || message.username}
                        </span>
                        <span className="text-[10px] sm:text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base">
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </main>
      {/* Message Input */}
      <footer className="sticky bottom-0 z-10 bg-secondary/80 backdrop-blur border-t border-border px-2 sm:px-4 py-3 flex-shrink-0">
        <form
          className="flex items-end gap-2 sm:gap-3"
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-secondary text-foreground placeholder-muted-foreground rounded-2xl px-3 sm:px-4 py-2 sm:py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none max-h-32 text-sm sm:text-base"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 sm:p-3 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;
