'use server';

/**
 * @fileOverview Analyzes public sentiment regarding a legislative bill by simulating a web search.
 *
 * - analyzePublicSentiment - A function that provides an analysis of public sentiment.
 * - AnalyzePublicSentimentInput - The input type for the analyzePublicSentiment function.
 * - AnalyzePublicSentimentOutput - The return type for the analyzePublicSentiment function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Mock data for search results
const mockSearchResults = [
  {
    url: 'https://news.example.com/article-1',
    title: 'New Bill Sparks Widespread Debate on Economic Impact',
    snippet: 'Experts and citizens alike are weighing in on the potential financial consequences of the proposed legislation...',
    source: 'Example News',
  },
  {
    url: 'https://social.example.com/post-123',
    title: 'Public Outcry on Social Media Over Proposed Regulations',
    snippet: 'Hashtag #RegulationReform trends as users express strong opinions, with many citing concerns over personal freedoms.',
    source: 'SocialStream',
  },
  {
    url: 'https://industry-journal.example.com/analysis-1',
    title: 'Industry Leaders Cautiously Optimistic About New Bill',
    snippet: 'An analysis from the National Trade Association suggests the bill could open new markets, but not without regulatory hurdles.',
    source: 'Industry Journal',
  },
  {
    url: 'https://factcheck.example.com/bill-claims',
    title: 'Fact-Checking the Claims: What the New Bill Actually Does',
    snippet: 'We break down the key provisions of the bill to separate fact from fiction amidst a heated public debate.',
    source: 'FactCheck.org',
  },
];

const searchTheWeb = ai.defineTool(
  {
    name: 'searchTheWeb',
    description: 'Searches the web for articles and discussions related to a given query. Returns a list of search results.',
    inputSchema: z.object({
      query: z.string().describe('The search query, which should be a few keywords related to the bill\'s topic.'),
    }),
    outputSchema: z.array(z.object({
      url: z.string(),
      title: z.string(),
      snippet: z.string(),
      source: z.string(),
    })),
  },
  async ({ query }) => {
    console.log(`Simulating web search for: "${query}"`);
    // In a real application, this would call a real search API (e.g., Google Search, Bing, etc.)
    // For this example, we'll just return our mock data regardless of the query.
    return mockSearchResults;
  }
);

const AnalyzePublicSentimentInputSchema = z.object({
  billText: z.string().describe('The full text of the legislative bill.'),
});

export type AnalyzePublicSentimentInput = z.infer<typeof AnalyzePublicSentimentInputSchema>;

const ArgumentSchema = z.object({
  side: z.string().describe('The stance of the argument (e.g., "For", "Against", "Concern").'),
  summary: z.string().describe('A summary of the argument or viewpoint.'),
});

const AnalyzePublicSentimentOutputSchema = z.object({
  overallSentiment: z.enum(['Positive', 'Negative', 'Mixed', 'Neutral']).describe('The overall public sentiment towards the bill.'),
  sentimentSummary: z.string().describe('A summary of the public\'s general feeling and the key reasons behind it.'),
  keyArguments: z.array(ArgumentSchema).describe('An array of the most common arguments and viewpoints from the public debate.'),
  keyTopics: z.array(z.string()).describe('A list of the key topics or keywords from the bill that are being discussed publicly.'),
});

export type AnalyzePublicSentimentOutput = z.infer<typeof AnalyzePublicSentimentOutputSchema>;

export async function analyzePublicSentiment(input: AnalyzePublicSentimentInput): Promise<AnalyzePublicSentimentOutput> {
  return analyzePublicSentimentFlow(input);
}

const analyzePublicSentimentPrompt = ai.definePrompt({
  name: 'analyzePublicSentimentPrompt',
  input: { schema: AnalyzePublicSentimentInputSchema },
  output: { schema: AnalyzePublicSentimentOutputSchema },
  tools: [searchTheWeb],
  prompt: `You are an expert public sentiment and media analyst. Your task is to analyze the provided legislative bill and determine the public's reaction to it.

1.  **Identify Key Topics**: First, read the bill and identify 2-3 key topics or phrases that would be the subject of public discussion (e.g., "digital privacy rights," "carbon tax," "small business grants").
2.  **Search for Information**: Use the 'searchTheWeb' tool for each of these key topics to find relevant news articles, social media posts, and public discussions.
3.  **Synthesize Findings**: Based on the search results, synthesize the information into a comprehensive report.
    - Determine the **Overall Sentiment** (Positive, Negative, Mixed, or Neutral).
    - Write a **Sentiment Summary** explaining the general public mood and the main reasons for it.
    - Extract and list the most prominent **Key Arguments**, categorizing them by their stance (e.g., For, Against, Concern).
    - List the **Key Topics** you used for your search.

Your analysis must be neutral and based solely on the information gathered by the tool.

Bill Text:
"{{{billText}}}"
`,
});

const analyzePublicSentimentFlow = ai.defineFlow(
  {
    name: 'analyzePublicSentimentFlow',
    inputSchema: AnalyzePublicSentimentInputSchema,
    outputSchema: AnalyzePublicSentimentOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePublicSentimentPrompt(input);
    if (!output) {
      console.error('Public sentiment analysis failed to produce an output.');
      return {
        overallSentiment: 'Neutral',
        sentimentSummary: 'Could not determine public sentiment.',
        keyArguments: [],
        keyTopics: [],
      };
    }
    return output;
  }
);
