'use server';

/**
 * @fileOverview Summarizes a legislative bill while preserving legal meaning, intent, and formatting.
 *
 * - summarizeBill - A function that summarizes the bill.
 * - SummarizeBillInput - The input type for the summarizeBill function.
 * - SummarizeBillOutput - The return type for the summarizeBill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeBillInputSchema = z.object({
  billText: z.string().describe('The text content of the legislative bill.'),
});

export type SummarizeBillInput = z.infer<typeof SummarizeBillInputSchema>;

const SummarizeBillOutputSchema = z.object({
  summarizedBill: z.string().describe('The summarized text of the legislative bill.'),
});

export type SummarizeBillOutput = z.infer<typeof SummarizeBillOutputSchema>;

export async function summarizeBill(input: SummarizeBillInput): Promise<SummarizeBillOutput> {
  return summarizeBillFlow(input);
}

const summarizeBillPrompt = ai.definePrompt({
  name: 'summarizeBillPrompt',
  input: {schema: SummarizeBillInputSchema},
  output: {schema: SummarizeBillOutputSchema},
  prompt: `You are an expert legal professional tasked with summarizing legislative bills.

  Summarize the following bill text to be approximately 5-7% shorter than the original.
  Preserve the original legal meaning and intent.
  Maintain all original formatting, including headings, sections, and numbering.

  Bill Text:
  {{billText}}`,
});

const summarizeBillFlow = ai.defineFlow(
  {
    name: 'summarizeBillFlow',
    inputSchema: SummarizeBillInputSchema,
    outputSchema: SummarizeBillOutputSchema,
  },
  async input => {
    const {output} = await summarizeBillPrompt(input);
    return output!;
  }
);
