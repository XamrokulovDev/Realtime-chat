import type { IUser } from "@/models/User"
import { formatRelativeTime } from "@/lib/utils"
// Link importi olib tashlandi

interface UserListProps {
  users: IUser[]
  currentUserId: string
}

export default function UserList({ users, currentUserId }: UserListProps) {
  return (
    <ul className="space-y-2 overflow-y-auto flex-1">
      {users.map((user) => (
        <li className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800">
          {/* Profilga yo'naltiruvchi Link o'rniga oddiy div ishlatildi */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span
                className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900 ${
                  user.isOnline ? "bg-green-500" : "bg-gray-500"
                }`}
                title={user.isOnline ? "Onlayn" : `Oxirgi ko'rilgan: ${formatRelativeTime(new Date(user.lastSeen))}`}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">
                {user.username} {user._id === currentUserId && "(Siz)"}
              </p>
              <p className="text-xs text-zinc-400">
                {user.isOnline ? "Onlayn" : `Oxirgi ko'rilgan: ${formatRelativeTime(new Date(user.lastSeen))}`}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}