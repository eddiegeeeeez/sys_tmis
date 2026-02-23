import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn("relative w-full", className)}>
    <select
      ref={ref}
      className="flex h-10 w-full items-center rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
  </div>
))
Select.displayName = "Select"

export { Select }