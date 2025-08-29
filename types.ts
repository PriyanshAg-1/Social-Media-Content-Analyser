export type BasicAnalysis = {
  wordCount: number;
  characterCount: number;
  readabilityScore: number;
  suggestions: string[];
};

export type DeepAnalysis = {
  contentQualityScore: number;
  engagementPotentialScore: number;
  brandVoice: string;
  targetAudience: string;
  platformRecommendations: {
    twitter: string;
    instagram: string;
    linkedin: string;
    facebook: string;
  };
  hashtagStrategy: string[];
  optimalPostingTimes: string[];
  improvementSuggestions: string[];
  competitiveAnalysis: string;
  roiPotential: string;
};

export type AnalysisResult = {
  extractedText: string;
  analysis: BasicAnalysis;
  fileType: string;
  fileName: string;
  deepAnalysis?: DeepAnalysis;
};


