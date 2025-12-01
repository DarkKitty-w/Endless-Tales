import { z } from 'zod';

export const SkillSchema = z.object({
    name: z.string().describe("The name of the skill."),
    description: z.string().describe("A brief description of what the skill does or represents."),
    type: z.enum(['Starter', 'Learned']).optional().describe("The skill type: 'Starter' or 'Learned'."),
    manaCost: z.number().optional().describe("Mana cost to use the skill, if any."), // Add costs
    staminaCost: z.number().optional().describe("Stamina cost to use the skill, if any."), // Add costs
});