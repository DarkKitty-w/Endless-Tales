// src/components/gameplay/GameplayLayout.tsx
"use client";

import React, { type RefObject } from "react";
import { LeftPanel } from "../game/LeftPanel";
import { MobileSheet } from "./MobileSheet";
import { NarrationDisplay } from "./NarrationDisplay";
import { ActionInput, type ActionInputRef } from "./ActionInput";
import { AIStatusPanel } from "./AIStatusPanel";
import { GameplayActions } from "./GameplayActions";
import { ClassChangeDialog } from "./ClassChangeDialog";
import { CraftingDialog } from "./CraftingDialog";
import { SettingsPanel } from "../screens/SettingsPanel";
import { PartySidebar } from "./PartySidebar";
import { ChatPanel } from "./ChatPanel";
import { InteractionDialog } from "./InteractionDialog";
import { ErrorBoundary } from "../ErrorBoundary";
import type { Character, InventoryItem, StoryLogEntry, NarrateAdventureOutput, LoadingPhase, MultiplayerState } from "../types/game-types";
import type { InteractionRequest } from "../types/multiplayer-types";

interface GameplayLayoutProps {
  character: Character;
  inventory: InventoryItem[];
  isGeneratingSkillTree: boolean;
  turnCount: number;
  storyLog: StoryLogEntry[];
  loadingPhase: LoadingPhase;
  diceResult: number | null;
  diceType: string;
  error: string | null;
  branchingChoices: NarrateAdventureOutput['branchingChoices'];
  isInitialLoading: boolean;
  anyLoading: boolean;
  isConnected: boolean;
  isMultiplayerHost: boolean;
  pendingGuestAction: string | null;
  currentAdventureId: string | null;
  aiProvider: string;
  multiplayerState: MultiplayerState;
  isPartySidebarOpen: boolean;
  isChatPanelOpen: boolean;
  isDesktopSettingsOpen: boolean;
  isCraftingDialogOpen: boolean;
  pendingClassChange: string | null;
  onUseSkill: (skill: any) => void;
  onChoiceClick: (choice: any) => void;
  onRetryNarration: () => void;
  onSubmitAction: (action: string) => void;
  onSuggestAction: () => void;
  onCraft: () => void;
  onSave: () => void;
  onAbandon: () => void;
  onEnd: () => void;
  onSettings: () => void;
  onChangeClass: (className: string) => void;
  onConfirmClassChange: (className: string) => void;
  onKickPeer: (peerId: string) => void;
  onTogglePause: () => void;
  onOpenChat: () => void;
  onSetTurnOrder: (order: string[]) => void;
  onReconnect: () => void;
  onSendTradeRequest: (targetPeerId: string) => void;
  onSendInteractionResponse: (accepted: boolean) => void;
  isReconnecting: boolean;
  actionInputRef: React.RefObject<ActionInputRef>;
  onClosePartySidebar: () => void;
  onCloseChatPanel: () => void;
  onCloseSettings: () => void;
  onCloseCrafting: () => void;
  onCloseClassChange: () => void;
  isMobile: boolean;
  currentInteraction: any;
  isInteractionDialogOpen: boolean;
  isInteractionTarget: boolean;
  onSetIsInteractionDialogOpen: (open: boolean) => void;
}

