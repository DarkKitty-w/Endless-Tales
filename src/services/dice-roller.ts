/**
 * @fileOverview Service for simulating dice rolls.
 *
 * - rollD6 - Rolls a six-sided die (d6).
 * - rollD10 - Rolls a ten-sided die (d10).
 * - rollD20 - Rolls a twenty-sided die (d20).
 * - rollD100 - Rolls a hundred-sided die (d100).
 */
'use server';

/**
 * Rolls a die with the specified number of sides.
 *
 * @param sides The number of sides on the die.
 * @returns A promise resolving to a random integer between 1 and sides.
 */
async function rollDie(sides: number): Promise<number> {
  if (sides < 1) {
    throw new Error("Number of sides must be at least 1.");
  }
  // Simulate network latency or complex calculation if desired
  // await new Promise(resolve => setTimeout(resolve, 50));

  const result = Math.floor(Math.random() * sides) + 1;
  console.log(`Dice Service: Rolled a d${sides}: ${result}`);
  return result;
}

/**
 * Rolls a six-sided die (d6). Suitable for simple checks.
 *
 * @returns A promise resolving to a random integer between 1 and 6.
 */
export async function rollD6(): Promise<number> {
    return rollDie(6);
}

/**
 * Rolls a ten-sided die (d10). Suitable for standard actions.
 *
 * @returns A promise resolving to a random integer between 1 and 10.
 */
export async function rollD10(): Promise<number> {
  return rollDie(10);
}

/**
 * Rolls a twenty-sided die (d20). Suitable for important checks.
 *
 * @returns A promise resolving to a random integer between 1 and 20.
 */
export async function rollD20(): Promise<number> {
    return rollDie(20);
}


/**
 * Rolls a hundred-sided die (d100). Suitable for very difficult or complex actions.
 *
 * @returns A promise resolving to a random integer between 1 and 100.
 */
export async function rollD100(): Promise<number> {
  return rollDie(100);
}
