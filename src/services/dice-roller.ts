/**
 * Rolls a six-sided die.
 *
 * @returns A random number between 1 and 6.
 */
export async function rollDice(): Promise<number> {
  // TODO: Implement this by calling an API.

  return Math.floor(Math.random() * 6) + 1;
}
