
import * as React from "react"

import { cn } from "../../lib/utils"
import {
  Card as ShadCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

const CardboardCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ShadCard
    ref={ref}
    className={cn(
      "border-2 border-foreground/30 shadow-md rounded-sm bg-card", // Slightly less rounded, visible border
      className
    )}
    {...props}
  />
))
CardboardCard.displayName = "CardboardCard"

// Re-export other Card parts for convenience
export { CardboardCard, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
