'use server';

/**
 * @fileOverview Refines a generated poem for improved grammar, vocabulary, and stylistic choices.
 *
 * - refinePoemForProfessionalism - A function that refines the poem using AI.
 * - RefinePoemInput - The input type for the refinePoemForProfessionalism function.
 * - RefinePoemOutput - The return type for the refinePoemForProfessionalism function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefinePoemInputSchema = z.object({
  poem: z.string().describe('The poem to refine.'),
});
export type RefinePoemInput = z.infer<typeof RefinePoemInputSchema>;

const RefinePoemOutputSchema = z.object({
  refinedPoem: z.string().describe('The refined poem with improved grammar, vocabulary, and style.'),
});
export type RefinePoemOutput = z.infer<typeof RefinePoemOutputSchema>;

export async function refinePoemForProfessionalism(input: RefinePoemInput): Promise<RefinePoemOutput> {
  return refinePoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refinePoemPrompt',
  input: {schema: RefinePoemInputSchema},
  output: {schema: RefinePoemOutputSchema},
  prompt: `You are a professional poet and editor. Your task is to refine the given poem for improved grammar, vocabulary, and stylistic choices, making it sound professionally written and polished.
The refined poem must maintain its stanza structure. Separate each stanza with a double newline.

Original Poem: {{{poem}}}

Refined Poem:`, // Ensure the output is the refined poem only
});

const refinePoemFlow = ai.defineFlow(
  {
    name: 'refinePoemFlow',
    inputSchema: RefinePoemInputSchema,
    outputSchema: RefinePoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      refinedPoem: output!.refinedPoem,
    };
  }
);
