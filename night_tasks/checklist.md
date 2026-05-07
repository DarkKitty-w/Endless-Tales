## Checklist

### Bugs
- [ ] BUG-1: Unhandled AbortError from narrateAdventure leading to Unhandled Promise Rejection
- [ ] BUG-2: Crafted Item Added to Inventory Without Validating Material Availability
- [ ] BUG-3: Missing Error Handling for WebLLM Module Load Failures in Initial Setup
- [ ] BUG-4: Inconsistent Dice Roll Display for Failed Difficulty Assessments

### Polish & UX
- [ ] POLISH-1: Placeholder Icon for Wisdom Stat
- [ ] POLISH-2: AdventureSummary Save Button Commented Out (Save Feature Not Fully Exposed)
- [ ] POLISH-3: Missing ARIA Label on Trade Request Button (PartySidebar)
- [ ] POLISH-4: Missing ARIA Label on Chat Send Button
- [ ] POLISH-5: No API Key Input Fields for Cloud AI Providers in SettingsPanel
- [ ] POLISH-6: No Visual Loading State for Action Submission
- [ ] POLISH-7: Duplicate Player Stats Display in PartySidebar
- [ ] POLISH-8: SettingsPanel Provider Options Missing WebLLM During Availability Check
- [ ] POLISH-9: Quick Action Buttons Use Emojis Instead of Lucide Icons
- [ ] POLISH-10: No Keyboard Shortcut Indicator for Save Action

### Performance

### Security

### Code Quality
- [ ] CODE-1: God File - ai-router.ts (2072 lines)
- [ ] CODE-2: God File - Gameplay.tsx (1471 lines)
- [ ] CODE-3: Widespread `any` Type Usage
- [ ] CODE-4: Duplicate AI Flow Normalizer & Error Handling Logic
- [ ] CODE-5: God File - use-multiplayer.ts (853 lines)
- [ ] CODE-6: Repeated `catch (error: any)` Pattern
- [ ] CODE-7: Overly Complex narrate-adventure.ts Normalizer Function
- [ ] CODE-8: Untyped API Proxy Route Parameters
- [ ] CODE-9: Unused PropIcon in StatAllocationInput.tsx
- [ ] CODE-10: Inconsistent Error Boundary Coverage
- [ ] CODE-11: CharacterCreation.tsx Form Any Casts
- [ ] CODE-12: Missing Comments in Complex AI Logic

### Error Handling
- [ ] ERR-1: Unhandled Promise Rejections in Gameplay.tsx
- [ ] ERR-2: Missing Error Handling for WebLLM Load Failures
- [ ] ERR-3: Inconsistent Error Toast Messaging
- [ ] ERR-4: No Fallback for AI Response Parsing Failures
- [ ] ERR-5: Silent Failure for Invalid Inventory Actions
- [ ] ERR-6: Unhandled Errors in Multiplayer Signaling
- [ ] ERR-7: No User Feedback for Save/Load Failures
- [ ] ERR-8: Missing Error Boundaries for AI Components
- [ ] ERR-9: Ignored Errors in Cleanup Functions
- [ ] ERR-10: No Rate Limiting for AI API Calls

### Architecture
- [ ] ARCH-1: Tight Coupling Between Gameplay.tsx and AI Flows
- [ ] ARCH-2: No Clear State Management Layer Separation
- [ ] ARCH-3: Direct Reducer Imports in Components
- [ ] ARCH-4: Missing Abstraction for Multiplayer Communication
- [ ] ARCH-5: AI Router Lacks Provider Interface
- [ ] ARCH-6: No Separation of Concerns in Game Reducer
- [ ] ARCH-7: Settings State Not Persisted Correctly
- [ ] ARCH-8: No Clear API Layer for Server-Side Endpoints

### Persistence
- [ ] PERS-1: Stale State Persistence in GameContext
- [ ] PERS-2: No Migration System for Persisted State
- [ ] PERS-3: localStorage Quota Not Handled
- [ ] PERS-4: Save Data Not Validated on Load
- [ ] PERS-5: No Cloud Save Support
- [ ] PERS-6: Auto-Save Not Configurable
- [ ] PERS-7: Save Files Not Compressed

