"use client";

import React, { useState } from "react";
import type { MultiplayerState, PeerInfo, PlayerSummary } from "../../types/multiplayer-types";
import { Users, Crown, Sword, MessageSquare, Handshake } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

interface PartySidebarProps {
  multiplayerState: MultiplayerState;
  isHost: boolean;
  onKickPeer?: (peerId: string) => void;
  onTogglePause?: () => void;
  onOpenChat?: () => void;
  onSetTurnOrder?: (turnOrder: string[]) => void;
  onReconnect?: () => void;
  isReconnecting?: boolean;
  onSendTradeRequest?: (targetPeerId: string) => void;
}

function PartySidebarInternal({ 
  multiplayerState, 
  isHost, 
  onKickPeer, 
  onTogglePause, 
  onOpenChat,
  onSetTurnOrder,
  onReconnect,
  isReconnecting,
  onSendTradeRequest
}: PartySidebarProps) {
  const { peers, turnOrder, currentTurnIndex, isPaused, partyState, connectionStatus } = multiplayerState;

  const getPeerDisplayName = (peerId: string): string => {
    if (peerId === multiplayerState.peerId) return 'You';
    const peer = peers.find(p => p.peerId === peerId);
    return peer?.name || partyState[peerId]?.name || 'Unknown';
  };

  const getPeerCharacterName = (peerId: string): string | undefined => {
    if (peerId === multiplayerState.peerId) {
      // For self, we'd need to get from context - but for now return undefined
      return undefined;
    }
    const playerSummary = partyState[peerId];
    return playerSummary?.name;
  };

  const isCurrentTurn = (peerId: string): boolean => {
    return turnOrder[currentTurnIndex] === peerId;
  };

  // State for kick confirmation
  const [kickPeerId, setKickPeerId] = useState<string | null>(null);
  const [kickPlayerName, setKickPlayerName] = useState<string>("");

  // Handle kick confirmation
  const handleKickClick = (peerId: string) => {
    const displayName = getPeerDisplayName(peerId);
    setKickPeerId(peerId);
    setKickPlayerName(displayName);
  };

  const handleKickConfirm = () => {
    if (kickPeerId && onKickPeer) {
      onKickPeer(kickPeerId);
      setKickPeerId(null);
      setKickPlayerName("");
    }
  };

  const handleKickCancel = () => {
    setKickPeerId(null);
    setKickPlayerName("");
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Party
        </h3>
        <Badge variant="outline">
          {peers.length + 1} / 4
        </Badge>
      </div>

      {isHost && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTogglePause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onOpenChat}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>
      )}

      <Separator />

      {/* Turn Order */}
      <div>
        <h4 className="text-sm font-medium mb-2">Turn Order</h4>
        <div className="space-y-2">
          {turnOrder.map((peerId, index) => {
            const isYou = peerId === multiplayerState.peerId;
            const isCurrent = index === currentTurnIndex;
            const displayName = getPeerDisplayName(peerId);
            const characterName = getPeerCharacterName(peerId);
            const playerSummary = partyState[peerId];
            
            return (
              <div 
                key={peerId} 
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  isCurrent ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrent && <Sword className="h-4 w-4 text-primary" />}
                  {isYou && <Crown className="h-4 w-4 text-yellow-500" />}
                  <span className="text-sm">
                    {displayName}
                  </span>
                  {characterName && (
                    <span className="text-xs text-muted-foreground">
                      ({characterName})
                    </span>
                  )}
                  {/* Player stats display */}
                  {playerSummary && (
                    <div className="ml-2 flex gap-2 text-xs">
                      <span className="text-red-500">{playerSummary.currentHealth}/{playerSummary.maxHealth}</span>
                      <span className="text-blue-500">{playerSummary.currentStamina}/{playerSummary.maxStamina}</span>
                      <span className="text-purple-500">{playerSummary.currentMana}/{playerSummary.maxMana}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {isCurrent && (
                    <Badge variant="default" className="text-xs">Current Turn</Badge>
                  )}
                  {isHost && !isYou && onSetTurnOrder && (
                    <div className="flex gap-1">
                      {index > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newOrder = [...turnOrder];
                            [newOrder[index-1], newOrder[index]] = [newOrder[index], newOrder[index-1]];
                            onSetTurnOrder(newOrder);
                          }}
                          className="text-xs px-1"
                        >
                          ↑
                        </Button>
                      )}
                      {index < turnOrder.length - 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newOrder = [...turnOrder];
                            [newOrder[index], newOrder[index+1]] = [newOrder[index+1], newOrder[index]];
                            onSetTurnOrder(newOrder);
                          }}
                          className="text-xs px-1"
                        >
                          ↓
                        </Button>
                      )}
                    </div>
                  )}
                  {!isYou && onSendTradeRequest && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSendTradeRequest(peerId)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Request Trade"
                    >
                      <Handshake className="h-4 w-4" />
                    </Button>
                  )}
                  {isHost && !isYou && onKickPeer && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            handleKickClick(peerId);
                          }}
                        >
                          Kick
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kick Player?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove <span className="font-semibold">{kickPlayerName}</span> from the party. 
                            This action is disruptive and irreversible for the guest. They will need to rejoin if they want to continue playing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleKickCancel}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleKickConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Kick Player
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Connected Players from partyState */}
      <div className="flex-1">
        <h4 className="text-sm font-medium mb-2">Connected Players</h4>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {/* Self */}
            {(() => {
              const selfSummary = partyState[multiplayerState.peerId];
              return (
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">You</span>
                    {selfSummary && (
                      <span className="text-xs text-muted-foreground">
                        (Lvl {selfSummary.level} {selfSummary.class})
                      </span>
                    )}
                    {/* Self stats display */}
                    {selfSummary && (
                      <div className="ml-2 flex gap-3 text-xs">
                        <span className="text-red-500">{selfSummary.currentHealth}/{selfSummary.maxHealth}</span>
                        <span className="text-blue-500">{selfSummary.currentStamina}/{selfSummary.maxStamina}</span>
                        <span className="text-purple-500">{selfSummary.currentMana}/{selfSummary.maxMana}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">Host</Badge>
                </div>
              );
            })()}
            
            {/* Other peers from partyState */}
            {Object.entries(partyState)
              .filter(([peerId]) => peerId !== multiplayerState.peerId)
              .map(([peerId, playerSummary]) => (
              <div key={peerId} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{playerSummary.name}</span>
                  <span className="text-xs text-muted-foreground">
                    (Lvl {playerSummary.level} {playerSummary.class})
                  </span>
                  {/* Player stats display */}
                  <div className="ml-2 flex gap-3 text-xs">
                    <span className="text-red-500">{playerSummary.currentHealth}/{playerSummary.maxHealth}</span>
                    <span className="text-blue-500">{playerSummary.currentStamina}/{playerSummary.maxStamina}</span>
                    <span className="text-purple-500">{playerSummary.currentMana}/{playerSummary.maxMana}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {isHost && onKickPeer && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            handleKickClick(peerId);
                          }}
                        >
                          Kick
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Kick Player?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove <span className="font-semibold">{kickPlayerName}</span> from the party. 
                            This action is disruptive and irreversible for the guest. They will need to rejoin if they want to continue playing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={handleKickCancel}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleKickConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Kick Player
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
            
            {/* Empty state when no other players */}
            {Object.entries(partyState).filter(([peerId]) => peerId !== multiplayerState.peerId).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No party members yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Invite players to join your party using the room code or invite link.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {isPaused && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
          <p className="text-sm text-yellow-600">Game Paused</p>
        </div>
      )}

      {/* Reconnect button - show when disconnected */}
      {connectionStatus === 'disconnected' && onReconnect && (
        <div className="p-3 border border-red-500/20 rounded-lg text-center space-y-2">
          <p className="text-sm text-red-600">Disconnected</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReconnect}
            disabled={isReconnecting}
          >
            {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
          </Button>
        </div>
      )}

      {/* Reconnecting indicator */}
      {isReconnecting && connectionStatus === 'connecting' && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
          <p className="text-sm text-blue-600">Reconnecting...</p>
        </div>
      )}
    </div>
  );
}

export const PartySidebar = React.memo(PartySidebarInternal);
