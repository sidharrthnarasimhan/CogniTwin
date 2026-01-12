/**
 * LLM Client for multi-agent system
 * Supports OpenAI GPT-4, GPT-3.5, and can be extended for Claude/other providers
 */

import OpenAI from 'openai';

// Environment configuration
const USE_REAL_LLM = process.env.USE_REAL_LLM === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4-turbo-preview';

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class LLMClient {
  private openai: OpenAI | null = null;
  private useRealLLM: boolean;

  constructor() {
    this.useRealLLM = USE_REAL_LLM;

    if (this.useRealLLM) {
      if (!OPENAI_API_KEY) {
        console.warn('⚠️  USE_REAL_LLM=true but OPENAI_API_KEY not set. Falling back to rule-based agents.');
        this.useRealLLM = false;
      } else {
        this.openai = new OpenAI({
          apiKey: OPENAI_API_KEY,
        });
        console.log(`✅ LLM Client initialized with model: ${LLM_MODEL}`);
      }
    } else {
      console.log('ℹ️  Using rule-based agents (USE_REAL_LLM=false)');
    }
  }

  /**
   * Call LLM with system prompt and user message
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    config: LLMConfig = {}
  ): Promise<string> {
    if (!this.useRealLLM || !this.openai) {
      throw new Error('LLM not configured. Set USE_REAL_LLM=true and OPENAI_API_KEY.');
    }

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    return this.chatWithMessages(messages, config);
  }

  /**
   * Call LLM with full message history
   */
  async chatWithMessages(
    messages: LLMMessage[],
    config: LLMConfig = {}
  ): Promise<string> {
    if (!this.useRealLLM || !this.openai) {
      throw new Error('LLM not configured. Set USE_REAL_LLM=true and OPENAI_API_KEY.');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.model || LLM_MODEL,
        messages: messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 1500,
        top_p: config.topP ?? 1,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from LLM');
      }

      return response;
    } catch (error: any) {
      console.error('LLM API Error:', error.message);
      throw new Error(`LLM API call failed: ${error.message}`);
    }
  }

  /**
   * Call LLM with structured JSON output
   */
  async chatJSON<T>(
    systemPrompt: string,
    userMessage: string,
    config: LLMConfig = {}
  ): Promise<T> {
    const response = await this.chat(systemPrompt, userMessage, config);

    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : response;

      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new Error('LLM response was not valid JSON');
    }
  }

  /**
   * Check if real LLM is enabled and configured
   */
  isEnabled(): boolean {
    return this.useRealLLM && this.openai !== null;
  }

  /**
   * Get current model name
   */
  getModelName(): string {
    return this.useRealLLM ? LLM_MODEL : 'rule-based';
  }
}

// Singleton instance
let llmClientInstance: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!llmClientInstance) {
    llmClientInstance = new LLMClient();
  }
  return llmClientInstance;
}

// Helper to create agent-specific prompts
export function createAgentPrompt(
  agentRole: string,
  task: string,
  context: Record<string, any>
): string {
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `Task: ${task}\n\nContext:\n${contextStr}\n\nPlease provide your analysis as a ${agentRole}.`;
}
