import { Groq } from 'groq-sdk';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface GroqCompletionResult {
  text: string;
  confidence?: number;
  reasoning?: string;
}

export class GroqIntegration {
  private client: Groq | null = null;

  constructor() {
    if (ENV.GROQ_API_KEY && !ENV.GROQ_API_KEY.includes('placeholder')) {
      try {
        this.client = new Groq({ apiKey: ENV.GROQ_API_KEY });
      } catch (err) {
        logger.warn('Failed to initialize Groq client:', err);
        this.client = null;
      }
    } else {
      logger.info('Groq API Key set to placeholder or missing - AI generation disabled.');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<GroqCompletionResult | null> {
    if (!this.client) {
      // Strictly NO fake/mock AI text returned in production
      return null;
    }

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt || 'You are Scolify AI, an opportunity verification assistant.' },
          { role: 'user', content: prompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
      });

      const content = chatCompletion.choices[0]?.message?.content?.trim() || '';
      if (!content) {
        return null;
      }

      return {
        text: content,
        confidence: 0.95,
        reasoning: 'Generated via Groq API.',
      };
    } catch (err: any) {
      logger.error('Groq AI API Call failed:', err?.message || err);
      return null;
    }
  }
}

export const groqClient = new GroqIntegration();
