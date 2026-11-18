export type WatchRiskLevel = 'low' | 'medium' | 'high';

export interface NegativeTopicSignal {
  topic: string;
  platform: string;
  severity: WatchRiskLevel;
  riskCategory: '產品效果爭議' | '品牌信任危機' | '品質與檢驗疑慮' | '促銷與通路爭議';
  summary: string;
}

export interface RecommendedActionItem {
  stage: string;
  action: string;
}

export interface GroundedSource {
  title: string;
  uri: string;
}

export interface SentimentWatchReport {
  focusTarget: string;
  capsuleSummary: string;
  riskLevel: WatchRiskLevel;
  headline: string;
  executiveSummary: string;
  negativeTopics: NegativeTopicSignal[];
  crisisTriggers: string[];
  recommendedActions: RecommendedActionItem[];
  sources: GroundedSource[];
  scannedAt: string;
  windowLabel: string;
  cached: boolean;
}

export interface SentimentWatchErrorState {
  code: string;
  message: string;
}
