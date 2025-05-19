
// src/components/screens/AdventureSetup.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings, Globe, ScrollText, ShieldAlert, Sparkles, AlertTriangle, BookOpen, Atom, Drama, Lightbulb, Users as UsersIcon, Puzzle, Mic2, UserPlus, UserCheck, Loader2 } from "lucide-react"; // Added new icons
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import type { AdventureSettings, DifficultyLevel, AdventureType, GenreTheme, MagicSystem, TechLevel, DominantTone, CombatFrequency, PuzzleFrequency, SocialFocus } from "@/types/adventure-types";
import { VALID_ADVENTURE_DIFFICULTY_LEVELS } from "@/lib/constants";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import type { Character } from "@/types/character-types";
import { initialCharacterState } from "@/context/game-initial-state"; // For creating character structure
import { calculateMaxStamina, calculateMaxMana, getStarterSkillsForClass, calculateXpToNextLevel } from "@/lib/gameUtils";


export function AdventureSetup() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  
  const adventureTypeFromContext = state.adventureSettings.adventureType;

  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath);
  const [worldType, setWorldType] = useState<string>(state.adventureSettings.worldType ?? "");
  const [mainQuestline, setMainQuestline] = useState<string>(state.adventureSettings.mainQuestline ?? "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(state.adventureSettings.difficulty ?? "Normal");
  
  // Immersed Adventure State
  const [universeName, setUniverseName] = useState<string>(state.adventureSettings.universeName ?? "");
  const [playerCharacterConcept, setPlayerCharacterConcept] = useState<string>(state.adventureSettings.playerCharacterConcept ?? ""); // Stores existing name OR original concept
  const [characterOriginType, setCharacterOriginType] = useState<'existing' | 'original'>(state.adventureSettings.characterOriginType ?? 'original');
  
  // New state for custom adventure fields
  const [genreTheme, setGenreTheme] = useState<GenreTheme>(state.adventureSettings.genreTheme ?? "");
  const [magicSystem, setMagicSystem] = useState<MagicSystem>(state.adventureSettings.magicSystem ?? "");
  const [techLevel, setTechLevel] = useState<TechLevel>(state.adventureSettings.techLevel ?? "");
  const [dominantTone, setDominantTone] = useState<DominantTone>(state.adventureSettings.dominantTone ?? "");
  const [startingSituation, setStartingSituation] = useState<string>(state.adventureSettings.startingSituation ?? "");
  const [combatFrequency, setCombatFrequency] = useState<CombatFrequency>(state.adventureSettings.combatFrequency ?? "Medium");
  const [puzzleFrequency, setPuzzleFrequency] = useState<PuzzleFrequency>(state.adventureSettings.puzzleFrequency ?? "Medium");
  const [socialFocus, setSocialFocus] = useState<SocialFocus>(state.adventureSettings.socialFocus ?? "Medium");

  const [customError, setCustomError] = useState<string | null>(null);
  const [isLoadingImmersedCharacter, setIsLoadingImmersedCharacter] = useState(false);


  useEffect(() => {
    setPermanentDeath(state.adventureSettings.permanentDeath);
    setDifficulty(state.adventureSettings.difficulty ?? "Normal");
    if (adventureTypeFromContext === "Custom") {
      setWorldType(state.adventureSettings.worldType ?? "");
      setMainQuestline(state.adventureSettings.mainQuestline ?? "");
      setGenreTheme(state.adventureSettings.genreTheme ?? "");
      setMagicSystem(state.adventureSettings.magicSystem ?? "");
      setTechLevel(state.adventureSettings.techLevel ?? "");
      setDominantTone(state.adventureSettings.dominantTone ?? "");
      setStartingSituation(state.adventureSettings.startingSituation ?? "");
      setCombatFrequency(state.adventureSettings.combatFrequency ?? "Medium");
      setPuzzleFrequency(state.adventureSettings.puzzleFrequency ?? "Medium");
      setSocialFocus(state.adventureSettings.socialFocus ?? "Medium");
    } else if (adventureTypeFromContext === "Immersed") {
      setUniverseName(state.adventureSettings.universeName ?? "");
      setPlayerCharacterConcept(state.adventureSettings.playerCharacterConcept ?? "");
      setCharacterOriginType(state.adventureSettings.characterOriginType ?? 'original');
    }
  }, [state.adventureSettings, adventureTypeFromContext]);


  const validateSettings = (): boolean => {
     if (adventureTypeFromContext === "Custom") {
        if (!worldType.trim()) { setCustomError("World Type is required."); return false; }
        if (!mainQuestline.trim()) { setCustomError("Main Questline is required."); return false; }
        if (!genreTheme) { setCustomError("Genre/Theme is required."); return false; }
        if (!magicSystem) { setCustomError("Magic System is required."); return false; }
        if (!techLevel) { setCustomError("Technological Level is required."); return false; }
        if (!dominantTone) { setCustomError("Dominant Tone is required."); return false; }
        if (!startingSituation.trim()) { setCustomError("Starting Situation is required."); return false; }
     } else if (adventureTypeFromContext === "Immersed") {
        if (!universeName.trim()) { setCustomError("Universe Name is required."); return false; }
        if (characterOriginType === 'existing' && !playerCharacterConcept.trim()) {
             setCustomError("Existing Character's Name is required."); return false;
        }
        if (characterOriginType === 'original' && !playerCharacterConcept.trim()) {
            setCustomError("Original Character Concept is required."); return false;
        }
     }
     setCustomError(null);
     return true;
  };


  const handleStartAdventure = async () => {
     setCustomError(null);

    if (!adventureTypeFromContext) {
        toast({ title: "Adventure Type Missing", description: "Please return to main menu.", variant: "destructive" });
        dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" });
        return;
    }

     if (!validateSettings()) {
         toast({ title: "Settings Required", description: customError || `Please fill all details.`, variant: "destructive" });
         return;
     }

     const finalDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(difficulty) ? difficulty : "Normal";

    const settingsPayload: AdventureSettings = { 
      adventureType: adventureTypeFromContext,
      permanentDeath,
      difficulty: finalDifficulty,
      worldType: adventureTypeFromContext === "Custom" ? worldType : undefined,
      mainQuestline: adventureTypeFromContext === "Custom" ? mainQuestline : undefined,
      genreTheme: adventureTypeFromContext === "Custom" ? genreTheme : undefined,
      magicSystem: adventureTypeFromContext === "Custom" ? magicSystem : undefined,
      techLevel: adventureTypeFromContext === "Custom" ? techLevel : undefined,
      dominantTone: adventureTypeFromContext === "Custom" ? dominantTone : undefined,
      startingSituation: adventureTypeFromContext === "Custom" ? startingSituation : undefined,
      combatFrequency: adventureTypeFromContext === "Custom" ? combatFrequency : "Medium",
      puzzleFrequency: adventureTypeFromContext === "Custom" ? puzzleFrequency : "Medium",
      socialFocus: adventureTypeFromContext === "Custom" ? socialFocus : "Medium",
      universeName: adventureTypeFromContext === "Immersed" ? universeName : undefined,
      playerCharacterConcept: adventureTypeFromContext === "Immersed" ? playerCharacterConcept : undefined,
      characterOriginType: adventureTypeFromContext === "Immersed" ? characterOriginType : undefined,
    };

    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: settingsPayload });

    // Flow Logic:
    // 1. Immersed (Existing Character): AI generates character, then directly to Gameplay.
    // 2. Randomized, Custom, Immersed (Original Character): Proceed to CharacterCreation.
    if (adventureTypeFromContext === "Immersed" && characterOriginType === "existing") {
        setIsLoadingImmersedCharacter(true);
        toast({ title: "Fetching Character Lore...", description: `Preparing ${playerCharacterConcept} from ${universeName}...` });
        try {
            const aiProfile: GenerateCharacterDescriptionOutput = await generateCharacterDescription({
                 characterDescription: playerCharacterConcept, 
                 isImmersedMode: true,
                 universeName: universeName,
                 playerCharacterConcept: playerCharacterConcept 
            });

            const baseStats = { ...initialCharacterState.stats };
            const finalStats = { ...baseStats }; 

            const newCharacter: Character = {
                ...initialCharacterState,
                name: playerCharacterConcept, 
                description: aiProfile.detailedDescription || `Playing as ${playerCharacterConcept} in ${universeName}.`,
                class: aiProfile.inferredClass || "Immersed Protagonist", 
                traits: aiProfile.inferredTraits || [],
                knowledge: aiProfile.inferredKnowledge || [],
                background: aiProfile.inferredBackground || `From the universe of ${universeName}.`,
                stats: finalStats,
                aiGeneratedDescription: aiProfile.detailedDescription,
                maxStamina: calculateMaxStamina(finalStats),
                currentStamina: calculateMaxStamina(finalStats),
                maxMana: calculateMaxMana(finalStats, aiProfile.inferredKnowledge || []),
                currentMana: calculateMaxMana(finalStats, aiProfile.inferredKnowledge || []),
                learnedSkills: getStarterSkillsForClass(aiProfile.inferredClass || "Immersed Protagonist"),
                xpToNextLevel: calculateXpToNextLevel(1),
                skillTree: null, 
                skillTreeStage: 0,
            };
            
            dispatch({ type: "SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY", payload: { character: newCharacter, adventureSettings: settingsPayload } });
            toast({ title: "Adventure Starting!", description: `Stepping into the shoes of ${playerCharacterConcept} in ${universeName}!` });

        } catch (err) {
            console.error("Failed to generate immersed character profile:", err);
            toast({ title: "Character Profile Error", description: "Could not retrieve character details. Please try again or define an original character.", variant: "destructive" });
        } finally {
            setIsLoadingImmersedCharacter(false);
        }
    } else { 
        // For Randomized, Custom, or Immersed (Original Character)
        dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
        let descriptionToast = `Proceeding to character creation for your ${adventureTypeFromContext} adventure (${finalDifficulty}).`;
        if (adventureTypeFromContext === "Randomized") {
            descriptionToast = `Preparing a randomized ${finalDifficulty} adventure. Time to create your hero!`;
        } else if (adventureTypeFromContext === "Immersed" && characterOriginType === "original") {
            descriptionToast = `Entering the universe of ${universeName}. Let's create your original character!`;
        }
        toast({ title: "Setup Complete!", description: descriptionToast });
    }
  };

   const handleBack = () => {
    dispatch({ type: "RESET_GAME" });
  };

   useEffect(() => {
      if (adventureTypeFromContext) setCustomError(null);
   }, [adventureTypeFromContext]);

  if (!adventureTypeFromContext) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
             <CardboardCard className="w-full max-w-md text-center">
                <CardHeader> <CardTitle className="text-2xl flex items-center justify-center gap-2"><AlertTriangle className="w-6 h-6 text-destructive"/> Error</CardTitle> </CardHeader>
                <CardContent> <p className="text-muted-foreground">Adventure type not selected. Please return to main menu.</p> </CardContent>
                <CardFooter> <Button onClick={() => dispatch({ type: "RESET_GAME" })} className="w-full"> Back to Main Menu </Button> </CardFooter>
             </CardboardCard>
        </div>
    );
  }

  const getAdventureTypeIcon = () => {
    switch(adventureTypeFromContext) {
        case "Randomized": return <Dices className="w-5 h-5"/>;
        case "Custom": return <Swords className="w-5 h-5"/>;
        case "Immersed": return <Sparkles className="w-5 h-5"/>;
        default: return <Settings className="w-5 h-5"/>;
    }
  }

  const proceedButtonText = (adventureTypeFromContext === "Immersed" && characterOriginType === "existing") 
                            ? "Start Adventure" 
                            : "Proceed to Character Creation";
                            
  const isProceedDisabled = customError !== null || isLoadingImmersedCharacter ||
                            (adventureTypeFromContext === 'Custom' && (!worldType.trim() || !mainQuestline.trim() || !genreTheme || !magicSystem || !techLevel || !dominantTone || !startingSituation.trim() )) ||
                            (adventureTypeFromContext === 'Immersed' && (!universeName.trim() || !playerCharacterConcept.trim()));


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2"> <Settings className="w-7 h-7"/> Adventure Setup </CardTitle>
           <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-1"> Selected Type: {getAdventureTypeIcon()} <span className="font-medium">{adventureTypeFromContext}</span> </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {customError && ( <Alert variant="destructive"> <AlertDescription>{customError}</AlertDescription> </Alert> )}

          {adventureTypeFromContext === "Custom" && (
            <div className="space-y-4 border-t border-foreground/10 pt-6 mt-0">
               <h3 className="text-xl font-semibold mb-4 border-b pb-2">Customize Your Adventure</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Column 1 */}
                   <div className="space-y-4">
                       <div className="space-y-2">
                           <Label htmlFor="worldType" className="flex items-center gap-1"><Globe className="w-4 h-4"/> World Type</Label>
                           <Input id="worldType" value={worldType} onChange={(e) => setWorldType(e.target.value)} placeholder="e.g., Forgotten Kingdom" className={customError && !worldType.trim() ? 'border-destructive' : ''} />
                       </div>
                       <div className="space-y-2">
                           <Label htmlFor="mainQuestline" className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> Main Questline (Goal)</Label>
                           <Input id="mainQuestline" value={mainQuestline} onChange={(e) => setMainQuestline(e.target.value)} placeholder="e.g., Find the Lost Artifact" className={customError && !mainQuestline.trim() ? 'border-destructive' : ''}/>
                       </div>
                        <div className="space-y-2">
                            <Label htmlFor="genreTheme" className="flex items-center gap-1"><BookOpen className="w-4 h-4"/> Genre/Theme</Label>
                            <Select value={genreTheme} onValueChange={(v) => setGenreTheme(v as GenreTheme)}>
                                <SelectTrigger id="genreTheme"><SelectValue placeholder="Select genre..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High Fantasy">High Fantasy</SelectItem><SelectItem value="Dark Fantasy">Dark Fantasy</SelectItem>
                                    <SelectItem value="Sci-Fi (Cyberpunk)">Sci-Fi (Cyberpunk)</SelectItem><SelectItem value="Sci-Fi (Space Opera)">Sci-Fi (Space Opera)</SelectItem>
                                    <SelectItem value="Post-Apocalyptic">Post-Apocalyptic</SelectItem><SelectItem value="Horror">Horror</SelectItem>
                                    <SelectItem value="Mystery">Mystery</SelectItem><SelectItem value="Urban Fantasy">Urban Fantasy</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="magicSystem" className="flex items-center gap-1"><Sparkles className="w-4 h-4"/> Magic System</Label>
                            <Select value={magicSystem} onValueChange={(v) => setMagicSystem(v as MagicSystem)}>
                                <SelectTrigger id="magicSystem"><SelectValue placeholder="Select magic system..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High Magic (Common & Powerful)">High Magic</SelectItem><SelectItem value="Low Magic (Rare & Subtle)">Low Magic</SelectItem>
                                    <SelectItem value="Elemental Magic">Elemental Magic</SelectItem><SelectItem value="Psionics">Psionics</SelectItem><SelectItem value="No Magic">No Magic</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="startingSituation" className="flex items-center gap-1"><Play className="w-4 h-4"/> Starting Situation</Label>
                            <Input id="startingSituation" value={startingSituation} onChange={(e) => setStartingSituation(e.target.value)} placeholder="e.g., Waking up with amnesia" className={customError && !startingSituation.trim() ? 'border-destructive' : ''}/>
                       </div>
                   </div>
                   {/* Column 2 */}
                   <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="techLevel" className="flex items-center gap-1"><Atom className="w-4 h-4"/> Technological Level</Label>
                            <Select value={techLevel} onValueChange={(v) => setTechLevel(v as TechLevel)}>
                                <SelectTrigger id="techLevel"><SelectValue placeholder="Select tech level..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Primitive">Primitive</SelectItem><SelectItem value="Medieval">Medieval</SelectItem>
                                    <SelectItem value="Renaissance">Renaissance</SelectItem><SelectItem value="Industrial">Industrial</SelectItem>
                                    <SelectItem value="Modern">Modern</SelectItem><SelectItem value="Futuristic">Futuristic</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="dominantTone" className="flex items-center gap-1"><Drama className="w-4 h-4"/> Dominant Tone</Label>
                            <Select value={dominantTone} onValueChange={(v) => setDominantTone(v as DominantTone)}>
                                <SelectTrigger id="dominantTone"><SelectValue placeholder="Select tone..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Heroic & Optimistic">Heroic & Optimistic</SelectItem><SelectItem value="Grim & Perilous">Grim & Perilous</SelectItem>
                                    <SelectItem value="Mysterious & Eerie">Mysterious & Eerie</SelectItem><SelectItem value="Comedic & Lighthearted">Comedic & Lighthearted</SelectItem>
                                    <SelectItem value="Serious & Political">Serious & Political</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                        <div className="space-y-2">
                            <Label htmlFor="combatFrequency" className="flex items-center gap-1"><Swords className="w-4 h-4"/> Combat Frequency</Label>
                            <Select value={combatFrequency} onValueChange={(v) => setCombatFrequency(v as CombatFrequency)}>
                                <SelectTrigger id="combatFrequency"><SelectValue placeholder="Select combat frequency..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="None (Focus on Puzzles/Social)">None (Focus on Puzzles/Social)</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="puzzleFrequency" className="flex items-center gap-1"><Puzzle className="w-4 h-4"/> Puzzle/Riddle Frequency</Label>
                            <Select value={puzzleFrequency} onValueChange={(v) => setPuzzleFrequency(v as PuzzleFrequency)}>
                                <SelectTrigger id="puzzleFrequency"><SelectValue placeholder="Select puzzle frequency..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                       <div className="space-y-2">
                            <Label htmlFor="socialFocus" className="flex items-center gap-1"><UsersIcon className="w-4 h-4"/> Social Interaction Focus</Label>
                            <Select value={socialFocus} onValueChange={(v) => setSocialFocus(v as SocialFocus)}>
                                <SelectTrigger id="socialFocus"><SelectValue placeholder="Select social focus..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High (Many NPCs, Dialogue Choices)">High</SelectItem><SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low (More Exploration/Combat)">Low</SelectItem>
                                </SelectContent>
                            </Select>
                       </div>
                   </div>
               </div>
            </div>
          )}
          {adventureTypeFromContext === "Immersed" && (
            <div className="space-y-4 border-t border-foreground/10 pt-6 mt-0">
               <h3 className="text-xl font-semibold mb-4 border-b pb-2">Immersed Adventure Details</h3>
               <div className="space-y-2">
                   <Label htmlFor="universeName" className="flex items-center gap-1"><Sparkles className="w-4 h-4"/> Universe Name</Label>
                   <Input id="universeName" value={universeName} onChange={(e) => setUniverseName(e.target.value)} placeholder="e.g., Star Wars, Lord of the Rings, Hogwarts" className={customError && !universeName.trim() ? 'border-destructive' : ''}/>
                </div>
                
                <RadioGroup value={characterOriginType} onValueChange={(value) => {
                    setCharacterOriginType(value as 'existing' | 'original');
                    setPlayerCharacterConcept(""); 
                }} className="space-y-2">
                    <Label className="text-base font-medium">Character Origin:</Label>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="existing" id="origin-existing" />
                        <Label htmlFor="origin-existing" className="flex items-center gap-1 cursor-pointer"><UserCheck className="w-4 h-4"/> Play as Existing Character</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="original" id="origin-original" />
                        <Label htmlFor="origin-original" className="flex items-center gap-1 cursor-pointer"><UserPlus className="w-4 h-4"/> Create Original Character in Universe</Label>
                    </div>
                </RadioGroup>

               <div className="space-y-2">
                    <Label htmlFor="playerCharacterConcept" className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> 
                        {characterOriginType === 'existing' ? "Existing Character's Name" : "Your Original Character Concept/Role"}
                    </Label>
                   <Input 
                    id="playerCharacterConcept" 
                    value={playerCharacterConcept} 
                    onChange={(e) => setPlayerCharacterConcept(e.target.value)} 
                    placeholder={characterOriginType === 'existing' ? "e.g., Harry Potter, Luke Skywalker" : "e.g., A rebel pilot, a new student at Hogwarts"} 
                    className={customError && !playerCharacterConcept.trim() ? 'border-destructive' : ''}/>
                </div>
            </div>
          )}
          {adventureTypeFromContext === "Randomized" && (
             <div className="space-y-4 pt-2 text-center"> <p className="text-sm text-muted-foreground italic">A unique world, quests, and challenges will be generated based on your character.</p> </div>
          )}

           <div className="space-y-4 border-t border-foreground/10 pt-6">
                <Label htmlFor="difficulty-select" className="text-xl font-semibold flex items-center gap-2"><ShieldAlert className="w-5 h-5"/>Select Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
                    <SelectTrigger id="difficulty-select" className="w-full"><SelectValue placeholder="Select difficulty..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Easy">Easy - Fewer challenges, more forgiving.</SelectItem>
                        <SelectItem value="Normal">Normal - A balanced experience.</SelectItem>
                        <SelectItem value="Hard">Hard - Tougher encounters, requires strategy.</SelectItem>
                        <SelectItem value="Nightmare">Nightmare - Extreme challenge, for veterans.</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Difficulty affects challenge level, AI behavior, and potential events.</p>
            </div>

          <div className="space-y-4 border-t border-foreground/10 pt-6">
            <Label className="text-xl font-semibold flex items-center gap-2"><Skull className="w-5 h-5"/>Choose Challenge Mode</Label>
            <div className="flex items-center justify-between space-x-2 p-4 border-2 rounded-md bg-card/50">
              <div className="flex flex-col">
                 <Label htmlFor="permanent-death" className="font-medium flex items-center gap-1 cursor-pointer"> {permanentDeath ? <Skull className="w-4 h-4 text-destructive"/> : <Heart className="w-4 h-4 text-green-600"/>} {permanentDeath ? "Permanent Death" : "Respawn Enabled"} </Label>
                 <p className="text-sm text-muted-foreground pr-2"> {permanentDeath ? "Your adventure ends permanently if you die." : "You can respawn at a checkpoint before death."} </p>
              </div>
              <Switch id="permanent-death" checked={permanentDeath} onCheckedChange={setPermanentDeath} aria-label={`Toggle ${permanentDeath ? 'Permanent Death off' : 'Permanent Death on'}`}/>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
           <Button variant="outline" onClick={handleBack} disabled={isLoadingImmersedCharacter}> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Menu </Button>
           <Button onClick={handleStartAdventure} disabled={isProceedDisabled} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"> 
            {isLoadingImmersedCharacter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingImmersedCharacter ? "Preparing Character..." : proceedButtonText}
           </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}

