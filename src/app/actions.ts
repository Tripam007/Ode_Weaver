'use server';

import { z } from 'zod';
import { generateThemedPoem, GenerateThemedPoemInput } from '@/ai/flows/generate-themed-poem';
import { refinePoemForProfessionalism } from '@/ai/flows/refine-poem-for-professionalism';

const poemFormSchema = z.object({
  prompt: z.string(),
  theme: z.enum(['Romantic', 'Naturalistic', 'Classic']),
  photoDataUri: z.string().optional(),
});

export async function generatePoemAction(formData: FormData) {
  const validatedFields = poemFormSchema.safeParse({
    prompt: formData.get('prompt'),
    theme: formData.get('theme'),
    photoDataUri: formData.get('photoDataUri'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Please check your prompt and theme.',
    };
  }

  try {
    const result = await generateThemedPoem(validatedFields.data as GenerateThemedPoemInput);
    return { poem: result.poem };
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to generate poem. Our muse seems to be on a break. Please try again later.',
    };
  }
}

export async function refinePoemAction(poem: string) {
  if (!poem) {
    return { error: 'Cannot refine an empty poem.' };
  }
  
  try {
    const result = await refinePoemForProfessionalism({ poem });
    return { refinedPoem: result.refinedPoem };
  } catch (e) {
    console.error(e);
    return {
      error: 'Failed to refine the poem. Even the best poets need a rest. Please try again later.',
    };
  }
}
