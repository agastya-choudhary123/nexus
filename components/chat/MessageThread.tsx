interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function MessageThread({ messages }: { messages: Message[] }) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg ${
            msg.role === "user"
              ? "bg-blue-100 text-blue-900"
              : "bg-slate-100 text-slate-900"
          }`}
        >
          <div className="text-sm font-semibold mb-1">
            {msg.role === "user" ? "You" : "Agent"}
          </div>
          <div className="whitespace-pre-wrap text-sm break-words">
            {msg.content}
          </div>
          <div className="text-xs opacity-60 mt-2">
            {msg.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}
