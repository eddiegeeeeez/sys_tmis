import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const statusDotVariants = cva(
    "inline-flex items-center gap-2 text-xs font-medium",
    {
        variants: {
            variant: {
                success: "text-emerald-700 dark:text-emerald-400",
                warning: "text-amber-700 dark:text-amber-400",
                error: "text-red-700 dark:text-red-400",
                info: "text-blue-700 dark:text-blue-400",
                neutral: "text-zinc-600 dark:text-zinc-400",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    }
)

const dotVariants = cva(
    "h-1.5 w-1.5 rounded-full",
    {
        variants: {
            variant: {
                success: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                warning: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                error: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                info: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                neutral: "bg-zinc-400 dark:bg-zinc-500",
            },
        },
        defaultVariants: {
            variant: "neutral",
        },
    }
)

export interface StatusDotProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusDotVariants> { }

const StatusDot = React.forwardRef<HTMLDivElement, StatusDotProps>(
    ({ className, variant, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(statusDotVariants({ variant }), className)}
                {...props}
            >
                <span className={cn(dotVariants({ variant }))} />
                {children}
            </div>
        )
    }
)
StatusDot.displayName = "StatusDot"

export { StatusDot, statusDotVariants }
