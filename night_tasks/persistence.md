## Objective: Guarantee data integrity and saving
**Investigation:** Analyze how data (user progress, settings, game state) is currently serialized, saved, and loaded. Check for race conditions, corrupt data on reload, or missing save triggers.
**Action:** Strengthen the save/load cycle. Implement versioning or migration strategies for data schema changes. Ensure saving is automatic, non-blocking, and secure. Test that the app restores state perfectly after a reload.
