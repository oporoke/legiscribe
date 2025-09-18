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
  summary: z.string().describe('The summarized text of the legislative bill, approximately 5-10% of the original length.'),
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

Your task is to create a concise executive summary of the provided bill text. The summary should be approximately 5-10% of the length of the original document.

The summary should include:
1.  **Overview**: A 2-3 sentence statement of the bill's main objective and scope.
2.  **Key Changes**: Note any major changes from previous legislation, if apparent.
3.  **Part-by-Part Summary**: Briefly summarize the key provisions of each major part or section of the bill.

It is absolutely critical that you preserve the original legal meaning and intent.
You must also maintain all original formatting, including headings, sections, and numbering, to ensure the summary's structure reflects the original document.

Bill Text:
{{{billText}}}`,
});

const summarizeBillFlow = ai.defineFlow(
  {
    name: 'summarizeBillFlow',
    inputSchema: SummarizeBillInputSchema,
    outputSchema: SummarizeBillOutputSchema,
  },
  async input => {
    const {output} = await summarizeBillPrompt(input);
    if (!output) {
      console.error('Summarization failed to produce an output.');
      return { summary: '' };
    }
    return output;
  }
);
