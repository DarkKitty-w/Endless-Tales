// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import type { StoryLogEntry, DifficultyLevel as AssessedDifficultyLevel, AdventureSettings } from '../../types/adventure-types';
import type { InventoryItem } from '../../types/inventory-types';
import type { Skill, CharacterStats } from '../../types/character-types';
import { useGame } from "../../context/GameContext";
import { useMultiplayer } from "../../hooks/use-multiplayer";
import { GameplayLayout } from "../../components/gameplay/GameplayLayout";
import { TradeDialog } from "../../components/gameplay/TradeDialog";
import { useToast } from "../../hooks/use-toast";
import type { GameState, Character, SkillTree, Reputation, NpcRelationships, Location } from '../../types/game-types';
import { updateGameStateString, buildGameStateContext } from "../../context/game-state-utils";
import type { GameStateContext } from "../../types/game-types";
import { calculateXpToNextLevel, calculateMaxHealth, calculateMaxActionStamina, calculateMaxMana, getStarterSkillsForClass } from "../../lib/gameUtils";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "../../ai/flows/narrate-adventure";
import { summarizeAdventure } from "../../ai/flows/summarize-adventure";
import { assessActionDifficulty, type AssessActionDifficultyInput } from "../../ai/flows/assess-action-difficulty";
import { generateSkillTree } from "../../ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "../../ai/flows/attempt-crafting";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { Button } from '../../components/ui/button';
import { TooltipProvider } from "../../components/ui/tooltip";
import type { InteractionRequest } from "../../types/multiplayer-types";
import { logger, generateRequestId, setRequestId, setTraceId } from "@/lib/logger";
import { rollDie, getDiceRollFunction, DICE_TYPES, DiceType } from "../../lib/game-utils/dice";

const GENERIC_BRANCHING_CHOICES: NarrateAdventureOutput['branchingChoices'] = [
    { text: "Look around more closely.", consequenceHint: "May reveal new details." },
    { text: "Consider your next move carefully.", consequenceHint: "Take a moment to think." },
    { text: "Check your inventory.", consequenceHint: "Review your belongings." },
    { text: "Rest for a moment.", consequenceHint: "Conserve your strength." }
];

interface InteractionTypeButtonProps {
  type: 'trade' | 'gift' | 'duel';
  isSelected: boolean;
  onSelect: (type: 'trade' | 'gift' | 'duel') => void;
}

const InteractionTypeButton = memo(function InteractionTypeButton({ 
  type, 
  isSelected, 
  onSelect 
}: InteractionTypeButtonProps) {
  const handleClick = useCallback(() => {
    onSelect(type);
  }, [onSelect, type]);

  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      className="capitalize"
    >
      {type}
    </Button>
  );
});

const INITIAL_ACTION_STRING = "Begin the adventure by looking around.";

const USE_COMBINED_AI_CALL = true;

type LoadingPhase =
  | { type: 'idle' }
  | { type: 'initial-loading' }
  | { type: 'narrating' }
  | { type: 'assessing' }
  | { type: 'rolling-dice' }
  | { type: 'generating-skill-tree' }
  | { type: 'ending' }
  | { type: 'saving' }
  | { type: 'crafting' };

