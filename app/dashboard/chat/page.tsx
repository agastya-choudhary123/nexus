"use client";

import { useState } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageThread } from "@/components/chat/MessageThread";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Search with Agent
        </h1>
        <p className="text-slate-600">
          Type a search query and the AI agent will find results for you.
        </p>
      </div>

      <div className="border border-slate-200 rounded-lg p-6 bg-white space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No messages yet. Start by typing a search query.
          </div>
        )}

        {messages.length > 0 && <MessageThread messages={messages} />}

        <ChatInput
          onMessage={(updatedMessages) => {
            setMessages(updatedMessages);
            setIsLoading(false);
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