export function GameplayLayout({
  character,
  inventory,
  isGeneratingSkillTree,
  turnCount,
  storyLog,
  loadingPhase,
  diceResult,
  diceType,
  error,
  branchingChoices,
  isInitialLoading,
  anyLoading,
  isConnected,
  isMultiplayerHost,
  pendingGuestAction,
  currentAdventureId,
  aiProvider,
  multiplayerState,
  isPartySidebarOpen,
  isChatPanelOpen,
  isDesktopSettingsOpen,
  isCraftingDialogOpen,
  pendingClassChange,
  onUseSkill,
  onChoiceClick,
  onRetryNarration,
  onSubmitAction,
  onSuggestAction,
  onCraft,
  onSave,
  onAbandon,
  onEnd,
  onSettings,
  onChangeClass,
  onConfirmClassChange,
  onKickPeer,
  onTogglePause,
  onOpenChat,
  onSetTurnOrder,
  onReconnect,
  onSendTradeRequest,
  onSendInteractionResponse,
  isReconnecting,
  actionInputRef,
  onClosePartySidebar,
  onCloseChatPanel,
  onCloseSettings,
  onCloseCrafting,
  onCloseClassChange,
  isMobile,
  currentInteraction,
  isInteractionDialogOpen,
  isInteractionTarget,
  onSetIsInteractionDialogOpen,
}: GameplayLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
      <ErrorBoundary>
        <LeftPanel
          character={character}
          inventory={inventory}
          isGeneratingSkillTree={isGeneratingSkillTree}
          turnCount={turnCount}
          onUseSkill={onUseSkill}
        />
      </ErrorBoundary>
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <MobileSheet
          character={character}
          inventory={inventory}
          isGeneratingSkillTree={isGeneratingSkillTree}
          turnCount={turnCount}
          onSettingsOpen={onSettings}
          onUseSkill={onUseSkill}
        />
        <ErrorBoundary>
          <NarrationDisplay
            storyLog={storyLog}
            loadingPhase={loadingPhase}
            diceResult={diceResult}
            diceType={diceType}
            error={error}
            branchingChoices={branchingChoices}
            onChoiceClick={onChoiceClick}
            isInitialLoading={isInitialLoading}
            onRetryNarration={onRetryNarration}
            pendingGuestAction={pendingGuestAction}
            isConnected={isConnected}
            isMultiplayerHost={isMultiplayerHost}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <ActionInput
            ref={actionInputRef}
            onSubmit={onSubmitAction}
            onSuggest={onSuggestAction}
            onCraft={onCraft}
            disabled={anyLoading || character.class === 'admin000'}
            isWaitingForHost={!!pendingGuestAction}
          />
        </ErrorBoundary>
        <AIStatusPanel />
        <GameplayActions
          onSave={onSave}
          onAbandon={onAbandon}
          onEnd={onEnd}
          onSettings={onSettings}
          onChangeClass={onChangeClass}
          disabled={anyLoading}
          isMobile={isMobile}
          currentAdventureId={currentAdventureId}
          aiProvider={aiProvider}
        />
        <ClassChangeDialog
          isOpen={!!pendingClassChange}
          onOpenChange={(open) => !open && onCloseClassChange()}
          character={character}
          pendingClassChange={pendingClassChange}
          onConfirm={onConfirmClassChange}
        />
        <CraftingDialog
          isOpen={isCraftingDialogOpen}
          onOpenChange={(open) => !open && onCloseCrafting()}
          inventory={inventory}
          onCraft={() => {}}
        />
        <SettingsPanel isOpen={isDesktopSettingsOpen} onOpenChange={(open) => !open && onCloseSettings()} />
      </div>

      {/* Multiplayer Sidebar */}
      {!!multiplayerState.sessionId && (
        <>
          <div className={`fixed left-4 top-4 bottom-4 w-64 z-50 transition-transform duration-300 ${isPartySidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
            <ErrorBoundary>
              <PartySidebar
                multiplayerState={multiplayerState}
                isHost={isMultiplayerHost}
                onKickPeer={onKickPeer}
                onTogglePause={onTogglePause}
                onOpenChat={onOpenChat}
                onSetTurnOrder={onSetTurnOrder}
                onReconnect={onReconnect}
                isReconnecting={isReconnecting}
                onSendTradeRequest={onSendTradeRequest}
              />
            </ErrorBoundary>
          </div>
          <ErrorBoundary>
            <ChatPanel
              isOpen={isChatPanelOpen}
              onClose={onCloseChatPanel}
              messages={multiplayerState.chatMessages}
              onSendMessage={() => {}}
              currentPlayerName={character?.name || 'Player'}
            />
          </ErrorBoundary>
        </>
      )}

      {/* Interaction Dialog */}
      <ErrorBoundary>
        <InteractionDialog
          isOpen={isInteractionDialogOpen}
          interaction={currentInteraction}
          isTarget={isInteractionTarget}
          onAccept={() => onSendInteractionResponse(true)}
          onDecline={() => onSendInteractionResponse(false)}
          onClose={() => onSetIsInteractionDialogOpen(false)}
        />
      </ErrorBoundary>
    </div>
  );
}
