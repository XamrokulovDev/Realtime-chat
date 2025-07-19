import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vaqtni nisbiy formatda ko'rsatish uchun funksiya
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSeconds < 60) {
    return `${diffSeconds} soniya oldin`
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60)
    return `${minutes} daqiqa oldin`
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600)
    return `${hours} soat oldin`
  } else if (diffSeconds < 604800) {
    // 7 kun
    const days = Math.floor(diffSeconds / 86400)
    return `${days} kun oldin`
  } else {
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}
