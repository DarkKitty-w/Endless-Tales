// src/lib/themes.ts

export interface Theme {
    name: string;
    id: string;
    light: Record<string, string>; // CSS variable -> HSL value
    dark: Record<string, string>;
}

// --- Define Color Themes ---
export const THEMES: Theme[] = [
    {
        name: "Cardboard",
        id: "cardboard",
        light: {
            "--background": "20 15% 95%",
            "--foreground": "20 10% 20%",
            "--card": "30 20% 92%",
            "--card-foreground": "20 10% 20%",
            "--popover": "30 20% 92%",
            "--popover-foreground": "20 10% 20%",
            "--primary": "0 0% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "30 15% 80%",
            "--secondary-foreground": "20 10% 20%",
            "--muted": "30 15% 85%",
            "--muted-foreground": "0 0% 45%",
            "--accent": "20 60% 50%", // Burnt Orange
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 75%",
            "--input": "20 10% 80%",
            "--ring": "20 60% 50%",
            "--chart-1": "12 76% 61%",
            "--chart-2": "173 58% 39%",
            "--chart-3": "197 37% 24%",
            "--chart-4": "43 74% 66%",
            "--chart-5": "27 87% 67%",
        },
        dark: {
            "--background": "20 10% 10%",
            "--foreground": "20 5% 95%",
            "--card": "20 10% 15%",
            "--card-foreground": "20 5% 95%",
            "--popover": "20 10% 15%",
            "--popover-foreground": "20 5% 95%",
            "--primary": "0 0% 70%",
            "--primary-foreground": "0 0% 10%",
            "--secondary": "30 10% 25%",
            "--secondary-foreground": "20 5% 95%",
            "--muted": "30 10% 20%",
            "--muted-foreground": "0 0% 63.9%",
            "--accent": "20 60% 50%", // Burnt Orange
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 30%",
            "--input": "20 10% 35%",
            "--ring": "20 60% 50%",
            "--chart-1": "220 70% 50%",
            "--chart-2": "160 60% 45%",
            "--chart-3": "30 80% 55%",
            "--chart-4": "280 65% 60%",
            "--chart-5": "340 75% 55%",
        }
    },
    {
        name: "Ocean Depths",
        id: "ocean",
        light: {
             "--background": "210 40% 98%",
             "--foreground": "210 30% 15%",
             "--card": "210 40% 94%",
             "--card-foreground": "210 30% 15%",
             "--popover": "210 40% 94%",
             "--popover-foreground": "210 30% 15%",
             "--primary": "210 60% 45%", // Deep Blue
             "--primary-foreground": "0 0% 100%",
             "--secondary": "180 40% 85%", // Tealish Gray
             "--secondary-foreground": "210 30% 15%",
             "--muted": "210 40% 90%",
             "--muted-foreground": "210 15% 45%",
             "--accent": "185 70% 50%", // Cyan/Teal
             "--accent-foreground": "210 30% 15%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "210 20% 75%",
             "--input": "210 20% 80%",
             "--ring": "185 70% 50%",
             "--chart-1": "210 80% 55%",
             "--chart-2": "185 75% 45%",
             "--chart-3": "195 60% 60%",
             "--chart-4": "220 50% 70%",
             "--chart-5": "170 65% 40%",
         },
         dark: {
             "--background": "210 30% 10%",
             "--foreground": "210 20% 95%",
             "--card": "210 30% 15%",
             "--card-foreground": "210 20% 95%",
             "--popover": "210 30% 15%",
             "--popover-foreground": "210 20% 95%",
             "--primary": "210 70% 65%", // Lighter Deep Blue
             "--primary-foreground": "210 30% 10%",
             "--secondary": "180 30% 25%", // Dark Tealish Gray
             "--secondary-foreground": "210 20% 95%",
             "--muted": "210 30% 20%",
             "--muted-foreground": "210 15% 63.9%",
             "--accent": "185 60% 60%", // Brighter Cyan/Teal
             "--accent-foreground": "210 30% 10%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "210 20% 30%",
             "--input": "210 20% 35%",
             "--ring": "185 60% 60%",
             "--chart-1": "210 70% 60%",
             "--chart-2": "185 65% 55%",
             "--chart-3": "195 50% 70%",
             "--chart-4": "220 40% 80%",
             "--chart-5": "170 70% 50%",
         }
    },
    {
        name: "Forest Canopy",
        id: "forest",
         light: {
             "--background": "120 10% 96%",
             "--foreground": "120 20% 10%",
             "--card": "110 15% 93%",
             "--card-foreground": "120 20% 10%",
             "--popover": "110 15% 93%",
             "--popover-foreground": "120 20% 10%",
             "--primary": "120 50% 35%", // Forest Green
             "--primary-foreground": "0 0% 100%",
             "--secondary": "40 30% 80%", // Light Brown/Beige
             "--secondary-foreground": "120 20% 10%",
             "--muted": "110 15% 90%",
             "--muted-foreground": "120 10% 45%",
             "--accent": "90 60% 55%", // Leaf Green
             "--accent-foreground": "120 20% 10%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "110 10% 75%",
             "--input": "110 10% 80%",
             "--ring": "90 60% 55%",
             "--chart-1": "120 60% 40%",
             "--chart-2": "90 70% 50%",
             "--chart-3": "40 40% 60%",
             "--chart-4": "100 50% 70%",
             "--chart-5": "80 65% 45%",
         },
         dark: {
             "--background": "120 20% 8%",
             "--foreground": "110 10% 94%",
             "--card": "120 20% 12%",
             "--card-foreground": "110 10% 94%",
             "--popover": "120 20% 12%",
             "--popover-foreground": "110 10% 94%",
             "--primary": "120 60% 55%", // Brighter Forest Green
             "--primary-foreground": "120 20% 8%",
             "--secondary": "40 25% 20%", // Dark Brown
             "--secondary-foreground": "110 10% 94%",
             "--muted": "120 20% 15%",
             "--muted-foreground": "110 10% 63.9%",
             "--accent": "90 50% 65%", // Brighter Leaf Green
             "--accent-foreground": "120 20% 8%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "110 10% 25%",
             "--input": "110 10% 30%",
             "--ring": "90 50% 65%",
             "--chart-1": "120 50% 50%",
             "--chart-2": "90 60% 60%",
             "--chart-3": "40 30% 40%",
             "--chart-4": "100 40% 80%",
             "--chart-5": "80 55% 60%",
         }
    },
    {
         name: "Mystic Scroll",
         id: "scroll",
         light: {
             "--background": "35 40% 94%", // Parchment
             "--foreground": "35 15% 20%", // Dark Ink Brown
             "--card": "35 45% 90%",
             "--card-foreground": "35 15% 20%",
             "--popover": "35 45% 90%",
             "--popover-foreground": "35 15% 20%",
             "--primary": "50 60% 50%", // Gold/Yellow Ochre
             "--primary-foreground": "35 15% 20%",
             "--secondary": "0 40% 85%", // Muted Red/Terracotta
             "--secondary-foreground": "35 15% 20%",
             "--muted": "35 40% 92%",
             "--muted-foreground": "35 10% 45%",
             "--accent": "280 50% 60%", // Purple/Violet
             "--accent-foreground": "0 0% 100%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "35 15% 70%",
             "--input": "35 15% 75%",
             "--ring": "280 50% 60%",
             "--chart-1": "50 70% 60%",
             "--chart-2": "0 50% 70%",
             "--chart-3": "280 60% 65%",
             "--chart-4": "35 30% 50%",
             "--chart-5": "240 40% 75%",
         },
         dark: {
             "--background": "35 15% 12%", // Dark Parchment/Brown
             "--foreground": "35 25% 92%", // Light Ink Beige
             "--card": "35 15% 18%",
             "--card-foreground": "35 25% 92%",
             "--popover": "35 15% 18%",
             "--popover-foreground": "35 25% 92%",
             "--primary": "50 70% 70%", // Brighter Gold
             "--primary-foreground": "35 15% 12%",
             "--secondary": "0 30% 30%", // Dark Terracotta
             "--secondary-foreground": "35 25% 92%",
             "--muted": "35 15% 22%",
             "--muted-foreground": "35 10% 63.9%",
             "--accent": "280 60% 75%", // Brighter Purple
             "--accent-foreground": "35 15% 12%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "35 15% 35%",
             "--input": "35 15% 40%",
             "--ring": "280 60% 75%",
             "--chart-1": "50 60% 65%",
             "--chart-2": "0 40% 55%",
             "--chart-3": "280 50% 70%",
             "--chart-4": "35 20% 40%",
             "--chart-5": "240 50% 80%",
         }
    },
    {
         name: "Nightshade",
         id: "nightshade",
         light: { // Keep light mode less extreme, more like a twilight
             "--background": "240 10% 90%",
             "--foreground": "240 20% 10%",
             "--card": "240 15% 85%",
             "--card-foreground": "240 20% 10%",
             "--popover": "240 15% 85%",
             "--popover-foreground": "240 20% 10%",
             "--primary": "260 60% 55%", // Deep Purple
             "--primary-foreground": "0 0% 100%",
             "--secondary": "300 30% 75%", // Muted Magenta/Pinkish
             "--secondary-foreground": "240 20% 10%",
             "--muted": "240 15% 88%",
             "--muted-foreground": "240 10% 45%",
             "--accent": "150 50% 50%", // Vibrant Teal/Green
             "--accent-foreground": "240 20% 10%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "240 10% 70%",
             "--input": "240 10% 75%",
             "--ring": "150 50% 50%",
             "--chart-1": "260 70% 60%",
             "--chart-2": "300 40% 80%",
             "--chart-3": "150 60% 55%",
             "--chart-4": "240 30% 70%",
             "--chart-5": "280 50% 65%",
         },
         dark: {
             "--background": "240 20% 6%", // Very Dark Blue/Black
             "--foreground": "240 10% 95%", // Light Gray
             "--card": "240 20% 10%",
             "--card-foreground": "240 10% 95%",
             "--popover": "240 20% 10%",
             "--popover-foreground": "240 10% 95%",
             "--primary": "260 70% 70%", // Brighter Deep Purple
             "--primary-foreground": "240 20% 6%",
             "--secondary": "300 40% 25%", // Dark Magenta
             "--secondary-foreground": "240 10% 95%",
             "--muted": "240 20% 12%",
             "--muted-foreground": "240 10% 63.9%",
             "--accent": "150 60% 65%", // Brighter Teal
             "--accent-foreground": "240 20% 6%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "240 10% 20%",
             "--input": "240 10% 25%",
             "--ring": "150 60% 65%",
             "--chart-1": "260 60% 65%",
             "--chart-2": "300 30% 50%",
             "--chart-3": "150 50% 70%",
             "--chart-4": "240 20% 40%",
             "--chart-5": "280 40% 60%",
         }
    }
];
