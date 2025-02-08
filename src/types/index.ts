export interface ApiKeys {
  CDP_API_KEY_NAME: string;
  CDP_API_KEY_PRIVATE_KEY: string;
  NETWORK_ID: string;
}

export interface WritingFormat {
  id: string;
  name: string;
}

export interface AnalysisResult {
  suggestions: string[];
  score: number;
  improvements: string[];
}
