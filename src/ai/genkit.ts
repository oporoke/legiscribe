import {genkit} from 'genkit';
import openAI, { gpt4Turbo } from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    }),
  ],
  model: gpt4Turbo,
});
