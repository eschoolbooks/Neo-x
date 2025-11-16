
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Initialize the googleAI plugin without a hardcoded API key.
// The key will be passed dynamically at runtime in each flow.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});
