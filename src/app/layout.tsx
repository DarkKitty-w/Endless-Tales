import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { GameProvider } from '@/context/GameContext'; // Import GameProvider
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Endless Tales', // Updated Title
  description: 'An AI-driven text adventure game.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <GameProvider> {/* Wrap children with GameProvider */}
          {children}
           <Toaster /> {/* Add Toaster for notifications */}
        </GameProvider>
      </body>
    </html>
  );
}
