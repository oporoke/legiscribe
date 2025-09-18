'use server';

/**
 * @fileOverview Extracts and structures individual clauses from a legislative bill.
 *
 * - extractClauses - A function that handles the clause extraction process.
 * - ExtractClausesInput - The input type for the extractClauses function.
 * - ExtractClausesOutput - The return type for the extractClauses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractClausesInputSchema = z.object({
  billText: z.string().describe('The text content of the legislative bill.'),
});

const ClauseSchema = z.object({
  clauseId: z.string().describe('A unique identifier for the clause, e.g., "clause-1".'),
  clauseNumber: z.number().describe('The sequential number of the clause.'),
  text: z.string().describe('The full text of the clause.'),
  summary: z.string().describe('A concise, one-sentence summary of the clause.'),
});

const ExtractClausesOutputSchema = z.object({
  clauses: z.array(ClauseSchema).describe('An array of extracted clauses from the bill.'),
});

export type ExtractClausesInput = z.infer<typeof ExtractClausesInputSchema>;
export type ExtractClausesOutput = z.infer<typeof ExtractClausesOutputSchema>;

export async function extractClauses(input: ExtractClausesInput): Promise<ExtractClausesOutput> {
  return extractClausesFlow(input);
}

const extractClausesPrompt = ai.definePrompt({
  name: 'extractClausesPrompt',
  input: { schema: ExtractClausesInputSchema },
  output: { schema: ExtractClausesOutputSchema },
  prompt: `You are an expert legal assistant specializing in parsing legislative documents.
Your task is to meticulously break down the provided bill text into its individual, distinct clauses, ensuring that each clause is kept together as a single unit.

- **CRITICAL RULE**: A clause and all of its subsections (e.g., (1), (a), (i), etc.) are a single unit. Do NOT split them into separate entries. Identify the start of a new clause (e.g., "Section. 1.", "Clause 2.", "Article. I.") and capture all text belonging to it until the next clause begins.
- Analyze the entire structure of the document to identify these distinct clauses.
- For each clause, you must also provide a concise, one-sentence summary of its main purpose or effect.
- Pay close attention to the document's structure (Parts, sections, sub-sections). Your extraction must preserve this hierarchy by keeping all parts of a clause together.
- Sequentially number each extracted clause, starting from 1.
- For each clause, create a unique ID in the format "clause-N", where N is its sequential number.
- The full, original text of each clause, including all its sub-parts, must be preserved without any modification.
- Return the result as a structured JSON object containing a list of these clause objects.

Bill Text:
{{{billText}}}`,
});

const extractClausesFlow = ai.defineFlow(
  {
    name: 'extractClausesFlow',
    inputSchema: ExtractClausesInputSchema,
    outputSchema: ExtractClausesOutputSchema,
  },
  async (input) => {
    const { output } = await extractClausesPrompt(input);
    if (!output) {
      console.error('Clause extraction failed to produce an output.');
      return { clauses: [] };
    }
    return output;
  }
);
