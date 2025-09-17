'use server';

import { extractClauses } from '@/ai/flows/extract-clauses';
import { MOCK_BILL_TEXT } from '@/lib/mock-data';
import type { ProcessedBill } from '@/lib/types';
import { z } from 'zod';

const ProcessBillInput = z.object({
  fileName: z.string(),
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function processBill(
  input: z.infer<typeof ProcessBillInput>
): Promise<{ bill: ProcessedBill | null; error: string | null }> {
  const validatedInput = ProcessBillInput.safeParse(input);
  if (!validatedInput.success) {
    return { bill: null, error: 'Invalid input.' };
  }
  
  const { fileName } = validatedInput.data;

  // In a real application, you would handle file upload here,
  // extract text from PDF/Word, and use that text.
  // For this demo, we're using mock data.
  const billText = MOCK_BILL_TEXT;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const clausesResult = await extractClauses({ billText: billText });

      if (!clausesResult?.clauses) {
        throw new Error('AI processing failed to return expected results.');
      }

      const processedBill: ProcessedBill = {
        id: new Date().toISOString(),
        fileName: fileName,
        originalText: billText,
        clauses: clausesResult.clauses,
      };

      return { bill: processedBill, error: null };
    } catch (error: any) {
      console.error(`Error processing bill (attempt ${attempt}):`, error);
      
      const isServiceUnavailable = error.status === 503 || (error.message && error.message.includes('503'));

      if (isServiceUnavailable && attempt < maxRetries) {
        await sleep(1000 * attempt); // Wait longer between retries
        continue;
      }
      
      if (isServiceUnavailable) {
        return {
          bill: null,
          error: 'The AI service is temporarily unavailable due to high demand. Please try again in a few moments.',
        };
      }

      return {
        bill: null,
        error: 'An unexpected error occurred while processing the bill. Please try again.',
      };
    }
  }

  // This part should be unreachable if the loop is structured correctly,
  // but it's good practice for ensuring a value is always returned.
  return {
    bill: null,
    error: 'Failed to process the bill after multiple attempts. Please try again later.',
  };
}
