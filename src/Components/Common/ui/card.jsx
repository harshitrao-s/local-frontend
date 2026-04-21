import React from "react"
import { cn } from "../../../lib/utils"

// Card
function Card({ className, size = "default", ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm border",
        className
      )}
      {...props}
    />
  )
}

// Header
function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-1 px-1", className)}
      {...props}
    />
  )
}

// Title
function CardTitle({ className, ...props }) {
  return (
    <div
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  )
}

// Description
function CardDescription({ className, ...props }) {
  return (
    <div
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  )
}

// Action
function CardAction({ className, ...props }) {
  return (
    <div
      className={cn("ml-auto", className)}
      {...props}
    />
  )
}

// Content
function CardContent({ className, ...props }) {
  return (
    <div
      className={cn("px-1", className)}
      {...props}
    />
  )
}

// Footer
function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end border-t pt-3 mt-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}