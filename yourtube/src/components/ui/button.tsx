import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-gray-300 bg-white text-gray-900 shadow-xs hover:bg-gray-100 hover:text-gray-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 sm:h-10 md:h-12 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 has-[>svg]:px-3 sm:has-[>svg]:px-4 md:has-[>svg]:px-5 text-sm sm:text-base md:text-lg",
        sm: "h-8 sm:h-9 md:h-10 rounded-md gap-1.5 px-3 sm:px-4 md:px-5 has-[>svg]:px-2.5 sm:has-[>svg]:px-3 md:has-[>svg]:px-4 text-xs sm:text-sm md:text-base",
        lg: "h-10 sm:h-12 md:h-14 rounded-md px-6 sm:px-8 md:px-10 has-[>svg]:px-4 sm:has-[>svg]:px-5 md:has-[>svg]:px-6 text-base sm:text-lg md:text-xl",
        icon: "size-9 sm:size-10 md:size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
