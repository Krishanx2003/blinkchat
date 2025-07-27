"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/client";
import { User } from "@supabase/supabase-js";
import { Send, ArrowLeft, Users, Smile, MoreVertical, Hash } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isSending, setIsSending] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    
    setIsSending(true);
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
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-500',
      'from-rose-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-emerald-600',
      'from-purple-500 to-violet-600'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-dvh flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/")}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    Global Chat
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {messages.length > 0 ? `${new Set(messages.map(m => m.username)).size} participants` : 'Join the conversation'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 h-full">
          <div className="px-4 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <Users className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Be the first to share your thoughts with the community!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => {
                    const isOwnMessage = user && message.username === user.email?.split("@")[0];
                    const showAvatar = index === 0 || messages[index - 1].username !== message.username;
                    
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          ease: [0.25, 0.1, 0.25, 1],
                          delay: index * 0.02
                        }}
                        className={`flex gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        {/* Avatar */}
                        {!isOwnMessage && (
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <div 
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-semibold text-sm shadow-md bg-gradient-to-br ${getAvatarColor(message.user_name || message.username)}`}
                              >
                                {(message.user_name || message.username).charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <div className="w-10 h-10"></div>
                            )}
                          </div>
                        )}
                        
                        {/* Message bubble */}
                        <div className={`flex flex-col max-w-[70%] sm:max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
                          {showAvatar && (
                            <div className={`flex items-center gap-2 mb-1 px-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {isOwnMessage ? "You" : (message.user_name || message.username)}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                              isOwnMessage
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md"
                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm sm:text-base leading-relaxed break-words">
                              {message.content}
                            </p>
                          </div>
                          
                          {!showAvatar && (
                            <span className={`text-xs text-slate-400 mt-1 px-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                              {formatTime(message.created_at)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      {/* Message Input */}
      <footer className="sticky bottom-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-4">
          <form
            className="flex items-end gap-3"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 rounded-2xl px-4 py-3 pr-12 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 dark:focus:border-violet-400 resize-none transition-all duration-200 text-sm sm:text-base"
                rows={1}
                style={{ maxHeight: '120px' }}
              />
              
              {/* Emoji button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg disabled:shadow-none flex items-center justify-center min-w-[48px]"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </motion.button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;