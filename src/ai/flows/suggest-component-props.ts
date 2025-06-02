'use server';

/**
 * @fileOverview Suggests appropriate props for a given React component.
 *
 * - suggestComponentProps - A function that suggests props for a component.
 * - SuggestComponentPropsInput - The input type for the suggestComponentProps function.
 * - SuggestComponentPropsOutput - The return type for the suggestComponentProps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComponentPropsInputSchema = z.object({
  componentName: z.string().describe('The name of the React component.'),
  existingProps: z.record(z.any()).optional().describe('The existing props of the component, if any.'),
});

export type SuggestComponentPropsInput = z.infer<typeof SuggestComponentPropsInputSchema>;

const SuggestComponentPropsOutputSchema = z.record(z.any()).describe('Suggested props for the component.');

export type SuggestComponentPropsOutput = z.infer<typeof SuggestComponentPropsOutputSchema>;

export async function suggestComponentProps(input: SuggestComponentPropsInput): Promise<SuggestComponentPropsOutput> {
  return suggestComponentPropsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComponentPropsPrompt',
  input: {schema: SuggestComponentPropsInputSchema},
  output: {schema: SuggestComponentPropsOutputSchema},
  prompt: `You are a React expert, skilled in suggesting appropriate props for React components.

  Based on the component name and any existing props, suggest additional props that would be useful.
  Return a JSON object with the prop names as keys and the suggested values as values.

  Component Name: {{{componentName}}}
  Existing Props: {{{existingProps}}}
  `,
});

const suggestComponentPropsFlow = ai.defineFlow(
  {
    name: 'suggestComponentPropsFlow',
    inputSchema: SuggestComponentPropsInputSchema,
    outputSchema: SuggestComponentPropsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
