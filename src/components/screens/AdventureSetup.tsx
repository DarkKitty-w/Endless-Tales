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
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings, Globe, ScrollText, ShieldAlert, Sparkles, AlertTriangle, BookOpen, Atom, Drama, Lightbulb as LightbulbIcon, Users as UsersIcon, Puzzle, Mic2, UserPlus, UserCheck, Loader2 } from "lucide-react"; // Added LightbulbIcon
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
import { suggestExistingCharacters } from "@/ai/flows/suggest-existing-characters"; 
import { suggestOriginalCharacterConcepts } from "@/ai/flows/suggest-original-character-concepts"; 
import type { Character, CharacterStats } from "@/types/character-types";
import { initialCharacterState, initialAdventureSettings as defaultInitialAdventureSettings } from "@/context/game-initial-state";
import { calculateMaxHealth, calculateMaxActionStamina, calculateMaxMana, getStarterSkillsForClass, calculateXpToNextLevel } from "@/lib/gameUtils";


export function AdventureSetup() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  
  const adventureTypeFromContext = state.adventureSettings.adventureType;

  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath ?? defaultInitialAdventureSettings.permanentDeath);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(state.adventureSettings.difficulty ?? defaultInitialAdventureSettings.difficulty);
  
  const [worldType, setWorldType] = useState<string>(state.adventureSettings.worldType ?? defaultInitialAdventureSettings.worldType ?? "");
  const [mainQuestline, setMainQuestline] = useState<string>(state.adventureSettings.mainQuestline ?? defaultInitialAdventureSettings.mainQuestline ?? "");
  const [genreTheme, setGenreTheme] = useState<GenreTheme>(state.adventureSettings.genreTheme ?? defaultInitialAdventureSettings.genreTheme ?? "");
  const [magicSystem, setMagicSystem] = useState<MagicSystem>(state.adventureSettings.magicSystem ?? defaultInitialAdventureSettings.magicSystem ?? "");
  const [techLevel, setTechLevel] = useState<TechLevel>(state.adventureSettings.techLevel ?? defaultInitialAdventureSettings.techLevel ?? "");
  const [dominantTone, setDominantTone] = useState<DominantTone>(state.adventureSettings.dominantTone ?? defaultInitialAdventureSettings.dominantTone ?? "");
  const [startingSituation, setStartingSituation] = useState<string>(state.adventureSettings.startingSituation ?? defaultInitialAdventureSettings.startingSituation ?? "");
  const [combatFrequency, setCombatFrequency] = useState<CombatFrequency>(state.adventureSettings.combatFrequency ?? "Medium");
  const [puzzleFrequency, setPuzzleFrequency] = useState<PuzzleFrequency>(state.adventureSettings.puzzleFrequency ?? "Medium");
  const [socialFocus, setSocialFocus] = useState<SocialFocus>(state.adventureSettings.socialFocus ?? "Medium");
  
  const [universeName, setUniverseName] = useState<string>(state.adventureSettings.universeName ?? defaultInitialAdventureSettings.universeName ?? "");
  const [playerCharacterConcept, setPlayerCharacterConcept] = useState<string>(state.adventureSettings.playerCharacterConcept ?? defaultInitialAdventureSettings.playerCharacterConcept ?? "");
  const [characterOriginType, setCharacterOriginType] = useState<'existing' | 'original'>(
    state.adventureSettings.adventureType === "Immersed" 
      ? (state.adventureSettings.characterOriginType ?? 'original') 
      : 'original' 
  );
  
  const [customError, setCustomError] = useState<string | null>(null);
  const [isLoadingImmersedCharacter, setIsLoadingImmersedCharacter] = useState(false);
  const [isSuggestingNameLoading, setIsSuggestingNameLoading] = useState(false); 

  useEffect(() => {
    console.log("AdventureSetup: Context adventureSettings changed or component mounted. adventureTypeFromContext:", adventureTypeFromContext);
    console.log("AdventureSetup: state.adventureSettings from context:", JSON.stringify(state.adventureSettings));

    setPermanentDeath(state.adventureSettings.permanentDeath ?? defaultInitialAdventureSettings.permanentDeath);
    setDifficulty(state.adventureSettings.difficulty ?? defaultInitialAdventureSettings.difficulty);

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
    setCustomError(null); 
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
            setCustomError("Original Character Concept/Role is required."); return false;
        }
     }
     setCustomError(null);
     return true;
  };

  const handleSuggestName = async () => {
    if (!universeName.trim()) {
      toast({ title: "Universe Name Required", description: "Please enter a universe name to get suggestions.", variant: "destructive" });
      return;
    }
    setIsSuggestingNameLoading(true);
    setCustomError(null);
    try {
      let suggestions: string[] = [];
      if (characterOriginType === 'existing') {
        const result = await suggestExistingCharacters({ universeName });
        suggestions = result.suggestedNames || [];
      } else { // 'original'
        const result = await suggestOriginalCharacterConcepts({ universeName });
        suggestions = result.suggestedConcepts || [];
      }

      if (suggestions.length > 0) {
        let newSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        // If there's more than one suggestion and the new one is the same as current, try to pick another
        if (suggestions.length > 1 && newSuggestion === playerCharacterConcept) {
          const otherSuggestions = suggestions.filter(s => s !== playerCharacterConcept);
          if (otherSuggestions.length > 0) {
            newSuggestion = otherSuggestions[Math.floor(Math.random() * otherSuggestions.length)];
          }
        }
        setPlayerCharacterConcept(newSuggestion);
        toast({ title: "Suggestion Applied!", description: `Suggested: ${newSuggestion}` });
      } else {
        toast({ title: "No Suggestions", description: "Could not find suggestions for this universe.", variant: "default" });
      }

    } catch (err) {
      console.error("AdventureSetup: Failed to get name/concept suggestion:", err);
      toast({ title: "Suggestion Error", description: "Could not fetch suggestions at this time.", variant: "destructive" });
    } finally {
      setIsSuggestingNameLoading(false);
    }
  };


  const handleStartAdventure = async () => {
    setCustomError(null);

    if (!adventureTypeFromContext) {
        toast({ title: "Adventure Type Missing", description: "Please return to main menu and select an adventure type.", variant: "destructive" });
        dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" });
        return;
    }

    if (!validateSettings()) {
        toast({ title: "Settings Incomplete", description: customError || `Please fill all required details for ${adventureTypeFromContext} adventure.`, variant: "destructive" });
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
      combatFrequency: adventureTypeFromContext === "Custom" ? combatFrequency : undefined,
      puzzleFrequency: adventureTypeFromContext === "Custom" ? puzzleFrequency : undefined,
      socialFocus: adventureTypeFromContext === "Custom" ? socialFocus : undefined,
      universeName: adventureTypeFromContext === "Immersed" ? universeName : undefined,
      playerCharacterConcept: adventureTypeFromContext === "Immersed" ? playerCharacterConcept : undefined,
      characterOriginType: adventureTypeFromContext === "Immersed" ? characterOriginType : undefined,
    };
    
    console.log("AdventureSetup: Dispatching SET_ADVENTURE_SETTINGS with payload:", JSON.stringify(settingsPayload));
    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: settingsPayload });
    

    // This is the core logic fix for the loop issue.
    // Check if character already exists from a previous step (like in Randomized flow).
    if (state.character) {
      dispatch({ type: "START_GAMEPLAY" });
      toast({ title: "Adventure Starting!", description: "The world awaits..." });
      return;
    }

    // Logic for Immersed (Existing) remains the same
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
            const randomStr = Math.floor(Math.random() * 5) + 3; 
            const randomSta = Math.floor(Math.random() * 5) + 3; 
            const randomWis = 15 - randomStr - randomSta;       
            
            const finalStats: CharacterStats = { 
                ...baseStats, 
                strength: randomStr,
                stamina: randomSta,
                wisdom: Math.max(1, randomWis), 
            }; 

            const newCharacter: Character = {
                ...initialCharacterState, 
                name: playerCharacterConcept, 
                description: aiProfile.detailedDescription || `Playing as ${playerCharacterConcept} from the universe of ${universeName}.`,
                class: aiProfile.inferredClass || "Immersed Protagonist", 
                traits: aiProfile.inferredTraits || [],
                knowledge: aiProfile.inferredKnowledge || [],
                background: aiProfile.inferredBackground || `A character from the universe of ${universeName}.`,
                stats: finalStats,
                aiGeneratedDescription: aiProfile.detailedDescription, 
                maxHealth: calculateMaxHealth(finalStats),
                currentHealth: calculateMaxHealth(finalStats),
                maxStamina: calculateMaxActionStamina(finalStats),
                currentStamina: calculateMaxActionStamina(finalStats),
                maxMana: calculateMaxMana(finalStats, aiProfile.inferredKnowledge || []),
                currentMana: calculateMaxMana(finalStats, aiProfile.inferredKnowledge || []),
                learnedSkills: getStarterSkillsForClass(aiProfile.inferredClass || "Immersed Protagonist"),
                xpToNextLevel: calculateXpToNextLevel(1),
                skillTree: null, 
                skillTreeStage: 0,
            };
            
            console.log("AdventureSetup: Dispatching SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY for existing character.");
            dispatch({ type: "SET_IMMERSED_CHARACTER_AND_START_GAMEPLAY", payload: { character: newCharacter, adventureSettings: settingsPayload } });
            toast({ title: "Adventure Starting!", description: `Stepping into the shoes of ${playerCharacterConcept} in the universe of ${universeName}!` });

        } catch (err) {
            console.error("AdventureSetup: Failed to generate immersed character profile:", err);
            toast({ title: "Character Profile Error", description: "Could not retrieve character details. Please try again or define an original character.", variant: "destructive" });
        } finally {
            setIsLoadingImmersedCharacter(false);
        }
    } else { 
      // If no character exists yet (for Custom or Immersed-Original flow), proceed to character creation.
      dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
      toast({ title: "Adventure Setup Complete!", description: "Now, create your adventurer." });
    }
  };

   const handleBack = () => {
    dispatch({ type: "RESET_GAME" }); 
  };


  if (!adventureTypeFromContext) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
             <CardboardCard className="w-full max-w-md text-center">
                <CardHeader> <CardTitle className="text-2xl flex items-center justify-center gap-2"><AlertTriangle className="w-6 h-6 text-destructive"/> Error</CardTitle> </CardHeader>
                <CardContent> <p className="text-muted-foreground">Adventure type not selected. Please return to the main menu and choose an adventure type.</p> </CardContent>
                <CardFooter> <Button onClick={handleBack} className="w-full"> Back to Main Menu </Button> </CardFooter>
             </CardboardCard>
        </div>
    );
  }

  const getAdventureTypeIcon = () => {
    switch(adventureTypeFromContext) {
        case "Randomized": return <Dices className="w-5 h-5 text-green-500"/>;
        case "Custom": return <Swords className="w-5 h-5 text-blue-500"/>;
        case "Immersed": return <Sparkles className="w-5 h-5 text-purple-500"/>;
        default: return <Settings className="w-5 h-5"/>;
    }
  }

  // Determine button text based on whether a character already exists
  const proceedButtonText = state.character ? "Start Adventure" : "Proceed to Character Creation";
                            
  const isProceedDisabled = isLoadingImmersedCharacter || isSuggestingNameLoading ||
                            (adventureTypeFromContext === 'Custom' && (!worldType.trim() || !mainQuestline.trim() || !genreTheme || !magicSystem || !techLevel || !dominantTone || !startingSituation.trim() )) ||
                            (adventureTypeFromContext === 'Immersed' && (!universeName.trim() || !playerCharacterConcept.trim()));


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2"> <Settings className="w-7 h-7"/> Adventure Setup </CardTitle>
           <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-1"> 
             Selected Type: {getAdventureTypeIcon()} <span className="font-medium">{adventureTypeFromContext}</span> 
           </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {customError && ( <Alert variant="destructive"> <AlertDescription>{customError}</AlertDescription> </Alert> )}

          {adventureTypeFromContext === "Randomized" && (
             <div className="space-y-4 pt-2 text-center"> <p className="text-sm text-muted-foreground italic">A unique world, quests, and challenges will be generated based on your character.</p> </div>
          )}

          {adventureTypeFromContext === "Custom" && (
            <div className="space-y-4 border-t border-foreground/10 pt-6 mt-0">
               <h3 className="text-xl font-semibold mb-4 border-b pb-2">Customize Your Adventure</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectTrigger id="genreTheme" className={customError && !genreTheme ? 'border-destructive' : ''}><SelectValue placeholder="Select genre..." /></SelectTrigger>
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
                                <SelectTrigger id="magicSystem" className={customError && !magicSystem ? 'border-destructive' : ''}><SelectValue placeholder="Select magic system..." /></SelectTrigger>
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
                   <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="techLevel" className="flex items-center gap-1"><Atom className="w-4 h-4"/> Technological Level</Label>
                            <Select value={techLevel} onValueChange={(v) => setTechLevel(v as TechLevel)}>
                                <SelectTrigger id="techLevel" className={customError && !techLevel ? 'border-destructive' : ''}><SelectValue placeholder="Select tech level..." /></SelectTrigger>
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
                                <SelectTrigger id="dominantTone" className={customError && !dominantTone ? 'border-destructive' : ''}><SelectValue placeholder="Select tone..." /></SelectTrigger>
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
                                    <SelectItem value="High (Many NPCs, Dialogue Choices)">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low (More Exploration/Combat)">Low</SelectItem>
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
                        <Label htmlFor="origin-original" className="flex items-center gap-1 cursor-pointer"><UserPlus className="w-4 h-4"/> Create Original Character</Label>
                    </div>
                </RadioGroup>

               <div className="space-y-1">
                    <Label htmlFor="playerCharacterConcept" className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> 
                        {characterOriginType === 'existing' ? "Existing Character's Name" : "Your Original Character Concept/Role"}
                    </Label>
                    <div className="flex items-center gap-2">
                       <Input 
                        id="playerCharacterConcept" 
                        value={playerCharacterConcept} 
                        onChange={(e) => setPlayerCharacterConcept(e.target.value)} 
                        placeholder={characterOriginType === 'existing' ? "e.g., Harry Potter, Luke Skywalker" : "e.g., A rebel pilot, a new student at Hogwarts"} 
                        className={`flex-grow ${customError && !playerCharacterConcept.trim() ? 'border-destructive' : ''}`}/>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleSuggestName}
                          disabled={isSuggestingNameLoading || !universeName.trim()}
                          aria-label="Suggest Character Name/Concept"
                        >
                          {isSuggestingNameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LightbulbIcon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
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
           <Button variant="outline" onClick={handleBack} disabled={isLoadingImmersedCharacter || isSuggestingNameLoading}> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Menu </Button>
           <Button onClick={handleStartAdventure} disabled={isProceedDisabled} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"> 
            {(isLoadingImmersedCharacter || isSuggestingNameLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoadingImmersedCharacter ? "Preparing Character..." : (isSuggestingNameLoading ? "Suggesting..." : proceedButtonText)}
           </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
