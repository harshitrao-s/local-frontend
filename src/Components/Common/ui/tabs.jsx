import React from "react"
import { cva } from "class-variance-authority"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "../../../lib/utils"

// Root
function Tabs({ className, orientation = "horizontal", ...props }) {
  return (
    <TabsPrimitive.Root
      data-orientation={orientation}
      className={cn(
        "flex gap-2 flex-col",
        className
      )}
      {...props}
    />
  )
}

// Variants
const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg p-[3px]",
  {
    variants: {
      variant: {
        default: "bg-gray-100",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Tabs List
function TabsList({ className, variant = "default", ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

// Trigger
function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:text-black data-[state=active]:bg-white data-[state=active]:text-black",
        className
      )}
      {...props}
    />
  )
}

// Content
function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-2 text-sm", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }