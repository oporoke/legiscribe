'use server';

import { extractClauses } from '@/ai/flows/extract-clauses';
import { summarizeBill } from '@/ai/flows/summarize-bill';
import type { ProcessedBill } from '@/lib/types';
import { z } from 'zod';
import { handleFileUpload } from './actions/handle-file-upload';


const ProcessBillInput = z.object({
  fileName: z.string(),
  fileContent: z.string(), // base64 encoded
  fileType: z.string(),
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
  
  const { fileName, fileContent, fileType } = validatedInput.data;
  
  let billText: string;
  try {
    billText = await handleFileUpload({
      fileName,
      fileContent,
      fileType,
    });
  } catch (error) {
    return { bill: null, error: error instanceof Error ? error.message : 'Failed to read file.' };
  }


  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const [clausesResult, summaryResult] = await Promise.all([
        extractClauses({ billText: billText }),
        summarizeBill({ billText: billText })
      ]);

      if (!clausesResult?.clauses || !summaryResult?.summary) {
        throw new Error('AI processing failed to return expected results.');
      }

      const processedBill: ProcessedBill = {
        id: new Date().toISOString(),
        fileName: fileName,
        originalText: billText,
        clauses: clausesResult.clauses,
        summary: summaryResult.summary,
      };

      return { bill: processedBill, error: null };
    } catch (error: any) {
      console.error(`Error processing bill (attempt ${attempt}):`, error);
      
      const isServiceUnavailable = error.status === 503 || (error.message && error.message.includes('503'));
      const isRateLimited = error.status === 429;


      if ((isServiceUnavailable || isRateLimited) && attempt < maxRetries) {
        await sleep(1000 * attempt); // Wait longer between retries
        continue;
      }
      
      if (isServiceUnavailable) {
        return {
          bill: null,
          error: 'The AI service is temporarily unavailable due to high demand. Please try again in a few moments.',
        };
      }
      
      if (isRateLimited) {
        return {
          bill: null,
          error: 'You have exceeded the free usage quota for the AI model. Please check your plan and billing details, or try again later.',
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
