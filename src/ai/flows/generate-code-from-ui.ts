// The file should contain a Genkit flow that takes a JSON representation of a UI design and generates React code.
'use server';
/**
 * @fileOverview A flow to generate React code from a UI design represented as a JSON object.
 *
 * - generateCode - A function that handles the code generation process.
 * - GenerateCodeInput - The input type for the generateCode function, which is a JSON string representing the UI design.
 * - GenerateCodeOutput - The return type for the generateCode function, which is the generated React code.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  uiDesignJson: z
    .string()
    .describe(
      'A JSON string representing the UI design.  The JSON should contain the structure of the UI, including components and their properties.'
    ),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  reactCode: z
    .string()
    .describe('The generated React code based on the provided UI design.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are a React code generator.  You take a JSON representation of a UI design and generate React code.

Here is the UI design in JSON format:
{{{uiDesignJson}}}

Generate React code that implements the UI design. The code should be well-formatted and easy to read. Use Material UI components where appropriate.
Ensure that the generated code is complete and includes all necessary imports.
`,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
