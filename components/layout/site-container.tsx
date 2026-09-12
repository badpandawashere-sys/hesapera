import * as React from "react"
import { cn } from "@/lib/utils"

export function SiteContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 max-w-[1440px]",
        className
      )}
      {...props}
    />
  )
}
