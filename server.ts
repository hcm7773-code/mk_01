import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface NegativeTopicSignal {
  topic: string;
  platform: string;
  severity: 'low' | 'medium' | 'high';
  riskCategory: '產品效果爭議' | '品牌信任危機' | '品質與檢驗疑慮' | '促銷與通路爭議';
  summary: string;
}

interface RecommendedActionItem {
  stage: string;
  action: string;
}

interface GroundedSource {
  title: string;
  uri: string;
}

interface SentimentWatchReport {
  focusTarget: string;
  capsuleSummary: string;
  riskLevel: 'low' | 'medium' | 'high';
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

interface CacheEntry {
  report: SentimentWatchReport;
  expiresAt: number;
}

const PORT = 3000;
const AUTO_SCAN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes periodic refresh
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache window
const scanCache = new Map<string, CacheEntry>();

function getValidApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key;
}

function extractJsonObject(rawText: string): Record<string, unknown> | null {
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeRiskLevel(val: unknown): 'low' | 'medium' | 'high' {
  if (val === 'high' || val === 'medium' || val === 'low') {
    return val;
  }
  return 'medium';
}

function normalizeRiskCategory(
  val: unknown
): '產品效果爭議' | '品牌信任危機' | '品質與檢驗疑慮' | '促銷與通路爭議' {
  const valid = ['產品效果爭議', '品牌信任危機', '品質與檢驗疑慮', '促銷與通路爭議'] as const;
  if (typeof val === 'string' && (valid as readonly string[]).includes(val)) {
    return val as (typeof valid)[number];
  }
  return '產品效果爭議';
}

async function runSentimentWatchScan(
  focusBrandInput: string,
  forceRefresh = false
): Promise<SentimentWatchReport> {
  const focusTarget = focusBrandInput.trim() || '台灣葉黃素整體市場（含大研生醫、善存、iHerb、Coupang）';
  const cacheKey = focusTarget.toLowerCase();
  const now = Date.now();

  if (!forceRefresh) {
    const cached = scanCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return { ...cached.report, cached: true };
    }
  }

  const apiKey = getValidApiKey();
  if (!apiKey) {
    const err = new Error(
      '尚未設定有效的 GEMINI_API_KEY，無法連線執行 24 小時 AI 輿情觀測。請於環境變數或 AI Studio Secrets 中設定金鑰。'
    ) as Error & { statusCode?: number; code?: string };
    err.statusCode = 503;
    err.code = 'GEMINI_API_KEY_MISSING';
    throw err;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const currentIso = new Date().toISOString();
  const prompt = `你是台灣保健食品與消費品輿情風險分析師。現在時間是 ${currentIso}。
請運用 Google Search 搜尋並檢查最近 24 小時（或最新即時社群與新聞動態）內，與「${focusTarget}」及葉黃素保健品相關的市場負面輿情、消費者抱怨、食安檢驗討論、電商促銷爭議、客服糾紛或潛在公關危機。

請特別留意台灣常見討論來源（新聞媒體、PTT、Dcard、Threads、Facebook 社群、食藥署／消保新聞、iHerb/Coupang 跨境比價或產品體感爭議），並以繁體中文（台灣用語）輸出分析。

請「只回傳一個合法 JSON 物件」，不要有任何額外說明文字或註解，JSON 欄位格式如下：
{
  "capsuleSummary": "給頁面頂部膠囊通知列顯示的極簡摘要，限 20 到 38 個中文字，須具體點出最近 24 小時關鍵負評或風險狀態",
  "riskLevel": "low 或 medium 或 high（low=目前無重大負評突波、medium=存在零星爭議或促銷／效果疑慮需追蹤、high=出現集中負評、食安／檢驗或公關危機訊號）",
  "headline": "24 小時輿情觀測報告主標題（15-28字）",
  "executiveSummary": "2 到 3 句話總結最近 24 小時內的市場負面輿情態勢、主要爭議來源與公關風險評估；若近 24 小時無單一重大突發公關危機，請誠實說明目前最新可查得之持續性消費者疑慮與警戒重點，切勿捏造不實新聞事件。",
  "negativeTopics": [
    {
      "topic": "具體負面議題或爭議點名稱",
      "platform": "出現平台或消息來源（例如 Dcard / PTT / Threads / 媒體新聞 / 電商評價）",
      "severity": "low 或 medium 或 high",
      "riskCategory": "產品效果爭議 或 品牌信任危機 或 品質與檢驗疑慮 或 促銷與通路爭議",
      "summary": "說明消費者討論痛點與對品牌的潛在影響（40-80字）"
    }
  ],
  "crisisTriggers": [
    "潛在危機觸發條件或須優先警覺之訊號 1",
    "潛在危機觸發條件或須優先警覺之訊號 2"
  ],
  "recommendedActions": [
    { "stage": "監測", "action": "針對當前 24 小時狀態的即時監測建議" },
    { "stage": "判斷", "action": "區分體感期待落差或品質誠信危機的查核建議" },
    { "stage": "回應", "action": "透明可查證的客服／官方聲明或專家說明建議" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawText = response.text ?? '';
  const parsed = extractJsonObject(rawText);

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sourcesMap = new Map<string, GroundedSource>();
  for (const chunk of chunks) {
    const web = chunk.web;
    if (web?.uri && !sourcesMap.has(web.uri)) {
      sourcesMap.set(web.uri, {
        title: web.title || web.uri,
        uri: web.uri,
      });
    }
  }
  const sources = Array.from(sourcesMap.values()).slice(0, 6);

  if (!parsed) {
    const fallbackReport: SentimentWatchReport = {
      focusTarget,
      capsuleSummary: rawText.slice(0, 38) || '已完成 24 小時 AI 輿情觀測，請檢視下方摘要內容',
      riskLevel: 'medium',
      headline: `${focusTarget}｜近 24 小時 AI 輿情觀測摘要`,
      executiveSummary: rawText.slice(0, 320) || '已完成即時搜尋與負面輿情檢索。',
      negativeTopics: [],
      crisisTriggers: ['建議持續追蹤效果疑慮、成分檢驗透明度與促銷期間評價波動。'],
      recommendedActions: [
        { stage: '監測', action: '持續追蹤論壇與電商平台最新評價變化。' },
        { stage: '回應', action: '若發現集中負評，應以可查證檢驗與成分說明即時回應。' },
      ],
      sources,
      scannedAt: currentIso,
      windowLabel: '最近 24 小時（即時搜尋觀測）',
      cached: false,
    };
    scanCache.set(cacheKey, { report: fallbackReport, expiresAt: now + CACHE_TTL_MS });
    return fallbackReport;
  }

  const rawTopics = Array.isArray(parsed.negativeTopics) ? parsed.negativeTopics : [];
  const negativeTopics: NegativeTopicSignal[] = rawTopics
    .slice(0, 5)
    .map((item) => {
      const obj = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      return {
        topic: typeof obj.topic === 'string' ? obj.topic : '消費者討論爭議觀察',
        platform: typeof obj.platform === 'string' ? obj.platform : '社群論壇／新聞搜尋',
        severity: normalizeRiskLevel(obj.severity),
        riskCategory: normalizeRiskCategory(obj.riskCategory),
        summary: typeof obj.summary === 'string' ? obj.summary : '須留意消費者期待與產品說明落差。',
      };
    });

  const rawTriggers = Array.isArray(parsed.crisisTriggers) ? parsed.crisisTriggers : [];
  const crisisTriggers = rawTriggers
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    .slice(0, 4);

  const rawActions = Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [];
  const recommendedActions: RecommendedActionItem[] = rawActions
    .slice(0, 5)
    .map((a) => {
      const obj = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
      return {
        stage: typeof obj.stage === 'string' ? obj.stage : '追蹤',
        action: typeof obj.action === 'string' ? obj.action : '持續觀測正負聲量波動。',
      };
    });

  const report: SentimentWatchReport = {
    focusTarget,
    capsuleSummary:
      typeof parsed.capsuleSummary === 'string' && parsed.capsuleSummary.trim()
        ? parsed.capsuleSummary.trim()
        : '24H AI 輿情觀測完成：持續監測成分檢驗與體感負評動向',
    riskLevel: normalizeRiskLevel(parsed.riskLevel),
    headline:
      typeof parsed.headline === 'string' && parsed.headline.trim()
        ? parsed.headline.trim()
        : `${focusTarget}｜近 24 小時負面輿情與公關風險觀測`,
    executiveSummary:
      typeof parsed.executiveSummary === 'string' && parsed.executiveSummary.trim()
        ? parsed.executiveSummary.trim()
        : '已完成最近 24 小時葉黃素市場相關負面討論與潛在公關風險檢索。',
    negativeTopics,
    crisisTriggers:
      crisisTriggers.length > 0
        ? crisisTriggers
        : ['促銷期與社群高討論時段之體感落差負評集中風險'],
    recommendedActions:
      recommendedActions.length > 0
        ? recommendedActions
        : [
            { stage: '監測', action: '加強檢查論壇與電商評論中針對成分含量與體感效果之負評。' },
            { stage: '回應', action: '以透明檢驗數據與法規合規說明回應消費者疑問。' },
          ],
    sources,
    scannedAt: currentIso,
    windowLabel: '最近 24 小時（Gemini 搜尋即時觀測）',
    cached: false,
  };

  scanCache.set(cacheKey, { report, expiresAt: now + CACHE_TTL_MS });
  return report;
}

function formatSentimentWatchError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const err = error as Error & { statusCode?: number; status?: number; code?: string };
  if (err.code === 'GEMINI_API_KEY_MISSING') {
    return {
      status: 503,
      code: 'GEMINI_API_KEY_MISSING',
      message: err.message,
    };
  }

  const rawMsg = err?.message ?? '';
  let parsedCode = err?.statusCode ?? err?.status ?? 500;
  let parsedStatus = '';
  let parsedMsg = rawMsg;

  try {
    const jsonObj = JSON.parse(rawMsg) as {
      error?: { code?: number; status?: string; message?: string };
    };
    if (jsonObj?.error) {
      if (typeof jsonObj.error.code === 'number') parsedCode = jsonObj.error.code;
      if (typeof jsonObj.error.status === 'string') parsedStatus = jsonObj.error.status;
      if (typeof jsonObj.error.message === 'string') parsedMsg = jsonObj.error.message;
    }
  } catch {
    // rawMsg is plain text
  }

  if (parsedCode === 429 || parsedStatus === 'RESOURCE_EXHAUSTED' || rawMsg.includes('429')) {
    return {
      status: 429,
      code: 'GEMINI_QUOTA_EXCEEDED',
      message:
        'Gemini API 呼叫配額目前達上限（429 RESOURCE_EXHAUSTED），請稍後點擊「即時更新」重試或檢查專案 API 配額。',
    };
  }

  if (parsedCode === 401 || parsedCode === 403 || rawMsg.includes('API key not valid')) {
    return {
      status: parsedCode,
      code: 'GEMINI_API_KEY_INVALID',
      message: 'Gemini API 金鑰無效或權限不足，請確認環境變數 GEMINI_API_KEY 設定。',
    };
  }

  return {
    status: parsedCode >= 400 && parsedCode < 600 ? parsedCode : 500,
    code: err.code ?? 'SENTIMENT_WATCH_FAILED',
    message: parsedMsg || '執行 AI 輿情觀測時發生錯誤，請稍後再試。',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(getValidApiKey()),
      autoScanIntervalMinutes: AUTO_SCAN_INTERVAL_MS / 60000,
    });
  });

  app.get('/api/sentiment-watch', async (req, res) => {
    const brand = typeof req.query.brand === 'string' ? req.query.brand : '';
    const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';

    try {
      const report = await runSentimentWatchScan(brand, forceRefresh);
      res.json({
        report,
        autoScanIntervalMinutes: AUTO_SCAN_INTERVAL_MS / 60000,
      });
    } catch (error) {
      const formatted = formatSentimentWatchError(error);
      res.status(formatted.status).json({
        error: formatted.code,
        message: formatted.message,
      });
    }
  });

  app.post('/api/sentiment-watch', async (req, res) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as {
      brand?: string;
      forceRefresh?: boolean;
    };
    const brand = typeof body.brand === 'string' ? body.brand : '';
    const forceRefresh = Boolean(body.forceRefresh);

    try {
      const report = await runSentimentWatchScan(brand, forceRefresh);
      res.json({
        report,
        autoScanIntervalMinutes: AUTO_SCAN_INTERVAL_MS / 60000,
      });
    } catch (error) {
      const formatted = formatSentimentWatchError(error);
      res.status(formatted.status).json({
        error: formatted.code,
        message: formatted.message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
