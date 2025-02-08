/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/aiConfig.ts
import { AgentKit, CdpWalletProvider } from "@coinbase/agentkit";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import type { ApiKeys, AnalysisResult } from "../types";

export class AIConfigService {
  private static instance: AIConfigService;
  private agent: any;
  private llm: ChatOpenAI | undefined;
  private config: ApiKeys;

  private constructor() {
    this.config = {
      CDP_API_KEY_NAME: import.meta.env.VITE_CDP_API_KEY_NAME,
      CDP_API_KEY_PRIVATE_KEY: import.meta.env.VITE_CDP_API_KEY_PRIVATE_KEY,
      NETWORK_ID: import.meta.env.VITE_NETWORK_ID || "base-sepolia",
    };
  }

  public static getInstance(): AIConfigService {
    if (!AIConfigService.instance) {
      AIConfigService.instance = new AIConfigService();
    }
    return AIConfigService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.llm = new ChatOpenAI({
        model: "gpt-4-mini",
      });

      const walletProvider = await CdpWalletProvider.configureWithWallet({
        apiKeyName: this.config.CDP_API_KEY_NAME,
        apiKeyPrivateKey: this.config.CDP_API_KEY_PRIVATE_KEY,
        networkId: this.config.NETWORK_ID,
      });

      const agentkit = await AgentKit.from({
        walletProvider,
        actionProviders: [],
      });

      this.agent = createReactAgent({
        llm: this.llm,
        tools: await getLangChainTools(agentkit),
        messageModifier: this.getAIPrompt(),
      });
    } catch (error) {
      console.error("AI initialization error:", error);
      throw error;
    }
  }

  private getAIPrompt(): string {
    return `
      You are a professional writing assistant with expertise in both technical and creative writing.
      
      When analyzing documents:
      1. Evaluate structure, clarity, and overall organization
      2. Suggest specific improvements for readability and impact
      3. Identify areas that need more detail or clarification
      
      For code analysis:
      1. Review code structure and organization
      2. Suggest improvements for maintainability and readability
      3. Identify potential optimization opportunities
      4. Ensure adherence to best practices
      
      For writing formats:
      1. Adapt suggestions to match the specified format requirements
      2. Maintain consistency with style guidelines
      3. Ensure appropriate tone and vocabulary
      
      Be specific and actionable in your suggestions.
    `;
  }

  public async analyzeText(
    text: string,
    format?: string
  ): Promise<AnalysisResult> {
    try {
      const prompt = this.constructPrompt(text, format);
      const response = await this.agent.invoke({
        messages: [new HumanMessage(prompt)],
      });

      return this.processResponse(response);
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  }

  private constructPrompt(text: string, format?: string): string {
    return format
      ? `Analyze this text and suggest improvements according to ${format} format:\n\n${text}`
      : `Analyze this text and suggest improvements:\n\n${text}`;
  }

  private processResponse(response: any): AnalysisResult {
    // Process and structure the AI response
    return {
      suggestions: response.suggestions || [],
      score: response.score || 0,
      improvements: response.improvements || [],
    };
  }

  // Utility method to check if AI is ready
  public isInitialized(): boolean {
    return !!this.agent && !!this.llm;
  }
}

export const aiService = AIConfigService.getInstance();
