
import * as React from "react"
import { cn } from "../../lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/80", // Slightly less transparent muted background
         "duration-1000", // Slow down pulse animation slightly
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
