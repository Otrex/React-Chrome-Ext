// src/components/Popup.tsx
import React, { useState, useEffect } from "react";
import { WRITING_FORMATS } from "../config/formats";
import { aiService } from "../config/config";

interface Settings {
  format: string;
  autoAnalyze: boolean;
}

const Popup: React.FC = () => {
  const [isAIReady, setIsAIReady] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    format: "",
    autoAnalyze: false,
  });
  

  useEffect(() => {
    // Load settings and check AI status
    Promise.all([
      new Promise<void>((resolve) => {
        chrome.storage.sync.get("settings", (data) => {
          if (data.settings) {
            setSettings(data.settings);
          }
          resolve();
        });
      }),
      chrome.runtime.sendMessage({ type: "checkAIStatus" }),
    ]).then(([, aiStatus]) => {
      setIsAIReady(aiStatus.initialized);
    });
  }, []);

  const handleSettingsChange = async (
    key: keyof Settings,
    value: string | boolean
  ): Promise<void> => {
    const newSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(newSettings);
    await chrome.storage.sync.set({ settings: newSettings });
  };

  const handleApplySettings = async () => {
    try {
      // Initialize AI if not ready
      if (!isAIReady) {
        await aiService.initialize();
        setIsAIReady(true);
      }

      // You could trigger an initial analysis here if needed
      if (settings.autoAnalyze) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "startAutoAnalysis",
            format: settings.format,
          });
        });
      }
    } catch (error) {
      console.error("Error applying settings:", error);
    }
  };

  return (
    <div className="p-4 w-80">
      <h2 className="text-xl font-bold mb-4">AI Writing Assistant</h2>

      <div className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Writing Format</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={settings.format}
            onChange={(e) => handleSettingsChange("format", e.target.value)}
          >
            <option value="">Auto-detect</option>
            {WRITING_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              id="autoAnalyze"
              checked={settings.autoAnalyze}
              onChange={(e) =>
                handleSettingsChange("autoAnalyze", e.target.checked)
              }
            />
            <span className="label-text">Auto-analyze while typing</span>
          </label>
        </div>

        <button
          className={`btn btn-primary w-full ${!isAIReady ? "loading" : ""}`}
          onClick={handleApplySettings}
          disabled={!isAIReady}
        >
          {isAIReady ? "Apply Settings" : "Initializing AI..."}
        </button>
      </div>
    </div>
  );
};

export default Popup;
