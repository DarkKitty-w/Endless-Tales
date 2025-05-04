
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants" // Import constants

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & { value: number[] } // Ensure value is always an array
>(({ className, value, ...props }, ref) => {
  // Calculate the percentage width based on the value within the MIN/MAX range
  const percentage = ((value[0] - MIN_STAT_VALUE) / (MAX_STAT_VALUE - MIN_STAT_VALUE)) * 100;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center group", // Add group class for thumb hover state
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        {/* Use width style to represent the value visually */}
        <SliderPrimitive.Range
           className="absolute h-full bg-primary transition-all"
           style={{ width: `${percentage}%` }}
         />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-all", // Base styles + transition-all
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", // Focus styles
          "disabled:pointer-events-none disabled:opacity-50", // Disabled styles
          "cursor-pointer group-hover:scale-110" // Hover scale effect
        )}
       />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

