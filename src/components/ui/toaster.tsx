"use client"

// src/components/ui/toaster.tsx
import { useToast } from "../../hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      {/* Updated viewport positioning */}
      <ToastViewport className="fixed bottom-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}