# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Endless Tales: An AI-Driven Text Adventure

Welcome to Endless Tales, a text-based adventure game powered by AI where your choices shape the story.

### Features

1.  **Character Creation**:
    *   Players begin by creating their character through two methods:
        *   **Basic Creation**: Fill in fields for traits (e.g., Genius, Brave), knowledge (e.g., Magic, History), and background (e.g., Royalty, Soldier).
        *   **Text-Based Creation**: Write a short description to define the character's appearance, personality, and backstory.
    *   **Stat Distribution**: Allocate points to core stats like strength, stamina, and agility. Trade-offs are introduced—investing heavily in one area (e.g., strength) may reduce another (e.g., agility).
    *   **Randomized Options**: Players can choose to have their character randomized for a more unpredictable adventure.

2.  **Adventure Setup**:
    *   **Adventure Type Selection**: Players can choose between:
        *   **Randomized Adventure**: The game generates a unique world, quests, and challenges based on the character’s traits and stats.
        *   **Custom Adventure**: Players select specific parameters like world type, main questline, and difficulty (coming soon).
    *   **Permanent Death vs. Respawn**: Players can decide whether they want **permanent death** (game ends upon death) or the option to **respawn** at a checkpoint before death.

3.  **Storytelling and Choices**:
    *   **AI Narration**: The game’s AI dynamically narrates the story, reacting to player choices and driving the plot forward.
    *   **Choices and Commands**: Players can select preset actions or input their own commands. However, certain overpowered or out-of-context choices (e.g., "become the king of the world" or "control time") are blocked or met with narrative restrictions, encouraging logical, character-driven progression.
    *   **Skill-based Progression**: Powerful actions, like time manipulation or ruling realms, are unlocked only after significant progress in the game, such as completing quests, achieving specific milestones, or gaining experience.
    *   **Dice Mechanic**: The success of certain actions is determined by a dice roll mechanic (e.g., a 6-sided die), with higher numbers yielding more successful outcomes. This system adds an element of unpredictability and challenge to the game.
    *   **Consequences**: Every choice carries weight. Major decisions can affect the story’s progression, character relationships, and the player’s ultimate fate.

4.  **Adventure End and Story Saving**:
    *   **End of Adventure**: When the player’s journey ends (via death, success, or failure), the game automatically saves the story and presents a summary.
    *   **Simple or Detailed Story**: Players can view a high-level summary or a more detailed narrative breakdown, reflecting their actions, choices, and character development.
    *   **Automatic Saving**: The game saves each adventure’s outcome, allowing players to revisit their past journeys and explore different choices. (Note: Viewing saved stories is not implemented yet).

5.  **Replayability**:
    *   The game’s **randomization** and **multiple branching paths** ensure that each playthrough feels fresh and unique.
    *   Players can restart with new characters, decisions, and challenges, exploring the world from different perspectives and uncovering new possibilities each time.

### Visual Elements

-   **Cardboard-Style Templates**: The game utilizes minimalist, **cardboard-style visual templates** to represent the character and the world. These simple visuals highlight important details while maintaining a focus on storytelling.
-   **Character Display**: The character’s key stats, name, and essential details are displayed on-screen in a functional but minimalist template. The character’s growth and progress are reflected visually as they gain experience and new abilities.
-   **World Map**: The world map is displayed as a basic, interactive layout where players can explore new locations, encounter random events, and track the progress of their quests. It’s a visual guide to help players navigate their journey.
