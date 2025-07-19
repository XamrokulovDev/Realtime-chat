import type { ClientMessage } from "@/types/app-types" // Yangi turlar import qilindi
import { cn, formatRelativeTime } from "@/lib/utils"

interface ChatMessageProps {
  message: ClientMessage
  isCurrentUser: boolean
}

export default function ChatMessage({ message, isCurrentUser }: ChatMessageProps) {
  return (
    <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
          {message.sender.username.charAt(0).toUpperCase()}
        </div>
      )}
      <div
        className={cn(
          "rounded-lg p-3 max-w-[70%]",
          isCurrentUser ? "bg-blue-600 text-white" : "bg-zinc-800 text-white",
        )}
      >
        {!isCurrentUser && <span className="font-semibold text-blue-300 block mb-1">{message.sender.username}</span>}
        <p className="break-words">{message.content}</p>
        <span className={cn("block text-xs mt-1", isCurrentUser ? "text-blue-200" : "text-zinc-400")}>
          {formatRelativeTime(new Date(message.timestamp))}
        </span>
      </div>
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
          {message.sender.username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}