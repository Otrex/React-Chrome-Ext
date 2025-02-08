/* eslint-disable @typescript-eslint/no-explicit-any */
// src/background/index.ts
import { aiService } from "./config/config";

class BackgroundService {
  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await aiService.initialize();
      this.setupMessageListeners();
    } catch (error) {
      console.error("Background service initialization error:", error);
    }
  }

  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Required for async response
    });
  }

  private async handleMessage(
    request: { type: string; text?: string; format?: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      switch (request.type) {
        case "analyzeText": {
          if (request.text && request.format) {
            const analysis = await aiService.analyzeText(
              request.text,
              request.format
            );
            sendResponse(analysis);
          } else {
            sendResponse({ error: "Missing text or format for analysis" });
          }
          break;
        }

        case "checkAIStatus":
          sendResponse({ initialized: aiService.isInitialized() });
          break;

        default:
          sendResponse({ error: "Unknown request type" });
      }
    } catch (error) {
      sendResponse({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
// Initialize background service
new BackgroundService();
