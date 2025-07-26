'use server';

/**
 * @fileOverview Generates a strong password suggestion for the user.
 *
 * - suggestStrongPassword - A function that generates a strong password.
 * - SuggestStrongPasswordInput - The input type for the suggestStrongPassword function (empty object).
 * - SuggestStrongPasswordOutput - The return type for the suggestStrongPassword function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStrongPasswordInputSchema = z.object({});
export type SuggestStrongPasswordInput = z.infer<typeof SuggestStrongPasswordInputSchema>;

const SuggestStrongPasswordOutputSchema = z.object({
  password: z.string().describe('A strong, randomly generated password.'),
});
export type SuggestStrongPasswordOutput = z.infer<typeof SuggestStrongPasswordOutputSchema>;

export async function suggestStrongPassword(
  input: SuggestStrongPasswordInput
): Promise<SuggestStrongPasswordOutput> {
  return suggestStrongPasswordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStrongPasswordPrompt',
  input: {schema: SuggestStrongPasswordInputSchema},
  output: {schema: SuggestStrongPasswordOutputSchema},
  prompt: `You are a password generator. Generate a strong password that is at least 12 characters long and includes a mix of uppercase letters, lowercase letters, numbers, and symbols. Do not include any easily guessable patterns or common words in your generated password. Return the password in the following JSON format: {\"password\": \"the_generated_password\"}`,
});

const suggestStrongPasswordFlow = ai.defineFlow(
  {
    name: 'suggestStrongPasswordFlow',
    inputSchema: SuggestStrongPasswordInputSchema,
    outputSchema: SuggestStrongPasswordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
