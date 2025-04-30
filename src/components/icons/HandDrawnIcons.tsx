// src/components/icons/HandDrawnIcons.tsx
import React from 'react';

// Using simple paths and slight randomness/waviness for a hand-drawn feel
// Stroke width and color can be controlled via className (e.g., using Tailwind)

export const HandDrawnStrengthIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5" // Thinner for hand-drawn
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("feather feather-anchor", className)} // Example class, replace feather if needed
    {...props}
  >
    {/* Simple bicep/muscle shape */}
    <path d="M 9 12 C 7 10, 7 6, 10 5 C 13 4, 15 6, 15 8 Q 17 10, 17 14 C 17 18, 13 20, 9 19 Q 7 18, 7 15 Z" />
     <path d="M 15 8 C 16 7, 18 7, 19 9" />
  </svg>
);

export const HandDrawnStaminaIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("feather feather-heart", className)}
    {...props}
  >
    {/* Heart shape */}
     <path d="M 12 21.35 L 10.55 20.03 C 5.4 15.36, 2 12.28, 2 8.5 C 2 5.42, 4.42 3, 7.5 3 C 9.24 3, 10.91 3.81, 12 5.09 C 13.09 3.81, 14.76 3, 16.5 3 C 19.58 3, 22 5.42, 22 8.5 C 22 12.28, 18.6 15.36, 13.45 20.04 L 12 21.35 Z" />
  </svg>
);

export const HandDrawnAgilityIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
     className={cn("feather feather-wind", className)}
    {...props}
  >
    {/* Wavy lines suggesting wind/speed */}
    <path d="M 3 12 H 21" />
    <path d="M 3 7 Q 8 5, 12 7 T 21 7" />
    <path d="M 3 17 Q 8 19, 12 17 T 21 17" />
  </svg>
);

export const HandDrawnMagicIcon = ({ className = "w-6 h-6", ...props }) => (
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("feather feather-star", className)} // Using star as a basis
    {...props}
 >
    {/* Simple star with slightly uneven points */}
    <polygon points="12 2 14.5 8.5 21 9.5 16 14.5 17.5 21 12 17.5 6.5 21 8 14.5 3 9.5 9.5 8.5 12 2" />
 </svg>
);

export const HandDrawnHistoryIcon = ({ className = "w-6 h-6", ...props }) => (
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("feather feather-book-open", className)}
    {...props}
 >
   {/* Open book */}
    <path d="M 2 3 C 2 3, 5 1, 12 4 C 19 1, 22 3, 22 3 V 19 C 22 19, 19 21, 12 18 C 5 21, 2 19, 2 19 Z" />
    <path d="M 12 4 V 18" />
    <path d="M 9 7 h 1 M 9 10 h 3 M 9 13 h 2" /> {/* Simple lines for text */}
     <path d="M 15 7 h -1 M 15 10 h -3 M 15 13 h -2" />
 </svg>
);

export const HandDrawnMapIcon = ({ className = "w-6 h-6", ...props }) => (
 <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("feather feather-map", className)}
    {...props}
 >
    {/* Simple folded map */}
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
    <line x1="8" y1="2" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="22" />
 </svg>
);

// Helper to make cn available if used directly
import { cn } from "@/lib/utils";