### Multiplayer
- [ ] MULT-1: No Host Migration on Host Disconnect
- [ ] MULT-2: No Cheat Prevention for Multiplayer Actions
- [ ] MULT-3: No Player Latency Indicators
- [ ] MULT-4: No Reconnection Logic for Disconnected Players
- [ ] MULT-5: No Multiplayer Session Persistence
- [ ] MULT-6: No Voice Chat or Text Chat Formatting
- [ ] MULT-7: No Player Avatar or Customization
- [ ] MULT-8: No Multiplayer Tutorial or Onboarding
- [ ] MULT-9: No Session Invite Link Generation

### AI Coherence
- [ ] AI-1: Inconsistent AI Prompt Context Management
- [ ] AI-2: No AI Response Caching
- [ ] AI-3: Inconsistent AI Fallback Responses
- [ ] AI-4: No AI Response Validation
- [ ] AI-5: No Context Window Management
- [ ] AI-6: Inconsistent AI Difficulty Scaling
- [ ] AI-7: No AI Persona Consistency
- [ ] AI-8: No AI Response Streaming for Long Narrations

### Observability
- [ ] OBS-1: Replace Remaining console.log Usage
- [ ] OBS-2: Clean Up Duplicate Error Logging
- [ ] OBS-3: Implement Basic Metrics Collection
- [ ] OBS-4: Add Structured Timing to AI API Calls
- [ ] OBS-5: Time Streaming Responses
- [ ] OBS-6: Add Request ID to All API Calls
- [ ] OBS-7: Propagate Trace ID Across Async Contexts
- [ ] OBS-8: Test and Enhance Sensitive Data Redaction
- [ ] OBS-9: Fix Silent Error Ignorance in Stream Parsing
- [ ] OBS-10: AI Proxy Duration Not Exposed as Metric
- [ ] OBS-11: No Retry Metrics
- [ ] OBS-12: Multiplayer Event Logging Without Aggregation
- [ ] OBS-13: Save/Load Operations Lack Performance Tracking
- [ ] OBS-14: Debug-Level Logs Disabled in Production
- [ ] OBS-15: LOG_LEVEL Environment Variable Not Documented
- [ ] OBS-16: No Health Check Endpoint
- [ ] OBS-17: No Error Tracking Service Integration
- [ ] OBS-18: WebLLM Load Success/Failure Not Metrics-Tracked
- [ ] OBS-19: Game Reducer Verbose Logging in Development
- [ ] OBS-20: No Alerting Mechanism

### Game Design
- [ ] GAME-1: No Clear Victory Condition or Narrative Completion
- [ ] GAME-2: Absence of Structured Story Arcs
- [ ] GAME-3: Heavy AI Dependency Creates Single Point of Failure
- [ ] GAME-4: Limited Player Agency in Narrative Direction
- [ ] GAME-5: Unclear Skill Progression Benefits
- [ ] GAME-6: Crafting System Lacks Discovery and Recipes
- [ ] GAME-7: Weak Feedback Systems for Player Actions
- [ ] GAME-8: Reputation and NPC Relationship Systems Are Underutilized
- [ ] GAME-9: World Map Lacks Gameplay Integration
- [ ] GAME-10: No Death Recovery Mechanism
- [ ] GAME-11: Limited Replayability Beyond AI Generation
- [ ] GAME-12: Inconsistent Feature Completeness
- [ ] GAME-13: No New Game Plus or Adventure Continuity
- [ ] GAME-14: Quick Actions Are Too Limited
- [ ] GAME-15: No Party-Based NPC Companions

### Feature Gaps
- [ ] F-001: KICK_PLAYER Action Missing UI Trigger
- [ ] F-002: PAUSE_GAME/RESUME_GAME Actions Missing UI
- [ ] F-003: Turn Order Customization UI Missing
- [ ] F-004: Adventure Summary Save Logic Incomplete
- [ ] R-001: Skill Tree Respec Lacks Confirmation Dialog
- [ ] R-002: World Map Undiscovered Locations Need Clearer Visual Cues
- [ ] R-003: Crafting Insufficient Materials Feedback Missing
- [ ] T-001: Leave Game/Disconnect Confirmation Missing
- [ ] T-002: Keyboard Shortcuts for Common Actions Missing
- [ ] T-003: Crafting Button Lacks Tooltip
- [ ] T-004: Empty State for Multiplayer Party List
- [ ] E-001: Client-Side Achievement System
- [ ] E-002: Auto-Journal for Story Events
- [ ] E-003: Ambient Sound Toggle
- [ ] E-004: Loot Drops from Location Exploration

