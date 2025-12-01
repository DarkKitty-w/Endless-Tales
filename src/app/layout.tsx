
import React from 'react';
import type {Metadata} from 'next';
import { GameProvider } from '../context/GameContext'; // Import GameProvider
import { Toaster } from "../components/ui/toaster"; // Import Toaster
import "./globals.css";

export const metadata: Metadata = {
  title: 'Endless Tales', 
  description: 'An AI-driven text adventure game.', 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Remove font variables class for now */}
      <body className={`antialiased font-sans`} suppressHydrationWarning>
        <GameProvider> {/* Wrap children with GameProvider */}
          {children}
           <Toaster /> {/* Add Toaster for notifications */}
        </GameProvider>
      </body>
    </html>
  );
}
