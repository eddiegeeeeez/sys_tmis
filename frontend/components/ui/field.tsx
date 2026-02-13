import React from "react"
import { cn } from "../../lib/utils"

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />
}

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-4", className)} {...props} />
}

export function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-zinc-500", className)}
      {...props}
    />
  )
}

export function FieldSeparator({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-zinc-200",
        className
      )}
      {...props}
    >
      <span className="relative z-10 bg-white px-2 text-zinc-500">
        {children}
      </span>
    </div>
  )
}