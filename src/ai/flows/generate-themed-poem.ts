'use server';

/**
 * @fileOverview A poem generation AI agent that styles poems in the spirit of 'Dead Poets Society'.
 *
 * - generateThemedPoem - A function that handles the poem generation process.
 * - GenerateThemedPoemInput - The input type for the generateThemedPoem function.
 * - GenerateThemedPoemOutput - The return type for the generateThemedPoem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThemedPoemInputSchema = z.object({
  prompt: z.string().describe('The prompt for the poem generation.'),
  theme: z
    .enum(['Romantic', 'Naturalistic', 'Classic'])
    .default('Romantic')
    .describe('The aesthetic theme for the poem.'),
  photoDataUri: z.string().optional().describe(
    "A photo to inspire the poem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type GenerateThemedPoemInput = z.infer<typeof GenerateThemedPoemInputSchema>;

const GenerateThemedPoemOutputSchema = z.object({
  poem: z.string().describe('The generated poem.'),
});
export type GenerateThemedPoemOutput = z.infer<typeof GenerateThemedPoemOutputSchema>;

export async function generateThemedPoem(
  input: GenerateThemedPoemInput
): Promise<GenerateThemedPoemOutput> {
  return generateThemedPoemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThemedPoemPrompt',
  input: {schema: GenerateThemedPoemInputSchema},
  output: {schema: GenerateThemedPoemOutputSchema},
  prompt: `You are a poet in the style of the Dead Poets Society.
  Generate a poem based on the following prompt, styled with a {{{theme}}} aesthetic.
  Make the poem sound human-like and professional, improving grammar, vocabulary and stylistic choices.
  The poem must be formatted into stanzas. Separate each stanza with a double newline.
  
  {{#if photoDataUri}}
  Use the following image as inspiration for the poem.
  Image: {{media url=photoDataUri}}
  {{/if}}

  Prompt: {{{prompt}}}`,
});

const generateThemedPoemFlow = ai.defineFlow(
  {
    name: 'generateThemedPoemFlow',
    inputSchema: GenerateThemedPoemInputSchema,
    outputSchema: GenerateThemedPoemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
