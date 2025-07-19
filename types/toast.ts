import type { ReactNode } from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

export type ToastVariant = "default" | "success" | "destructive"

export interface ToastOptions extends Partial<ToastProps> {
  id?: string
  title?: ReactNode
  description?: ReactNode
  duration?: number
  variant?: ToastVariant
  action?: ToastActionElement
  promise?: unknown
}