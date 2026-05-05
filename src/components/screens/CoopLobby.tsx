"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useMultiplayer } from "../../hooks/use-multiplayer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CardboardCard, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/game/CardboardCard";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Loader2, Users, Copy, Play, ArrowLeft, QrCode, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export function CoopLobby() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  
  const [playerName, setPlayerName] = useState("Player" + Math.floor(Math.random() * 1000));
  const [offerString, setOfferString] = useState<string | null>(null);
  const [answerString, setAnswerString] = useState<string | null>(null);
  const [inputOffer, setInputOffer] = useState("");
  const [inputAnswer, setInputAnswer] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'idle' | 'host-waiting' | 'guest-waiting' | 'connected'>('idle');
  const [error, setError] = useState<string | null>(null);

  const {
    multiplayerState,
    createSession,
    joinSession,
    applyGuestAnswer,
    disconnect,
    isConnected,
    isHost,
  } = useMultiplayer({
    playerName,
    onGameActionReceived: (playerId, action, turnNumber, isInitial) => {
      // Host receives game actions from guests
      console.log("Host received game action:", { playerId, action, turnNumber, isInitial });
    },
    onStoryUpdate: (entry, newTurn) => {
      dispatch({ type: "APPLY_REMOTE_NARRATION", payload: { entry, newTurn } });
    },
    onPartyStateUpdate: (partyState) => {
      dispatch({ type: "UPDATE_PARTY_STATE", payload: partyState });
    },
    onChatMessage: (msg) => {
      dispatch({ type: "ADD_CHAT_MESSAGE", payload: msg });
    },
    onControlMessage: (msg) => {
      console.log("Control message received:", msg);
    },
  });

  // Update connection step based on multiplayer state
  useEffect(() => {
    if (isConnected) {
      setConnectionStep('connected');
      dispatch({ type: "SET_CONNECTION_STATUS", payload: multiplayerState.connectionStatus });
      toast({ title: "Connected!", description: "Successfully connected to co-op session." });
    }
  }, [isConnected, multiplayerState.connectionStatus, dispatch, toast]);

  const handleCreateSession = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const encodedOffer = await createSession();
      setOfferString(encodedOffer);
      setConnectionStep('host-waiting');
      dispatch({ type: "SET_IS_HOST", payload: true });
      dispatch({ type: "SET_SESSION_ID", payload: multiplayerState.peerId });
      toast({ title: "Session Created!", description: "Share the QR code or code with your friends." });
    } catch (err: any) {
      setError(err.message || "Failed to create session.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  }, [createSession, multiplayerState.peerId, dispatch, toast]);

  const handleJoinSession = useCallback(async () => {
    if (!inputOffer.trim()) {
      setError("Please enter the invitation code.");
      return;
    }
    setIsInitializing(true);
    setError(null);
    try {
      const encodedAnswer = await joinSession(inputOffer.trim());
      setAnswerString(encodedAnswer);
      setConnectionStep('guest-waiting');
      dispatch({ type: "SET_IS_HOST", payload: false });
      toast({ title: "Code Generated!", description: "Send this code back to the host." });
    } catch (err: any) {
      setError(err.message || "Failed to join session.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  }, [inputOffer, joinSession, dispatch, toast]);

  const handleHostApplyAnswer = useCallback(async () => {
    if (!inputAnswer.trim()) {
      setError("Please enter the return code from your guest.");
      return;
    }
    setIsInitializing(true);
    setError(null);
    try {
      await applyGuestAnswer(inputAnswer.trim());
      toast({ title: "Answer Applied!", description: "Connection should now be established." });
    } catch (err: any) {
      setError(err.message || "Failed to apply answer.");
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  }, [inputAnswer, applyGuestAnswer, toast]);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: "Copied!", description: `${label} copied to clipboard.` }))
      .catch(() => toast({ title: "Copy Failed", description: "Could not copy to clipboard.", variant: "destructive" }));
  }, [toast]);

  const handleStartGame = useCallback(() => {
    if (!isHost) return;
    dispatch({ type: "SET_GAME_STATUS", payload: "CoopGameplay" });
    // Host sets initial turn order
    const turnOrder = [state.peerId || multiplayerState.peerId, ...state.players];
    dispatch({ type: "SET_TURN_ORDER", payload: turnOrder });
    toast({ title: "Game Starting!", description: "The adventure begins now." });
  }, [isHost, state.peerId, multiplayerState.peerId, state.players, dispatch, toast]);

  const handleBackToMenu = useCallback(() => {
    disconnect();
    dispatch({ type: "RESET_GAME" });
  }, [disconnect, dispatch]);

  if (connectionStep === 'connected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <CardboardCard className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="w-7 h-7 text-green-500 dark:text-green-400" /> Connected!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You are connected as <span className="font-bold">{playerName}</span>.
              {isHost ? " You are the host." : " Waiting for host to start the game."}
            </p>
            {isHost && (
              <Button onClick={handleStartGame} className="w-full bg-primary hover:bg-primary/90">
                <Play className="mr-2 h-4 w-4" /> Start Game
              </Button>
            )}
            {!isHost && (
              <p className="text-sm text-muted-foreground italic">Waiting for the host to start the game...</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleBackToMenu} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Disconnect
            </Button>
          </CardFooter>
        </CardboardCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-lg shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Users className="w-7 h-7" /> Co-op Lobby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="player-name">Your Name</Label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isInitializing}
            />
          </div>

          {connectionStep === 'idle' && (
            <>
              <Button 
                onClick={handleCreateSession} 
                disabled={isInitializing} 
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                Create New Session (Host)
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="join-offer">Join Existing Session</Label>
                <div className="flex gap-2">
                  <Input
                    id="join-offer"
                    placeholder="Paste invitation code here..."
                    value={inputOffer}
                    onChange={(e) => setInputOffer(e.target.value)}
                    disabled={isInitializing}
                    className="font-mono text-xs"
                  />
                  <Button onClick={handleJoinSession} disabled={isInitializing || !inputOffer.trim()} variant="secondary">
                    {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Join
                  </Button>
                </div>
              </div>
            </>
          )}

          {connectionStep === 'host-waiting' && offerString && (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Share this code with your friend:</AlertTitle>
                <AlertDescription>
                  <div className="flex flex-col items-center gap-4 mt-2">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeSVG value={offerString} size={200} />
                    </div>
                    <div className="w-full">
                      <Label>Invitation Code:</Label>
                      <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-muted">
                        <p className="text-xs font-mono font-semibold text-primary flex-grow break-all">{offerString}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(offerString, "Invitation code")} aria-label="Copy invitation code">
                          <Copy className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="host-answer">Enter Guest's Return Code:</Label>
                      <div className="flex gap-2">
                        <Input
                          id="host-answer"
                          placeholder="Paste guest's return code..."
                          value={inputAnswer}
                          onChange={(e) => setInputAnswer(e.target.value)}
                          disabled={isInitializing}
                          className="font-mono text-xs"
                        />
                        <Button onClick={handleHostApplyAnswer} disabled={isInitializing || !inputAnswer.trim()} variant="secondary">
                          {isInitializing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {connectionStep === 'guest-waiting' && answerString && (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Send this code back to the host:</AlertTitle>
                <AlertDescription>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                      <p className="text-xs font-mono font-semibold text-primary flex-grow break-all">{answerString}</p>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(answerString, "Return code")} aria-label="Copy return code">
                        <Copy className="w-4 h-4"/>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 italic">Waiting for host to confirm connection...</p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleBackToMenu} disabled={isInitializing} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Menu
          </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}