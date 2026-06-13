import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineSecret } from 'firebase-functions/params';

/**
 * Define Gemini configuration parameters using Firebase Functions v2 params API.
 * These can be set via environment variables (.env for local, Cloud Console for production)
 * or Cloud Secret Manager for sensitive values.
 */
export const geminiApiKey = defineSecret('GEMINI_API_KEY');

/**
 * Get the Gemini API key from environment variables.
 * For local development: Uses GEMINI_API_KEY from .env file
 * For production: Uses GEMINI_API_KEY from Cloud Secret Manager or environment variables
 */
const getGeminiApiKey = (): string => {
  const key = geminiApiKey.value();

  if (!key) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.');
  }

  // Trim any whitespace, newlines, or carriage returns that might be in the secret
  return key.trim();
};

/**
 * Lazy-initialized Google Generative AI client instance.
 * This is initialized on first use to avoid errors during deployment analysis.
 */
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Get the Google Generative AI client instance, initializing it if necessary.
 * Uses lazy initialization to avoid errors during deployment analysis.
 */
export const getGemini = (): GoogleGenerativeAI => {
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(getGeminiApiKey());
  }
  return geminiClient;
};

/**
 * Get a Gemini model instance for generating content.
 * Default model: gemini-2.5-flash (Latest Gemini Flash - fast and cost-effective)
 */
export const getGeminiModel = (modelName = 'gemini-2.5-flash') => {
  const client = getGemini();
  return client.getGenerativeModel({ model: modelName });
};
