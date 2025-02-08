// src/components/SuggestionPanel.tsx
import React, { useState, useEffect } from "react";
import type { AnalysisResult } from "../types";
// import { aiService } from "../config/aiConfig";

interface SuggestionPanelProps {
  text: string;
  format?: string;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ text, format }) => {
  const [suggestions, setSuggestions] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIReady, setIsAIReady] = useState(false);

  useEffect(() => {
    // Check AI status on mount
    chrome.runtime.sendMessage({ type: "checkAIStatus" }, (response) => {
      setIsAIReady(response.initialized);
    });
  }, []);

  const analyzeSuggestions = async (): Promise<void> => {
    if (!isAIReady) {
      setError("AI service is not initialized");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chrome.runtime.sendMessage({
        type: "analyzeText",
        text,
        format,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setSuggestions(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when text changes if AI is ready
  useEffect(() => {
    if (isAIReady && text) {
      const debounceTimer = setTimeout(() => {
        analyzeSuggestions();
      }, 1000); // 1 second debounce

      return () => clearTimeout(debounceTimer);
    }
  }, [text, format, isAIReady]);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h3 className="card-title">Writing Suggestions</h3>
          <button
            onClick={analyzeSuggestions}
            disabled={loading || !isAIReady}
            className="btn btn-outline btn-sm"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Refresh"
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error: {error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : suggestions ? (
          <div className="prose">
            <ul className="list-disc list-inside space-y-2">
              {suggestions.suggestions.map((suggestion, index) => (
                <li key={index} className="text-base-content">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-base-content/60">
            {isAIReady
              ? "Click refresh to analyze your text"
              : "Initializing AI..."}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionPanel;
