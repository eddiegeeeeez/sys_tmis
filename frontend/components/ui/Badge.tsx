import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300",
  {
    variants: {
      variant: {
        // Pill / Tag Styles
        default:
          "rounded-full border border-transparent bg-zinc-900 px-2.5 py-0.5 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/80",
        secondary:
          "rounded-full border border-transparent bg-zinc-100 px-2.5 py-0.5 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80",
        outline: "rounded-full text-zinc-950 border border-zinc-200 px-2.5 py-0.5 dark:text-zinc-50 dark:border-zinc-800",
        
        // Status Styles (Text + Dot)
        success: "text-emerald-600 gap-1.5 before:content-[''] before:h-2 before:w-2 before:rounded-full before:bg-emerald-500 dark:text-emerald-400 dark:before:bg-emerald-400",
        warning: "text-amber-600 gap-1.5 before:content-[''] before:h-2 before:w-2 before:rounded-full before:bg-amber-500 dark:text-amber-400 dark:before:bg-amber-400",
        destructive: "text-red-600 gap-1.5 before:content-[''] before:h-2 before:w-2 before:rounded-full before:bg-red-500 dark:text-red-400 dark:before:bg-red-400",
        neutral: "text-zinc-500 gap-1.5 before:content-[''] before:h-2 before:w-2 before:rounded-full before:bg-zinc-400 dark:text-zinc-400 dark:before:bg-zinc-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }