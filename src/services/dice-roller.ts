/**
 * @fileOverview Service for simulating dice rolls.
 *
 * - rollDice - Rolls a standard ten-sided die (d10).
 * - rollDifficultDice - Rolls a hundred-sided die (d100).
 */
'use server';

/**
 * Rolls a ten-sided die (d10). Suitable for standard actions.
 *
 * @returns A promise resolving to a random integer between 1 and 10.
 */
export async function rollDice(): Promise<number> {
  // Simulate network latency or complex calculation if desired
  // await new Promise(resolve => setTimeout(resolve, 50));

  const result = Math.floor(Math.random() * 10) + 1;
  console.log(`Dice Service: Rolled a d10: ${result}`);
  return result;
}


/**
 * Rolls a hundred-sided die (d100). Suitable for very difficult or complex actions.
 *
 * @returns A promise resolving to a random integer between 1 and 100.
 */
export async function rollDifficultDice(): Promise<number> {
  // Simulate network latency or complex calculation if desired
  // await new Promise(resolve => setTimeout(resolve, 50));

  const result = Math.floor(Math.random() * 100) + 1;
  console.log(`Dice Service: Rolled a d100: ${result}`);
  return result;
}
