"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send, X } from "lucide-react";
import type { ChatMessage } from "../../types/multiplayer-types";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Array<ChatMessage['payload']>;
  onSendMessage: (text: string) => void;
  currentPlayerName: string;
}

export function ChatPanel({ isOpen, onClose, messages, onSendMessage, currentPlayerName }: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`fixed right-4 top-4 bottom-4 w-80 z-50 flex flex-col transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-[120%]'
    }`}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg">Party Chat</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef} aria-live="polite" aria-atomic="false" role="log">
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg, index) => {
              const isMe = msg.playerName === currentPlayerName;
              return (
                <div 
                  key={index} 
                  className={`flex flex-col ${
                    isMe ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-xs font-medium ${
                      isMe ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {isMe ? 'You' : msg.playerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className={`rounded-lg px-3 py-2 max-w-[85%] break-words ${
                    isMe 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 pt-2 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
export default React.memo(ChatPanel);
