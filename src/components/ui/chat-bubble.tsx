import React from "react";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  children?: React.ReactNode;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  animate = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`chat-bubble text-white ${animate ? "chat-bubble-float" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Add these CSS classes to your global stylesheet if not present:
// .chat-bubble { border-radius: 9999px; background: linear-gradient(135deg, #60a5fa, #a78bfa); box-shadow: 0 4px 24px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; transition: all 0.7s; }
// .chat-bubble-float { animation: bounce 2.5s infinite; }
// @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15%); } }