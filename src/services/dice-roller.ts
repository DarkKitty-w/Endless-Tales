/**
 * @fileOverview Service for simulating dice rolls.
 *
 * - rollDice - Rolls a standard six-sided die (d6).
 */
'use server'; // Mark as server-side code if needed, though simple random doesn't strictly require it.

/**
 * Rolls a six-sided die (d6).
 *
 * @returns A promise resolving to a random integer between 1 and 6.
 */
export async function rollDice(): Promise<number> {
  // Simulate network latency or complex calculation if desired
  // await new Promise(resolve => setTimeout(resolve, 50));

  const result = Math.floor(Math.random() * 6) + 1;
  console.log(`Dice Service: Rolled a ${result}`);
  return result;
}