export function Gameplay() {
    const { state, dispatch } = useGame();
    const { toast } = useToast();
    const {
        character, currentNarration, currentGameStateString, storyLog,
        adventureSettings, inventory, currentAdventureId,
        isGeneratingSkillTree: contextIsGeneratingSkillTree,
        turnCount,
    } = state;

    // ✅ Compute the correct API key based on current provider
    const activeApiKey = useMemo(() => {
        const providerKey = state.providerApiKeys[state.aiProvider];
        if (providerKey) return providerKey;
        // Fallback for Gemini using legacy key
        if (state.aiProvider === 'gemini' && state.userGoogleAiApiKey) return state.userGoogleAiApiKey;
        return null;
    }, [state.aiProvider, state.providerApiKeys, state.userGoogleAiApiKey]);

    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false);
    const [isRollingDice, setIsRollingDice] = useState(false);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false);
    const [localIsGeneratingSkillTree, setLocalIsGeneratingSkillTree] = useState(false);
    const [lastPlayerAction, setLastPlayerAction] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [errorRawResponse, setErrorRawResponse] = useState<string | null>(null); // ERR-11: Store raw AI response for debugging
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [diceType, setDiceType] = useState<string>("None");
    const [pendingClassChange, setPendingClassChange] = useState<string | null>(null);
    const [branchingChoices, setBranchingChoices] = useState<NarrateAdventureOutput['branchingChoices']>(GENERIC_BRANCHING_CHOICES);
    const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
    const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);
    const [isPartySidebarOpen, setIsPartySidebarOpen] = useState(true);
    const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
     const [isInteractionDialogOpen, setIsInteractionDialogOpen] = useState(false);
     const [currentInteraction, setCurrentInteraction] = useState<InteractionRequest | null>(null);
     const [isInteractionTarget, setIsInteractionTarget] = useState(false);
     const [pendingGuestAction, setPendingGuestAction] = useState<string | null>(null);
     const [isOutgoingInteractionOpen, setIsOutgoingInteractionOpen] = useState(false);
     const [outgoingTargetPeerId, setOutgoingTargetPeerId] = useState<string | null>(null);
     const [outgoingInteractionType, setOutgoingInteractionType] = useState<'gift' | 'trade' | 'duel'>('trade');
     const [outgoingInteractionDetails, setOutgoingInteractionDetails] = useState('');
     // Trade dialog state
     const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
     const [tradeTargetPeerId, setTradeTargetPeerId] = useState<string | null>(null);
     
     const initialSetupAttemptedRef = useRef<Record<string, boolean>>({});
    const actionInputRef = useRef<ActionInputRef>(null);
    const isMobile = useIsMobile();
    
    // Refs for multiplayer state to avoid circular dependencies
    const multiplayerStateRef = useRef<any>(null);
    const gameStateRef = useRef(state);
    const isMultiplayerHostRef = useRef(false);
    const sendGameActionRef = useRef<((action: string, turnNumber: number, isInitial: boolean) => boolean) | null>(null);
    const broadcastStoryUpdateRef = useRef<((entry: any, newTurn: number, updatedGameState: string) => boolean) | null>(null);
    const broadcastPartyStateRef = useRef<((partyState: any, turnOrder: string[], currentTurnIndex: number) => boolean) | null>(null);
    const handlePlayerActionRef = useRef<((action: string, isInitialAction?: boolean) => void) | null>(null);
    
    // Keep gameStateRef updated
    useEffect(() => {
      gameStateRef.current = state;
    }, [state]);

    // Define handleGuestActionReceived using refs to avoid circular deps
    const handleGuestActionReceived = useCallback(async (playerId: string, action: string, turnNumber: number, isInitial: boolean) => {
      if (!isMultiplayerHostRef.current) return;
      logger.log(`Host processing action from ${playerId}: ${action}`);
      
      try {
        // Process the action using the host's handlePlayerAction
        if (handlePlayerActionRef.current) {
          await handlePlayerActionRef.current(action, isInitial);
        }
        
        // After processing, broadcast the updated story and party state
        setTimeout(() => {
          const currentState = gameStateRef.current;
          const mpState = multiplayerStateRef.current;
          
          // NET-1 Fix: Calculate next turn index and dispatch ADVANCE_TURN
          if (mpState && mpState.turnOrder && mpState.turnOrder.length > 0) {
            const nextTurnIndex = (mpState.currentTurnIndex + 1) % mpState.turnOrder.length;
            dispatch({ type: "ADVANCE_TURN", payload: nextTurnIndex });
            logger.log(`Turn advanced from ${mpState.currentTurnIndex} to ${nextTurnIndex}`);
          }
          
          // Broadcast story update if available
          if (currentState.storyLog.length > 0) {
            const latestEntry = currentState.storyLog[currentState.storyLog.length - 1];
            if (broadcastStoryUpdateRef.current) {
              broadcastStoryUpdateRef.current(latestEntry, currentState.turnCount, '');
            }
          }
          
          // Broadcast party state with updated turn info
          const partyState: Record<string, any> = {};
          // Add host
          if (currentState.character) {
            partyState[currentState.peerId || 'host'] = {
              peerId: currentState.peerId || 'host',
              name: currentState.character.name,
              class: currentState.character.class,
              level: currentState.character.level,
              currentHealth: currentState.character.currentHealth,
              maxHealth: currentState.character.maxHealth,
              currentStamina: currentState.character.currentStamina,
              maxStamina: currentState.character.maxStamina,
              currentMana: currentState.character.currentMana,
              maxMana: currentState.character.maxMana,
              inventorySummary: currentState.inventory?.map(i => i.name) || [],
            };
          }
          // Add peers from multiplayerState ref
          if (mpState?.partyState) {
            Object.entries(mpState.partyState).forEach(([peerId, summary]) => {
              partyState[peerId] = summary;
            });
          }
          
          // Get updated turn state after dispatch
          const updatedMpState = multiplayerStateRef.current;
          if (broadcastPartyStateRef.current && updatedMpState) {
            broadcastPartyStateRef.current(partyState, updatedMpState.turnOrder || [], updatedMpState.currentTurnIndex || 0);
          }
        }, 100);
        
      } catch (error) {
        logger.error('Error processing guest action:', error);
        toast({ title: "Error", description: "Failed to process guest action.", variant: "destructive" });
      }
    }, [toast, dispatch]);

    // Multiplayer hook
    const { multiplayerState, sendGameAction, broadcastStoryUpdate, broadcastPartyState, sendChatMessage, sendControlMessage, sendInteractionRequest, sendInteractionResponse, disconnect, reconnect, setGameActionReceivedHandler, isConnected, isMyTurn, isHost: isMultiplayerHost, isReconnecting } = useMultiplayer({
      playerName: state.character?.name || 'Player',
      onGameActionReceived: handleGuestActionReceived,
      onStoryUpdate: (entry, newTurn) => {
        // Guest receives story update from host
        logger.log('Guest received story update', entry);
        dispatch({ type: "UPDATE_NARRATION", payload: entry });
      },
      onPartyStateUpdate: (partyState) => {
        logger.log('Party state update', partyState);
        dispatch({ type: "UPDATE_PARTY_STATE", payload: partyState });
      },
      onChatMessage: (msg) => {
        logger.log('Chat message', msg);
        dispatch({ type: "ADD_CHAT_MESSAGE", payload: msg });
      },
      onControlMessage: (msg) => {
        logger.log('Control message', msg);
      },
      onInteractionRequest: (interaction) => {
        logger.log('Interaction request received', interaction);
        setCurrentInteraction(interaction);
        setIsInteractionDialogOpen(true);
        if (interaction.targetPeerId === multiplayerState.peerId) {
          setIsInteractionTarget(true);
        } else {
          setIsInteractionTarget(false);
        }
      },
      onInteractionResponse: (interactionId, accepted) => {
        logger.log('Interaction response', interactionId, accepted);
        if (currentInteraction && currentInteraction.id === interactionId) {
          dispatch({ type: "RESOLVE_PENDING_INTERACTION", payload: { accepted } });
          setIsInteractionDialogOpen(false);
          if (accepted) {
            toast({ title: "Interaction Accepted", description: "The interaction was accepted." });
          } else {
            toast({ title: "Interaction Declined", description: "The interaction was declined." });
          }
        }
      },
      onPeerConnected: (peer) => {
        logger.log('Peer connected', peer);
        dispatch({ type: "PEER_CONNECTED", payload: { peerId: peer.peerId, name: peer.name, isHost: false } });
      },
      onPeerDisconnected: (peerId) => {
        logger.log('Peer disconnected', peerId);
        dispatch({ type: "PEER_DISCONNECTED", payload: peerId });
        toast({ title: "Player Disconnected", description: `A player has disconnected.`, variant: "destructive" });
      },
      // ERR-13: Handle multiplayer errors with user-friendly messages
      onError: (title, description, recoverable) => {
        toast({ 
          title, 
          description: recoverable ? `${description} You can try reconnecting.` : description,
          variant: "destructive",
          duration: recoverable ? 6000 : 4000,
        });
      },
    });

    // Update refs when values change
    useEffect(() => {
      multiplayerStateRef.current = multiplayerState;
      sendGameActionRef.current = sendGameAction;
      broadcastStoryUpdateRef.current = broadcastStoryUpdate;
      broadcastPartyStateRef.current = broadcastPartyState;
      isMultiplayerHostRef.current = isMultiplayerHost;
    }, [multiplayerState, sendGameAction, broadcastStoryUpdate, broadcastPartyState, isMultiplayerHost]);

    // Multiplayer handlers
    const handleKickPeer = useCallback((peerId: string) => {
        sendControlMessage('kick', peerId);
    }, [sendControlMessage]);

    const handleTogglePause = useCallback(() => {
        if (multiplayerState.isPaused) {
            sendControlMessage('resume');
        } else {
            sendControlMessage('pause');
        }
    }, [multiplayerState.isPaused, sendControlMessage]);

    const handleSetTurnOrder = useCallback((newOrder: string[]) => {
        if (!isMultiplayerHost) return;
        sendControlMessage('set-turn-order', undefined, { turnOrder: newOrder });
    }, [isMultiplayerHost, sendControlMessage]);

    const handleOpenChat = useCallback(() => {
        setIsChatPanelOpen(true);
    }, []);

    const handleCloseChat = useCallback(() => {
        setIsChatPanelOpen(false);
    }, []);

    const handleSendChatMessage = useCallback((text: string) => {
        try {
            sendChatMessage(text);
        } catch (error) {
            logger.error("Failed to send chat message:", error);
            toast({ 
                title: "Chat Error", 
                description: "Failed to send message. Please try again.", 
                variant: "destructive" 
            });
        }
    }, [sendChatMessage, toast]);

    // Interaction handlers
    const handleInteractionAccept = useCallback(() => {
        if (!currentInteraction) return;
        if (isInteractionTarget) {
            sendInteractionResponse(currentInteraction.id, true);
        }
        dispatch({ type: "RESOLVE_PENDING_INTERACTION", payload: { accepted: true } });
        setIsInteractionDialogOpen(false);
        toast({ title: "Interaction Accepted", description: "You accepted the interaction." });
    }, [currentInteraction, isInteractionTarget, sendInteractionResponse, dispatch, toast]);

    const handleInteractionDecline = useCallback(() => {
        if (!currentInteraction) return;
        if (isInteractionTarget) {
            sendInteractionResponse(currentInteraction.id, false);
        }
        dispatch({ type: "RESOLVE_PENDING_INTERACTION", payload: { accepted: false } });
        setIsInteractionDialogOpen(false);
        toast({ title: "Interaction Declined", description: "You declined the interaction." });
    }, [currentInteraction, isInteractionTarget, sendInteractionResponse, dispatch, toast]);

    // Send trade request to another player - opens TradeDialog
    const handleSendTradeRequest = useCallback((targetPeerId: string) => {
        setTradeTargetPeerId(targetPeerId);
        setIsTradeDialogOpen(true);
    }, []);

    // Handle trade completion from TradeDialog
    const handleTradeComplete = useCallback((fromPeerId: string, toPeerId: string, items: string[]) => {
        dispatch({ 
            type: "PROCESS_TRADE", 
            payload: { fromPeerId, toPeerId, items } 
        });
        setIsTradeDialogOpen(false);
        setTradeTargetPeerId(null);
        toast({ 
            title: "Trade Complete", 
            description: `Successfully traded ${items.length} item(s).` 
        });
    }, [dispatch, toast]);

    const handleOutgoingInteractionSubmit = useCallback(() => {
        if (!outgoingTargetPeerId || !outgoingInteractionDetails.trim()) {
            toast({ title: "Missing Details", description: "Please provide details for the interaction.", variant: "destructive" });
            return;
        }
        sendInteractionRequest(outgoingTargetPeerId, outgoingInteractionType, outgoingInteractionDetails);
        toast({ title: "Interaction Sent", description: `${outgoingInteractionType.charAt(0).toUpperCase() + outgoingInteractionType.slice(1)} request sent.` });
        setIsOutgoingInteractionOpen(false);
        setOutgoingInteractionDetails('');
    }, [outgoingTargetPeerId, outgoingInteractionType, outgoingInteractionDetails, sendInteractionRequest, toast]);

    const handleOutgoingInteractionCancel = useCallback(() => {
        setIsOutgoingInteractionOpen(false);
        setOutgoingTargetPeerId(null);
        setOutgoingInteractionDetails('');
    }, []);

    // --- AbortController for AI requests ---
    const abortControllerRef = useRef<AbortController | null>(null);
    const skillTreeAbortRef = useRef<AbortController | null>(null);

    const createAbortSignal = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        return abortControllerRef.current.signal;
    }, []);

    // Dedicated AbortController for skill tree generation
    const createSkillTreeAbortSignal = useCallback(() => {
        if (skillTreeAbortRef.current) {
            skillTreeAbortRef.current.abort();
        }
        skillTreeAbortRef.current = new AbortController();
        return skillTreeAbortRef.current.signal;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // --- Undo grace period for branching choices ---
    const pendingActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [pendingBranchingAction, setPendingBranchingAction] = useState<{ action: string; isInitial: boolean } | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (pendingActionTimeoutRef.current) {
                clearTimeout(pendingActionTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (contextIsGeneratingSkillTree !== localIsGeneratingSkillTree) {
            setLocalIsGeneratingSkillTree(contextIsGeneratingSkillTree);
        }
    }, [contextIsGeneratingSkillTree, localIsGeneratingSkillTree]);

    useEffect(() => {
        logger.log("Gameplay: currentAdventureId changed or component mounted. Resetting relevant states. New ID:", currentAdventureId);
        setIsInitialLoading(true);
        setError(null);
        setLastPlayerAction(null);
        setBranchingChoices(GENERIC_BRANCHING_CHOICES);
        if (currentAdventureId) {
            initialSetupAttemptedRef.current = { [currentAdventureId]: false };
        } else {
            initialSetupAttemptedRef.current = {};
        }
    }, [currentAdventureId]);

    const gameStateContext = useMemo<GameStateContext | null>(() => {
        if (!state.character) return null;
        return buildGameStateContext(state);
    }, [state]);

    const isGeneratingSkillTree = localIsGeneratingSkillTree || contextIsGeneratingSkillTree;
    const loadingPhase = useMemo<LoadingPhase>(() => {
        if (isInitialLoading) return { type: 'initial-loading' };
        if (isLoading) return { type: 'narrating' };
        if (isAssessingDifficulty) return { type: 'assessing' };
        if (isRollingDice) return { type: 'rolling-dice' };
        if (isGeneratingSkillTree) return { type: 'generating-skill-tree' };
        if (isEnding) return { type: 'ending' };
        if (isSaving) return { type: 'saving' };
        if (isCraftingLoading) return { type: 'crafting' };
        return { type: 'idle' };
    }, [isInitialLoading, isLoading, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, isEnding, isSaving, isCraftingLoading]);

    const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry, characterIsDefeated = false) => {
        if (loadingPhase.type !== 'idle' && loadingPhase.type !== 'initial-loading') return;
        logger.log("Gameplay: Initiating end adventure. Defeated:", characterIsDefeated);
        setIsEnding(true);
        setError(null);
        toast({ title: characterIsDefeated ? "Character Defeated" : "Ending Adventure", description: "Summarizing your tale..." });

        const finalLogToSummarize = [...storyLog];
        if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
            finalLogToSummarize.push(finalNarrationEntry);
        }
        let summary = characterIsDefeated ? "Your character has been defeated." : "Your adventure has concluded.";
        const hasLog = finalLogToSummarize.length > 0;

        if (hasLog && character) { 
            const fullStory = finalLogToSummarize.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
            if (fullStory.trim().length > 0) {
                try {
                    const signal = createAbortSignal();
                    const summaryResult = await summarizeAdventure({ story: fullStory, userApiKey: activeApiKey, signal });
                    summary = summaryResult.summary;
                    
                    // ERR-8 Fix: Show toast when fallback is used
                    if (summaryResult.usedFallback) {
                        toast({ title: "Using Default Summary", description: "AI summary failed. Using basic summary.", variant: "destructive" });
                    } else {
                        toast({ title: "Summary Generated", description: "View your adventure outcome." });
                    }
                } catch (summaryError: any) {
                    if (summaryError.name === 'AbortError') {
                        logger.log("Summarize adventure aborted");
                        return;
                    }
                    logger.error("Gameplay: Summarize adventure error:", summaryError);
                    summary = `Could not generate a summary due to an error: ${summaryError.message || 'Unknown error'}. ${summary}`;
                    toast({ title: "Summary Error", description: "Failed to generate summary.", variant: "destructive" });
                }
            }
        }
        dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration: finalNarrationEntry } });
        setIsEnding(false);
    }, [loadingPhase, storyLog, character, dispatch, toast, createAbortSignal, activeApiKey]);

    const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
        // OBS-6 Fix: Generate requestId and traceId for correlation when user takes action
        const requestId = generateRequestId();
        setRequestId(requestId);
        
        // For traceId, start a new trace for new user actions (not continuing from previous)
        const traceId = generateRequestId(); // In production, use proper trace ID generation
        setTraceId(traceId);
        
        logger.log(`Gameplay: handlePlayerAction called. Action: "${action.substring(0,50)}...", isInitialAction: ${isInitialAction}`, 'Gameplay', { requestId, traceId });
        if (!character) {
            toast({ title: "Error", description: "Character data is missing.", variant: "destructive" });
            if (isInitialAction) setIsInitialLoading(false);
            logger.error("Gameplay: Character is null in handlePlayerAction.");
            return;
        }

        // Multiplayer turn check: if connected and not my turn, ignore action
        if (isConnected && !isMyTurn && !isInitialAction) {
            toast({ title: "Not Your Turn", description: "Wait for your turn in multiplayer mode.", variant: "destructive" });
            return;
        }

        // If guest in multiplayer, send action to host instead of processing locally
        if (isConnected && !isMultiplayerHost && !isInitialAction) {
            const sent = sendGameAction(action, turnCount, false);
            if (sent) {
                toast({ title: "Action Sent", description: "Waiting for host to process your action..." });
                setIsLoading(true);
                setPendingGuestAction(action); // Store pending action for optimistic UI
            } else {
                toast({ title: "Send Failed", description: "Could not send action to host.", variant: "destructive" });
            }
            return;
        }
        
        // Store ref for multiplayer handler
        handlePlayerActionRef.current = handlePlayerAction;
        
        setLastPlayerAction(action);
        if (isInitialAction) {
            setIsInitialLoading(true);
        } else {
            setIsLoading(true);
        }
        setError(null); setDiceResult(null); setDiceType("None"); 
        
        const signal = createAbortSignal();

        let actionWithDice = action;
        let assessedDifficulty: AssessedDifficultyLevel = "Normal";
        let difficultyResult: any = null;

        try {
            if (character.class === 'admin000') {
                return;
            }

            const actionLower = action.trim().toLowerCase();
            const isPassiveAction = [INITIAL_ACTION_STRING.toLowerCase(), "look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower);

            if (USE_COMBINED_AI_CALL) {
                const needsAssessment = !isInitialAction && !isPassiveAction;
                
                if (needsAssessment) {
                    setIsAssessingDifficulty(true);
                    toast({ title: "Assessing Challenge...", duration: 1000 });
                    
                    // F-004: Call standalone assessActionDifficulty function
                    try {
                        const repString = character.reputation ? Object.entries(character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'None';
                        const relString = character.npcRelationships ? Object.entries(character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'None';
                        const capabilitiesSummary = `Lvl: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}. Health: ${character.currentHealth}/${character.maxHealth}. Action STA: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Learned Skills: ${character.learnedSkills.map(s => s.name).join(', ') || 'None'}. Rep: ${repString}. Rel: ${relString}`;
                        
                        const difficultyInput: AssessActionDifficultyInput = {
                            playerAction: action,
                            characterCapabilities: capabilitiesSummary,
                            characterClass: character.class,
                            currentSituation: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration.substring(0, 500) : "Starting adventure",
                            gameStateSummary: currentGameStateString.substring(0, 500),
                            gameStateContext: gameStateContext ?? undefined,
                            gameDifficulty: adventureSettings.difficulty || "Normal",
                            turnCount: turnCount,
                            userApiKey: activeApiKey,
                            signal,
                            requestId,
                            traceId,
                        };
                        
                        difficultyResult = await assessActionDifficulty(difficultyInput);
                        assessedDifficulty = difficultyResult.difficulty;
                        setDiceType(difficultyResult.suggestedDice);
                        
                        toast({ 
                            title: `Difficulty: ${difficultyResult.difficulty}`, 
                            description: difficultyResult.reasoning,
                            duration: 3000 
                        });
                    } catch (diffError) {
                        logger.warn("Failed to assess action difficulty, using fallback", 'Gameplay', { error: diffError });
                        assessedDifficulty = "Normal";
                        setDiceType("d10");
                    }
                } else {
                    assessedDifficulty = "Trivial";
                    setDiceType("None");
                }
                
                // Roll the dice based on suggestedDice type
                if (needsAssessment && difficultyResult?.suggestedDice && difficultyResult.suggestedDice !== "None") {
                    const diceType = difficultyResult.suggestedDice;
                    let rollResult: number | undefined = undefined;
                    switch (diceType) {
                        case 'd6': rollResult = Math.floor(Math.random() * 6) + 1; break;
                        case 'd10': rollResult = Math.floor(Math.random() * 10) + 1; break;
                        case 'd20': rollResult = Math.floor(Math.random() * 20) + 1; break;
                        case 'd100': rollResult = Math.floor(Math.random() * 100) + 1; break;
                    }
                    if (rollResult !== undefined) {
                        setDiceResult(rollResult);
                        setIsRollingDice(true);
                        await new Promise(resolve => setTimeout(resolve, 1400));
                        setIsRollingDice(false);
                        setDiceResult(null);
                        actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: ${rollResult}/${diceType})`;
                    }
                } else if (needsAssessment && difficultyResult === null) {
                    // If assessActionDifficulty failed, use default dice
                    const rollResult = Math.floor(Math.random() * 10) + 1;
                    setDiceResult(rollResult);
                    setIsRollingDice(true);
                    await new Promise(resolve => setTimeout(resolve, 1400));
                    setIsRollingDice(false);
                    setDiceResult(null);
                    actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: ${rollResult}/d10)`;
                }

                let skillTreeSummaryForAI = null;
                if (character.skillTree && character.skillTreeStage >= 0) {
                    const currentStageData = character.skillTree.stages.find(s => s.stage === character.skillTreeStage);
                    skillTreeSummaryForAI = {
                        className: character.skillTree.className, stageCount: character.skillTree.stages.length,
                        availableSkillsAtCurrentStage: currentStageData ? currentStageData.skills.map(s => s.name) : [],
                    };
                }

                const reputationString = character.reputation ? JSON.stringify(character.reputation) : "{}";
                const npcRelationshipsString = character.npcRelationships ? JSON.stringify(character.npcRelationships) : "{}";

                const inputForAI: NarrateAdventureInput = {
                    character: {
                        name: character.name, class: character.class, description: character.description,
                        traits: character.traits, knowledge: character.knowledge, background: character.background,
                        stats: character.stats, currentHealth: character.currentHealth, maxHealth: character.maxHealth,
                        currentStamina: character.currentStamina, maxStamina: character.maxStamina,
                        currentMana: character.currentMana, maxMana: character.maxMana,
                        level: character.level, xp: character.xp, xpToNextLevel: character.xpToNextLevel,
                        reputationString, npcRelationshipsString, skillTreeSummary: skillTreeSummaryForAI,
                        skillTreeStage: character.skillTreeStage, learnedSkills: character.learnedSkills.map(s => s.name),
                        aiGeneratedDescription: character.aiGeneratedDescription,
                    },
                    playerChoice: action,
                    gameState: currentGameStateString,
                    gameStateContext: gameStateContext ?? undefined,
                    previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
                    adventureSettings: adventureSettings,
                    turnCount: turnCount,
                    userApiKey: activeApiKey,
                    assessDifficulty: false, // F-004: Difficulty now assessed separately via assessActionDifficulty
                    capabilitiesSummary: needsAssessment ? capabilitiesSummary : undefined,
                    signal,
                    // OBS-6: Pass requestId and traceId for correlation
                    requestId,
                    traceId,
                };

                let narrationResult: NarrateAdventureOutput;
                
                if (!needsAssessment) {
                    narrationResult = await narrateAdventure(inputForAI);
                } else {
                    narrationResult = await narrateAdventure(inputForAI);
                }

                setIsAssessingDifficulty(false);

                // F-004: Dice roll is now handled separately after assessActionDifficulty call
                // This section only handles the "Impossible" case
                if (assessedDifficulty === "Impossible") {
                    const impossibleActionLog: StoryLogEntry = {
                        narration: narrationResult.narration,
                        updatedGameState: narrationResult.updatedGameState,
                        timestamp: Date.now(),
                        branchingChoices: narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES,
                    };
                    dispatch({ type: "UPDATE_NARRATION", payload: impossibleActionLog });
                    setBranchingChoices(narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES);
                    toast({ title: "Action Impossible", description: narrationResult.narration, variant: "destructive", duration: 4000 });
                    return;
                }

                if (narrationResult && narrationResult.narration && narrationResult.updatedGameState) {
                    // ERR-14: Notify player when AI falls back to defaults
                    if (narrationResult.usedFallback) {
                        toast({ 
                            title: "AI Fallback Used", 
                            description: "AI generation failed. Using default narration. Use the retry button to try again.", 
                            variant: "default",
                            duration: 5000
                        });
                    }
                    
                    const gainedSkillTyped = narrationResult.gainedSkill ? {
                        ...narrationResult.gainedSkill,
                        type: (narrationResult.gainedSkill.type === 'Starter' || narrationResult.gainedSkill.type === 'Learned') 
                            ? (narrationResult.gainedSkill.type as 'Starter' | 'Learned') 
                            : 'Learned' as const
                    } : undefined;

                    // Process world map changes from AI
                    if (narrationResult.worldMapChanges) {
                        const { newLocations, discoveredLocationIds, updatedLocations } = narrationResult.worldMapChanges;
                        
                        if (newLocations) {
                            for (const loc of newLocations) {
                                const x = Math.min(100, Math.max(0, loc.x));
                                const y = Math.min(100, Math.max(0, loc.y));
                                const connectedIds = loc.connectedTo && loc.connectedTo.length > 0
                                    ? loc.connectedTo
                                    : (state.worldMap.currentLocationId ? [state.worldMap.currentLocationId] : []);
                                dispatch({
                                    type: "ADD_LOCATION",
                                    payload: {
                                        id: loc.id,
                                        name: loc.name,
                                        description: loc.description,
                                        type: loc.type,
                                        discovered: true,
                                        x,
                                        y,
                                        connectedLocationIds: connectedIds,
                                    }
                                });
                            }
                        }
                        
                        if (discoveredLocationIds) {
                            for (const id of discoveredLocationIds) {
                                dispatch({ type: "DISCOVER_LOCATION", payload: id });
                            }
                        }
                        
                        if (updatedLocations) {
                            for (const { id, updates } of updatedLocations) {
                                const validUpdates: Partial<Location> = {};
                                
                                if (typeof updates.name === 'string') validUpdates.name = updates.name;
                                if (typeof updates.description === 'string') validUpdates.description = updates.description;
                                if (typeof updates.x === 'number') validUpdates.x = updates.x;
                                if (typeof updates.y === 'number') validUpdates.y = updates.y;
                                if (updates.discovered === true || updates.discovered === false) validUpdates.discovered = updates.discovered;
                                if (Array.isArray(updates.connectedLocationIds)) validUpdates.connectedLocationIds = updates.connectedLocationIds;
                                
                                if (typeof updates.type === 'string') {
                                    const typeStr = updates.type;
                                    if (typeStr === 'town' || typeStr === 'dungeon' || typeStr === 'wilderness' || typeStr === 'landmark' || typeStr === 'unknown') {
                                        validUpdates.type = typeStr;
                                    } else {
                                        validUpdates.type = 'unknown';
                                    }
                                }
                                
                                dispatch({ type: "UPDATE_LOCATION", payload: { id, updates: validUpdates } });
                            }
                        }
                    }

                    // Build StoryLogEntry from narrationResult
                    const logEntryPayload: StoryLogEntry = {
                        narration: narrationResult.narration,
                        updatedGameState: narrationResult.updatedGameState,
                        timestamp: Date.now(),
                        gainedSkill: gainedSkillTyped,
                        updatedStats: narrationResult.updatedStats ?? undefined,
                        updatedTraits: narrationResult.updatedTraits ?? undefined,
                        updatedKnowledge: narrationResult.updatedKnowledge ?? undefined,
                        progressedToStage: narrationResult.progressedToStage ?? undefined,
                        xpGained: narrationResult.xpGained ?? undefined,
                        reputationChange: narrationResult.reputationChange ?? undefined,
                        npcRelationshipChange: narrationResult.npcRelationshipChange ?? undefined,
                        branchingChoices: narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES,
                        dynamicEventTriggered: narrationResult.dynamicEventTriggered ?? undefined,
                        isCharacterDefeated: narrationResult.isCharacterDefeated ?? undefined,
                        turnNumber: turnCount + 1,
                        healthChange: narrationResult.healthChange ?? undefined,
                        staminaChange: narrationResult.staminaChange ?? undefined,
                        manaChange: narrationResult.manaChange ?? undefined,
                        suggestedClassChange: narrationResult.suggestedClassChange == null ? undefined : narrationResult.suggestedClassChange,
                    };

                    dispatch({ type: "UPDATE_NARRATION", payload: logEntryPayload });
                    setBranchingChoices(narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES);
                    
                    if (narrationResult.dynamicEventTriggered) toast({ title: "Dynamic Event!", description: narrationResult.dynamicEventTriggered, duration: 4000, className: "border-purple-500" });
                    if (narrationResult.xpGained && narrationResult.xpGained > 0) toast({ title: `Gained ${narrationResult.xpGained} XP!`, duration: 3000, className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500" });
                    if (narrationResult.reputationChange) { const { faction, change } = narrationResult.reputationChange; const dir = change > 0 ? 'increased' : 'worsened'; toast({ title: `Reputation with ${faction} ${dir} by ${Math.abs(change)}!`, duration: 3000 }); }
                    if (narrationResult.npcRelationshipChange) { const { npcName, change } = narrationResult.npcRelationshipChange; const dir = change > 0 ? 'improved' : 'worsened'; toast({ title: `Relationship with ${npcName} ${dir} by ${Math.abs(change)}!`, duration: 3000 }); }
                    if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
                         const stageName = character.skillTree?.stages.find(s => s.stage === narrationResult!.progressedToStage)?.stageName || `Stage ${narrationResult.progressedToStage}`;
                         toast({ title: "Skill Stage Increased!", description: `You've reached ${stageName} (Stage ${narrationResult.progressedToStage})!`, duration: 4000, className: "bg-purple-100 dark:bg-purple-900 border-purple-500" });
                    }
                     if (narrationResult.gainedSkill) toast({ title: "Skill Learned!", description: `You gained: ${narrationResult.gainedSkill.name}!`, duration: 4000 });
                     if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class && adventureSettings.adventureType !== "Immersed") setPendingClassChange(narrationResult.suggestedClassChange);

                    const updatedChar = state.character;
                    if (narrationResult.isCharacterDefeated && updatedChar && updatedChar.currentHealth <=0) { 
                        if (adventureSettings.permanentDeath) {
                            await handleEndAdventure(logEntryPayload, true);
                        } else {
                            dispatch({ type: "RESPAWN_CHARACTER", payload: { narrationMessage: `${character.name} was defeated but managed to escape death's grasp this time!` } });
                            toast({ title: "Defeated!", description: "You narrowly escaped death! Your health and resources are restored.", variant: "destructive", duration: 5000 });
                        }
                    }
                } else {
                    // ERR-11: Capture raw AI response for debugging when available
                    const rawResp = (narrationResult as any)?.rawResponse || null;
                    setError("Narration failed: AI did not return a valid response. Try a different action or retry.");
                    setErrorRawResponse(rawResp);
                    setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                    toast({title: "Narration Error", description: "AI failed to respond. Please try again.", variant: "destructive"});
                }
            } else {
                // Original separate calls path omitted for brevity
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                logger.log("Player action aborted, newer request superseded it.");
                // Don't show error toast for expected cancellations
            } else {
                logger.error("Gameplay: Error in handlePlayerAction:", err);
                
                // ERR-13: Differentiate network errors from other errors
                const isNetworkError = err instanceof TypeError && err.message.includes('fetch') ||
                                       err.message?.includes('network') ||
                                       err.message?.includes('ECONNREFUSED') ||
                                       err.message?.includes('ETIMEDOUT') ||
                                       err.code === 'NETWORK_ERROR';
                
                let errorTitle = "Unexpected Error";
                let errorDescription = "Something went wrong processing your action.";
                
                // ERR-11: Capture raw AI response from error if available
                let rawResp = null;
                if (err.message?.includes('Raw response:')) {
                    rawResp = err.message.split('Raw response: ')[1] || null;
                }
                setErrorRawResponse(rawResp);
                
                if (isNetworkError) {
                    errorTitle = "Network Error";
                    errorDescription = "Please check your internet connection and try again.";
                    setError("Network error: Please check your connection and retry.");
                } else {
                    setError(`An unexpected error occurred while processing your action: ${err.message}`);
                }
                
                setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                toast({
                    title: errorTitle, 
                    description: errorDescription,
                    variant: "destructive"
                });
            }
        } finally {
            if (isInitialAction) {
                setIsInitialLoading(false);
            }
            setIsLoading(false);
            if (isAssessingDifficulty) setIsAssessingDifficulty(false);
            if (isRollingDice) setIsRollingDice(false);
        }
    }, [character, inventory, currentGameStateString, storyLog, adventureSettings, turnCount, dispatch, toast, handleEndAdventure, state.character, gameStateContext, state.worldMap.currentLocationId, createAbortSignal, activeApiKey]);

    // Store handlePlayerAction in ref after it's defined
    useEffect(() => {
        handlePlayerActionRef.current = handlePlayerAction;
    }, [handlePlayerAction]);

    // Broadcast party state when story log changes (host only)
    useEffect(() => {
        if (!isMultiplayerHostRef.current || !isConnected || !broadcastPartyStateRef.current) return;
        
        const currentState = gameStateRef.current;
        
        // Only broadcast if we have a character
        if (!currentState.character) return;
        
        const partyState: Record<string, any> = {};
        
        // Add host
        partyState[currentState.peerId || 'host'] = {
          peerId: currentState.peerId || 'host',
          name: currentState.character.name,
          class: currentState.character.class,
          level: currentState.character.level,
          currentHealth: currentState.character.currentHealth,
          maxHealth: currentState.character.maxHealth,
          currentStamina: currentState.character.currentStamina,
          maxStamina: currentState.character.maxStamina,
          currentMana: currentState.character.currentMana,
          maxMana: currentState.character.maxMana,
          inventorySummary: currentState.inventory?.map(i => i.name) || [],
        };
        
        // Add peers from multiplayerState ref
        const mpState = multiplayerStateRef.current;
        if (mpState?.partyState) {
            Object.entries(mpState.partyState).forEach(([peerId, summary]) => {
                partyState[peerId] = summary;
            });
        }
        
        // Get current turn order from multiplayerState
        const turnOrder = mpState?.turnOrder || [];
        const currentTurnIndex = mpState?.currentTurnIndex || 0;
        
        broadcastPartyStateRef.current(partyState, turnOrder, currentTurnIndex);
    }, [state.storyLog.length, isConnected]);

    // Clear pending guest action when story log updates (guest receives host response)
    useEffect(() => {
        if (pendingGuestAction && state.storyLog.length > 0) {
            const latestEntry = state.storyLog[state.storyLog.length - 1];
            // Check if this is a response to our pending action
            // (In a real implementation, you'd want to match turn numbers or action text)
            setPendingGuestAction(null);
            setIsLoading(false);
        }
    }, [state.storyLog.length, pendingGuestAction]);

    // Handler for branching choices with undo grace period
    const handleBranchingChoiceClick = useCallback((action: string, isInitialAction = false) => {
        if (pendingActionTimeoutRef.current) {
            clearTimeout(pendingActionTimeoutRef.current);
        }

        toast({
            title: `You chose: "${action}"`,
            description: "Undo within 3 seconds if this was a misclick.",
            duration: 3000,
            action: (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        if (pendingActionTimeoutRef.current) {
                            clearTimeout(pendingActionTimeoutRef.current);
                            pendingActionTimeoutRef.current = null;
                        }
                        setPendingBranchingAction(null);
                        toast({ title: "Action undone", description: "You can choose a different path." });
                    }}
                >
                    Undo
                </Button>
            ),
        });

        pendingActionTimeoutRef.current = setTimeout(() => {
            setPendingBranchingAction(null);
            pendingActionTimeoutRef.current = null;
            handlePlayerAction(action, isInitialAction);
        }, 3000);

        setPendingBranchingAction({ action, isInitial: isInitialAction });
    }, [toast, handlePlayerAction]);

    const handleRetryNarration = useCallback(() => {
        let actionToRetry = lastPlayerAction;
        let isRetryInitial = false;

        if (!actionToRetry && storyLog.length === 0) {
            actionToRetry = INITIAL_ACTION_STRING;
            isRetryInitial = true;
        } else if (actionToRetry === INITIAL_ACTION_STRING) {
            isRetryInitial = true;
        }
        
        if (actionToRetry) {
            toast({ title: "Retrying AI Narration...", description: `Re-sending action: "${actionToRetry.substring(0,30)}..."` });
            handlePlayerAction(actionToRetry, isRetryInitial);
        } else {
            toast({ title: "Cannot Retry", description: "No previous action to retry, and initial narration was already attempted.", variant: "destructive" });
        }
    }, [lastPlayerAction, handlePlayerAction, toast, storyLog.length]);

    const triggerSkillTreeGeneration = useCallback(async (charClass: string | undefined): Promise<SkillTree | null> => {
        if (!charClass || adventureSettings.adventureType === "Immersed") {
            if (contextIsGeneratingSkillTree) dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
            return character?.skillTree || null;
        }
        if (character && character.skillTree && character.skillTree.className === charClass) {
            if (contextIsGeneratingSkillTree) dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
            return character.skillTree;
        }
        
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
        setLocalIsGeneratingSkillTree(true);
        setError(null);
        toast({ title: "Generating Skill Tree...", description: `Crafting abilities for the ${charClass} class...`, duration: 3000 });
        
        try {
            const signal = createAbortSignal();
            const skillTreeResult = await generateSkillTree({ characterClass: charClass, userApiKey: activeApiKey, signal });
            if (skillTreeResult && skillTreeResult.stages.length === 5) { 
                dispatch({ type: "SET_SKILL_TREE", payload: { class: charClass, skillTree: skillTreeResult } });
                toast({ title: "Skill Tree Generated!", description: `The path of the ${charClass} is set.` });
                return skillTreeResult;
            } else {
                toast({ title: "Skill Tree Error", description: "Using default progression (AI fallback used).", variant: "default" });
                return skillTreeResult;
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                logger.log("Skill tree generation aborted");
                return null;
            }
            setError(`Skill Tree Error: ${err.message}. Using default progression.`);
            toast({ title: "Skill Tree Error", description: "Could not generate skill tree. Default progression used.", variant: "destructive" });
            return null; 
        } finally {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
        }
    }, [dispatch, toast, adventureSettings.adventureType, character, contextIsGeneratingSkillTree, createAbortSignal, activeApiKey]);

    useEffect(() => {
        const performInitialSetup = async () => {
            if (!character || !currentAdventureId || initialSetupAttemptedRef.current[currentAdventureId]) {
                if (isInitialLoading) setIsInitialLoading(false);
                return;
            }
            initialSetupAttemptedRef.current[currentAdventureId] = true;
            logger.log(`Gameplay Initial Setup: Starting for adventure ${currentAdventureId}.`);

            let skillTreeReady = adventureSettings.adventureType === "Immersed" || !!character.skillTree;
            if (!skillTreeReady) {
                logger.log("Gameplay Initial Setup: Skill tree needed for class:", character.class);
                await triggerSkillTreeGeneration(character.class);
                const updatedCharacter = state.character;
                skillTreeReady = adventureSettings.adventureType === "Immersed" || !!updatedCharacter?.skillTree;
                logger.log("Gameplay Initial Setup: Skill tree generation attempt finished. Ready:", skillTreeReady);
            }

            if (skillTreeReady && storyLog.length === 0) {
                logger.log("Gameplay Initial Setup: Conditions met for initial narration. Calling handlePlayerAction.");
                await handlePlayerAction(INITIAL_ACTION_STRING, true);
            } else {
                logger.log("Gameplay Initial Setup: Story log has entries or skill tree failed. Skipping initial narration.");
                setIsInitialLoading(false);
            }
        };

        performInitialSetup().catch(err => {
            logger.error("Gameplay: Fatal error during initial setup:", err);
            setError("A critical error occurred while starting the adventure. Please try again.");
            setIsInitialLoading(false);
        });
    }, [character, currentAdventureId, adventureSettings.adventureType, triggerSkillTreeGeneration, handlePlayerAction, storyLog.length, state.character, isInitialLoading]);

    const handleSaveGame = useCallback(async () => {
        if (loadingPhase.type !== 'idle' || !currentAdventureId || !character) return;
        setIsSaving(true);
        toast({ title: "Saving Progress..." });
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            dispatch({ type: "SAVE_CURRENT_ADVENTURE" });
            toast({ title: "Game Saved!", description: `Progress for "${character.name}" saved.`, variant: "default" });
        } catch (err) {
            toast({ title: "Save Failed", description: "Could not save progress.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [loadingPhase, currentAdventureId, character, dispatch, toast]);

    const handleCrafting = useCallback(async (goal: string, ingredients: string[]) => {
        if (!character || isCraftingLoading) return;
        setIsCraftingLoading(true);
        toast({ title: "Attempting to craft...", description: `Trying to make: ${goal}` });
        const inventoryListNames = inventory.map(item => item.name);
        const skills = character.learnedSkills.map(s => s.name);
        const craftingInput: AttemptCraftingInput = {
            characterKnowledge: character.knowledge, characterSkills: skills, inventoryItems: inventoryListNames,
            desiredItem: goal, usedIngredients: ingredients,
        };
        try {
            const signal = createAbortSignal();
            const result: AttemptCraftingOutput = await attemptCrafting({ ...craftingInput, signal, userApiKey: activeApiKey });
            toast({ title: result.success ? "Crafting Successful!" : "Crafting Failed!", description: result.message, variant: result.success ? "default" : "destructive", duration: 5000 });
            let narrationText = `You attempted to craft ${goal} using ${ingredients.join(', ')}. ${result.message}`;
            if (result.success && result.craftedItem) {
                narrationText = `You successfully crafted a ${result.craftedItem.quality ? result.craftedItem.quality + ' ' : ''}${result.craftedItem.name}! ${result.message}`;
            }
            dispatch({ type: 'UPDATE_CRAFTING_RESULT', payload: { narration: narrationText, consumedItems: result.consumedItems, craftedItem: result.success ? result.craftedItem : null, newGameStateString: currentGameStateString }});
            setIsCraftingDialogOpen(false);
        } catch (err: any) {
            if (err.name === 'AbortError') {
                logger.log("Crafting aborted");
                return;
            }
            let userFriendlyError = `Crafting attempt failed. Please try again later.`;
            if (err.message?.includes('400 Bad Request') || err.message?.includes('invalid argument')) userFriendlyError = "Crafting failed: Invalid materials or combination? The AI was unable to process the request.";
            else if (err.message) userFriendlyError = `Crafting Error: ${err.message.substring(0, 100)}`;
            toast({ title: "Crafting Error", description: userFriendlyError, variant: "destructive" });
            setIsCraftingDialogOpen(false);
        } finally {
            setIsCraftingLoading(false);
        }
    }, [character, inventory, dispatch, toast, currentGameStateString, isCraftingLoading, createAbortSignal, activeApiKey]);

    const handleConfirmClassChange = useCallback(async (newClass: string) => {
        if (!character || !newClass || isGeneratingSkillTree || adventureSettings.adventureType === "Immersed") return;
        setPendingClassChange(null);
         
        toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path...", duration: 2000 });
        let newSkillTreeResult: SkillTree | null = null;
        try {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
            setLocalIsGeneratingSkillTree(true);
            const signal = createAbortSignal();
            newSkillTreeResult = await generateSkillTree({ characterClass: newClass, userApiKey: activeApiKey, signal });
            if (newSkillTreeResult && newSkillTreeResult.stages.length === 5) { 
                dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree: newSkillTreeResult } });
                toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
            } else {
                toast({ title: "Class Change Failed", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                logger.log("Class change aborted");
                return;
            }
            toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
        } finally {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
        }
    }, [character, dispatch, toast, isGeneratingSkillTree, adventureSettings.adventureType, createAbortSignal, activeApiKey]);

    const handleGoBack = useCallback(() => {
        if (loadingPhase.type !== 'idle') return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
    }, [loadingPhase, dispatch, toast]);

    const handleSuggestAction = useCallback(() => {
        if (loadingPhase.type !== 'idle' || !character) return;
        const learnedSkillNames = character.learnedSkills.map(s => s.name);
        const baseSuggestions = ["Look around", "Examine surroundings", "Check inventory", "Check status", "Check relationships", "Check reputation", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee"];
        const skillSuggestions = learnedSkillNames.map(name => `Use skill: ${name}`);
        const suggestions = [...baseSuggestions, ...skillSuggestions];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
    }, [loadingPhase, character, toast]);

    const handleManualClassChange = useCallback(() => {
        if (!character || adventureSettings.adventureType === "Immersed") return;
        const suggested = character.class === 'Warrior' ? 'Mage' : 'Warrior';
        setPendingClassChange(suggested);
    }, [character, adventureSettings.adventureType]);

    const handleUseSkill = useCallback((skillName: string) => {
        actionInputRef.current?.setValue(`Use skill: ${skillName}`);
    }, []);

    const handleUnlearnSkill = useCallback((skillName: string) => {
        dispatch({ type: "UNLEARN_SKILL", payload: skillName });
        toast({ title: "Skill Unlearned", description: `${skillName} has been unlearned.` });
    }, [dispatch, toast]);

    const handleRespecAll = useCallback(() => {
        dispatch({ type: "RESPEC_ALL_SKILLS" });
        toast({ title: "Skills Respecced", description: "All non-starter skills have been unlearned." });
    }, [dispatch, toast]);

    const processDevCommand = useCallback((action: string) => {
        if (!character) return;
        
        let devNarration = `(Developer Mode) Player chose: "${action}".`;
        const command = action.trim().toLowerCase();
        const parts = command.split(' ');
        const baseCommand = parts[0];
        const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
        
        const updates: Partial<Character> = {};
        let xpGained: number | undefined;

        if (baseCommand === '/xp' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) { xpGained = amount; devNarration += ` Granted ${amount} XP.`; }
            else { devNarration += " - Invalid XP amount."; }
        } else if (baseCommand === '/stage' && value) {
            const stageNum = parseInt(value, 10);
            if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) { updates.skillTreeStage = stageNum; devNarration += ` Set skill stage to ${stageNum}.`; }
            else { devNarration += " - Invalid stage number (0-4)."; }
        } else if (baseCommand === '/health' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                const newHealth = Math.max(0, Math.min(character.maxHealth, character.currentHealth + amount));
                updates.currentHealth = newHealth;
                devNarration += ` Adjusted health by ${amount}. New health: ${newHealth}.`;
            } else { devNarration += " - Invalid health amount."; }
        } else if (baseCommand === '/stamina' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                updates.currentStamina = Math.max(0, Math.min(character.maxStamina, character.currentStamina + amount));
                devNarration += ` Adjusted action stamina by ${amount}.`;
            } else { devNarration += " - Invalid action stamina amount."; }
        } else if (baseCommand === '/mana' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                updates.currentMana = Math.max(0, Math.min(character.maxMana, character.currentMana + amount));
                devNarration += ` Adjusted mana by ${amount}.`;
            } else { devNarration += " - Invalid mana amount."; }
        } else if (baseCommand === '/addtrait' && value) {
            updates.traits = [...character.traits, value];
            devNarration += ` Added trait: ${value}.`;
        } else if (baseCommand === '/addknowledge' && value) {
            updates.knowledge = [...character.knowledge, value];
            devNarration += ` Added knowledge: ${value}.`;
        } else if (baseCommand === '/addskill' && value) {
            updates.learnedSkills = [...character.learnedSkills, { name: value, description: "Developer added skill", type: 'Learned' }];
            devNarration += ` Added skill: ${value}.`;
        } else {
            devNarration += " Action processed. Dev restrictions bypassed.";
        }

        if (Object.keys(updates).length > 0) dispatch({ type: "UPDATE_CHARACTER", payload: updates });
        if (xpGained) dispatch({ type: "GRANT_XP", payload: xpGained });
        
        const devLogEntry: StoryLogEntry = {
            narration: devNarration,
            updatedGameState: updateGameStateString(currentGameStateString, character, inventory, turnCount + 1),
            timestamp: Date.now(),
            branchingChoices: GENERIC_BRANCHING_CHOICES
        };
        
        dispatch({ type: "UPDATE_NARRATION", payload: devLogEntry });
        setBranchingChoices(GENERIC_BRANCHING_CHOICES);
    }, [character, currentGameStateString, inventory, turnCount, dispatch]);

    useEffect(() => {
        if (character?.class === 'admin000' && lastPlayerAction && lastPlayerAction.startsWith('/')) {
            processDevCommand(lastPlayerAction);
            setLastPlayerAction(null);
        }
    }, [lastPlayerAction, character, processDevCommand]);

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Loading Character Data...</p>
                <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button>
            </div>
        );
    }

    const anyLoading = loadingPhase.type !== 'idle';

    return (
        <TooltipProvider>
            <GameplayLayout
                character={character}
                inventory={inventory}
                isGeneratingSkillTree={isGeneratingSkillTree}
                turnCount={turnCount}
                storyLog={storyLog}
                loadingPhase={loadingPhase}
                diceResult={diceResult}
                diceType={diceType}
                error={error}
                errorRawResponse={errorRawResponse} // ERR-11: Pass raw AI response
                branchingChoices={branchingChoices}
                isInitialLoading={isInitialLoading}
                anyLoading={anyLoading}
                isConnected={isConnected}
                isMultiplayerHost={isMultiplayerHost}
                pendingGuestAction={pendingGuestAction}
                currentAdventureId={currentAdventureId}
                aiProvider={state.aiProvider}
                multiplayerState={multiplayerState}
                isPartySidebarOpen={isPartySidebarOpen}
                isChatPanelOpen={isChatPanelOpen}
                isDesktopSettingsOpen={isDesktopSettingsOpen}
                isCraftingDialogOpen={isCraftingDialogOpen}
                pendingClassChange={pendingClassChange}
                onUseSkill={handleUseSkill}
                onUnlearnSkill={handleUnlearnSkill}
                onRespecAll={handleRespecAll}
                onChoiceClick={handleBranchingChoiceClick}
                onRetryNarration={handleRetryNarration}
                onSubmitAction={handlePlayerAction}
                onSuggestAction={handleSuggestAction}
                onCraft={() => setIsCraftingDialogOpen(true)}
                onSave={handleSaveGame}
                onAbandon={handleGoBack}
                onEnd={() => handleEndAdventure(undefined, character.currentHealth <= 0)}
                onSettings={() => setIsDesktopSettingsOpen(true)}
                onChangeClass={handleManualClassChange}
                onConfirmClassChange={handleConfirmClassChange}
                onKickPeer={handleKickPeer}
                onTogglePause={handleTogglePause}
                onOpenChat={() => setIsChatPanelOpen(true)}
                onSetTurnOrder={handleSetTurnOrder}
                onReconnect={reconnect}
                onSendTradeRequest={handleSendTradeRequest}
                onSendInteractionResponse={(accepted) => {
                    if (accepted) {
                        handleInteractionAccept();
                    } else {
                        handleInteractionDecline();
                    }
                }}
                isReconnecting={isReconnecting}
                actionInputRef={actionInputRef}
                onClosePartySidebar={() => setIsPartySidebarOpen(false)}
                onOpenPartySidebar={() => setIsPartySidebarOpen(true)}
                onCloseChatPanel={() => setIsChatPanelOpen(false)}
                onCloseSettings={() => setIsDesktopSettingsOpen(false)}
                onCloseCrafting={() => setIsCraftingDialogOpen(false)}
                onCloseClassChange={() => setPendingClassChange(null)}
                isMobile={isMobile}
                currentInteraction={currentInteraction}
                isInteractionDialogOpen={isInteractionDialogOpen}
                isInteractionTarget={isInteractionTarget}
                onSetIsInteractionDialogOpen={setIsInteractionDialogOpen}
                onSendChatMessage={handleSendChatMessage}
            />

            {/* Outgoing Interaction Dialog - not included in GameplayLayout */}
            {isOutgoingInteractionOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border rounded-lg w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Send Interaction Request</h3>
                        <p className="text-sm text-muted-foreground">
                            Sending to: {multiplayerState.partyState[outgoingTargetPeerId || '']?.name || outgoingTargetPeerId}
                        </p>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Interaction Type</label>
                            <div className="flex gap-2">
                                {(['trade', 'gift', 'duel'] as const).map(type => (
                                    <InteractionTypeButton
                                        key={type}
                                        type={type}
                                        isSelected={outgoingInteractionType === type}
                                        onSelect={setOutgoingInteractionType}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Details</label>
                            <textarea
                                className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px]"
                                value={outgoingInteractionDetails}
                                onChange={(e) => setOutgoingInteractionDetails(e.target.value)}
                                placeholder={
                                    outgoingInteractionType === 'trade' ? 'What do you want to trade?' :
                                    outgoingInteractionType === 'gift' ? 'What are you giving?' :
                                    'Challenge details...'
                                }
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleOutgoingInteractionCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleOutgoingInteractionSubmit}>
                                Send Request
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trade Dialog */}
            {isTradeDialogOpen && tradeTargetPeerId && (
                <TradeDialog
                    isOpen={isTradeDialogOpen}
                    onClose={() => {
                        setIsTradeDialogOpen(false);
                        setTradeTargetPeerId(null);
                    }}
                    currentPlayerId={state.peerId || 'host'}
                    targetPlayerId={tradeTargetPeerId}
                    targetPlayerName={multiplayerState.partyState[tradeTargetPeerId]?.name || 'Unknown Player'}
                    inventory={state.inventory}
                    onTradeComplete={handleTradeComplete}
                />
            )}
        </TooltipProvider>
    );
}