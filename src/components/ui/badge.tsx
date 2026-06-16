import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
      interactive: {
        true: "cursor-pointer select-none hover:brightness-95 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      interactive: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, interactive, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, interactive }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
