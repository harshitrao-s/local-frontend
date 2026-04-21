import React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "../../../lib/utils"
import { Button } from "./button"

// Root
function AlertDialog(props) {
  return <AlertDialogPrimitive.Root {...props} />
}

// Trigger
function AlertDialogTrigger(props) {
  return <AlertDialogPrimitive.Trigger {...props} />
}

// Portal
function AlertDialogPortal(props) {
  return <AlertDialogPrimitive.Portal {...props} />
}

// Overlay
function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/10 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

// Content
function AlertDialogContent({ className, size = "default", ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-4 shadow-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

// Header
function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center", className)}
      {...props}
    />
  )
}

// Footer
function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex justify-end gap-2 mt-4",
        className
      )}
      {...props}
    />
  )
}

// Media
function AlertDialogMedia({ className, ...props }) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

// Title
function AlertDialogTitle({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

// Description
function AlertDialogDescription({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Description
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

// Action
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action className={cn(className)} {...props} />
    </Button>
  )
}

// Cancel
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel className={cn(className)} {...props} />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}