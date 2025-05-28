
// src/components/screens/CoopLobby.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/game/CardboardCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Copy, Play, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createCoopSession,
  joinCoopSession,
  listenToSessionUpdates,
  hostStartGame,
} from "@/services/multiplayer-service";
import type { FirestoreCoopSession } from "@/types/adventure-types";

export function CoopLobby() {
  const { state, dispatch } = useGame();
  const { currentPlayerUid, sessionId, isHost, players: contextPlayers } = state;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [sessionToJoin, setSessionToJoin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<FirestoreCoopSession | null>(null);

  // Listen to session updates from Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (sessionId) {
      setIsLoading(true);
      unsubscribe = listenToSessionUpdates(sessionId, (data) => {
        setSessionData(data);
        setIsLoading(false);
        if (data) {
          // Sync local player list with Firestore one if different
          if (JSON.stringify(data.players.sort()) !== JSON.stringify(contextPlayers.sort())) {
            dispatch({ type: "SET_PLAYERS", payload: data.players });
          }
          // If Firestore says game is playing, and local state is still lobby, transition
          if (data.status === 'playing' && state.status === 'CoopLobby') {
            console.log("CoopLobby: Session status changed to 'playing', transitioning to CoopGameplay.");
            dispatch({
                type: "SET_ADVENTURE_SETTINGS", // Sync basic settings
                payload: { ...data.adventureSettings, adventureType: "Coop" }
            });
            dispatch({ type: "SET_GAME_STATUS", payload: "CoopGameplay" });
          }
        } else {
            // Session deleted or error
            toast({ title: "Session Ended", description: "The co-op session is no longer available.", variant: "destructive"});
            dispatch({type: "RESET_GAME"}); // Go back to main menu
        }
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [sessionId, dispatch, toast, contextPlayers, state.status]);

  const handleCreateSession = async () => {
    if (!currentPlayerUid) {
      setError("You must be signed in to create a session.");
      toast({ title: "Authentication Required", description: "Please sign in to create a co-op game.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const newSessionId = await createCoopSession(currentPlayerUid);
      dispatch({ type: "SET_SESSION_ID", payload: newSessionId });
      dispatch({ type: "SET_IS_HOST", payload: true });
      dispatch({ type: "SET_PLAYERS", payload: [currentPlayerUid] }); // Host is the first player
      toast({ title: "Session Created!", description: `Session ID: ${newSessionId}. Share this with your friends!` });
    } catch (err: any) {
      setError(err.message || "Failed to create session.");
      toast({ title: "Error Creating Session", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!currentPlayerUid) {
      setError("You must be signed in to join a session.");
      toast({ title: "Authentication Required", description: "Please sign in to join a co-op game.", variant: "destructive" });
      return;
    }
    if (!sessionToJoin.trim()) {
      setError("Please enter a Session ID to join.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await joinCoopSession(sessionToJoin.trim().toUpperCase(), currentPlayerUid);
      dispatch({ type: "SET_SESSION_ID", payload: sessionToJoin.trim().toUpperCase() });
      dispatch({ type: "SET_IS_HOST", payload: false });
      // Players list will be updated by the Firestore listener
      toast({ title: "Joined Session!", description: `Successfully joined session: ${sessionToJoin.trim().toUpperCase()}` });
    } catch (err: any) {
      setError(err.message || "Failed to join session.");
      toast({ title: "Error Joining Session", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!sessionId || !currentPlayerUid || !isHost || !sessionData || sessionData.status !== 'lobby') return;
    setIsLoading(true);
    setError(null);
    try {
        await hostStartGame(sessionId, currentPlayerUid);
        // Game status transition to CoopGameplay will be handled by the Firestore listener
        toast({ title: "Game Starting!", description: "The adventure begins now."});
    } catch (err: any) {
        setError(err.message || "Failed to start game.");
        toast({ title: "Error Starting Game", description: err.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
        .then(() => toast({ title: "Session ID Copied!", description: sessionId }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy Session ID.", variant: "destructive" }));
    }
  };

  const handleBackToMenu = () => {
    dispatch({ type: "RESET_GAME" });
  };

  if (!currentPlayerUid) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <CardboardCard className="w-full max-w-md text-center">
                 <CardHeader><CardTitle>Authentication Required</CardTitle></CardHeader>
                 <CardContent><p className="text-muted-foreground">Please ensure you are signed in (e.g., via Anonymous Authentication in Firebase) to use co-op features.</p></CardContent>
                 <CardFooter><Button onClick={handleBackToMenu} className="w-full">Back to Main Menu</Button></CardFooter>
            </CardboardCard>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-lg shadow-xl">
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Users className="w-7 h-7"/> Co-op Lobby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {!sessionId ? (
            <>
              <div className="space-y-2">
                <Button onClick={handleCreateSession} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create New Session
                </Button>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"> <span className="w-full border-t" /> </div>
                <div className="relative flex justify-center text-xs uppercase"> <span className="bg-background px-2 text-muted-foreground">Or</span> </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-id-join">Join Existing Session</Label>
                <div className="flex gap-2">
                  <Input
                    id="session-id-join"
                    placeholder="Enter Session ID (e.g., ABC-XYZ)"
                    value={sessionToJoin}
                    onChange={(e) => setSessionToJoin(e.target.value.toUpperCase())}
                    disabled={isLoading}
                    className="uppercase"
                  />
                  <Button onClick={handleJoinSession} disabled={isLoading || !sessionToJoin.trim()} variant="secondary">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Join
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Session ID (Share with friends):</Label>
                <div className="flex items-center gap-2 mt-1 p-2 border rounded-md bg-muted">
                  <p className="text-lg font-mono font-semibold text-primary flex-grow">{sessionId}</p>
                  <Button variant="ghost" size="icon" onClick={copySessionId} aria-label="Copy Session ID">
                    <Copy className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
              <div>
                <Label>Players in Lobby ({sessionData?.players?.length || 0}):</Label>
                <ScrollArea className="h-24 mt-1 border rounded-md p-2">
                  {sessionData?.players && sessionData.players.length > 0 ? (
                    sessionData.players.map((uid) => (
                      <div key={uid} className="text-sm p-1 bg-background/50 rounded mb-1">
                        Player {uid.substring(0, 6)}... {uid === currentPlayerUid && "(You)"} {uid === sessionData.hostUid && "(Host)"}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-2">Waiting for players...</p>
                  )}
                </ScrollArea>
              </div>
              {isHost && sessionData?.status === 'lobby' && (
                <Button onClick={handleStartGame} disabled={isLoading || (sessionData?.players?.length ?? 0) < 1} className="w-full bg-green-600 hover:bg-green-700">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Start Game
                </Button>
              )}
              {!isHost && sessionData?.status === 'lobby' && (
                <p className="text-center text-muted-foreground italic">Waiting for the host ({sessionData?.hostUid.substring(0,6)}...) to start the game.</p>
              )}
              {sessionData?.status === 'playing' && (
                 <p className="text-center text-green-600 font-semibold">Game in progress! You should be redirected shortly...</p>
              )}
               {sessionData?.status === 'ended' && (
                 <p className="text-center text-destructive font-semibold">This session has ended.</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleBackToMenu} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Main Menu
          </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
