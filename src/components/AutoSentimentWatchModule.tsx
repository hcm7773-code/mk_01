import {
  AlertTriangle,
  Clock,
  ExternalLink,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { GlobalFilterResult } from '../data/reportData';
import type { SentimentWatchErrorState, SentimentWatchReport } from '../types/sentimentWatch';

interface AutoSentimentWatchModuleProps {
  report: SentimentWatchReport | null;
  loading: boolean;
  error: SentimentWatchErrorState | null;
  intervalMinutes: number;
  onChangeInterval: (minutes: number) => void;
  secondsUntilNextScan: number | null;
  history: SentimentWatchReport[];
  onRefresh: () => void;
  globalFilter: GlobalFilterResult;
}

const INTERVAL_OPTIONS = [
  { minutes: 15, label: '每 15 分鐘自動掃描' },
  { minutes: 30, label: '每 30 分鐘自動掃描' },
  { minutes: 60, label: '每 60 分鐘自動掃描' },
  { minutes: 0, label: '僅手動觸發' },
];

export function AutoSentimentWatchModule({
  report,
  loading,
  error,
  intervalMinutes,
  onChangeInterval,
  secondsUntilNextScan,
  history,
  onRefresh,
  globalFilter,
}: AutoSentimentWatchModuleProps) {
  const formatCountdown = (totalSeconds: number | null) => {
    if (totalSeconds === null || intervalMinutes === 0) return '手動模式';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} 後下次掃描`;
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getRiskStyle = (level: 'low' | 'medium' | 'high') => {
    if (level === 'high') {
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        label: '高度公關風險',
        icon: <ShieldAlert className="w-4 h-4 text-red-700" />,
      };
    }
    if (level === 'medium') {
      return {
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: '中度警戒追蹤',
        icon: <Radio className="w-4 h-4 text-indigo-700" />,
      };
    }
    return {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: '低度波動穩定',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
    };
  };

  const targetName = globalFilter.isActive
    ? globalFilter.matchedProfile?.displayName ?? globalFilter.query
    : '全市場葉黃素與主要競品';

  return (
    <section id="ai-sentiment-watch" className="scroll-mt-24 pt-12">
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            AI 即時觀測 · 24 小時負面輿情與公關危機雷達
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            自動輿情觀測報告（近 24 小時即時搜尋摘要）
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            透過後端 Gemini 搜尋觀測工具定期掃描最近 24 小時台灣社群論壇、新聞媒體與電商評價，針對「{targetName}」自動彙整負面輿情與潛在公關風險。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <select
              aria-label="自動觀測週期設定"
              value={intervalMinutes}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.minutes} value={opt.minutes}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'AI 觀測掃描中...' : '立即抓取 24H 輿情'}</span>
          </button>
        </div>
      </div>

      {/* Main Observation Panel */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600">
            <span className="font-mono-num font-semibold text-slate-900">
              觀測對象：{report?.focusTarget ?? targetName}
            </span>
            <span aria-hidden="true">·</span>
            <span>時間窗：{report?.windowLabel ?? '最近 24 小時'}</span>
            {report?.cached && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">快取有效中（可點擊「立即抓取」強制更新）</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono-num text-slate-500">
            <span>{formatCountdown(secondsUntilNextScan)}</span>
            {report?.scannedAt && (
              <span>上次更新：{formatTimestamp(report.scannedAt)}</span>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>
                  {error.code === 'GEMINI_API_KEY_MISSING'
                    ? '尚未設定 Gemini API 金鑰（環境變數 GEMINI_API_KEY）'
                    : '即時 24 小時 AI 輿情觀測失敗'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-rose-800">{error.message}</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-white border border-rose-300 text-rose-800 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              重新連線測試
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !report && !error && (
          <div className="py-10 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-900">
              正在執行 Google Search 網路檢索與 AI 負面輿情判讀...
            </p>
            <p className="text-xs text-slate-500">
              系統正在彙整最近 24 小時葉黃素市場負評、檢驗話題與潛在公關風險訊號
            </p>
          </div>
        )}

        {/* Populated AI Report */}
        {report && (
          <div className="space-y-6">
            {/* Headline + Executive Summary */}
            {(() => {
              const style = getRiskStyle(report.riskLevel);
              return (
                <div className="rounded-xl bg-gradient-to-br from-[#13153D] via-[#1C174E] to-[#0F172A] text-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}
                    >
                      {style.icon}
                      <span>{style.label}</span>
                    </span>
                    <span className="text-xs font-mono-num text-emerald-300">
                      Gemini 即時搜尋彙整 · {formatTimestamp(report.scannedAt)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {report.headline}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-indigo-100/90 mt-2">
                    {report.executiveSummary}
                  </p>
                </div>
              );
            })()}

            {/* Negative Signals + Crisis Triggers & Workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Negative Topics Detected */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-baseline justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    近 24 小時偵測負面輿情與爭議訊號
                  </h4>
                  <span className="text-xs font-mono-num text-slate-500">
                    共 {report.negativeTopics.length} 項訊號
                  </span>
                </div>

                {report.negativeTopics.length === 0 ? (
                  <div className="border border-slate-200 rounded-lg p-5 text-xs text-slate-600">
                    近 24 小時搜尋結果未發現集中爆發的重大負面議題，建議持續追蹤例行促銷評價與產品體感回饋。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.negativeTopics.map((item, idx) => {
                      const sevStyle = getRiskStyle(item.severity);
                      return (
                        <div
                          key={`${item.topic}-${idx}`}
                          className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono-num font-semibold text-indigo-700">
                                0{idx + 1}
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {item.topic}
                              </span>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${sevStyle.badge}`}
                            >
                              {item.riskCategory}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-700">{item.summary}</p>
                          <div className="text-[11px] text-slate-500 font-mono-num">
                            來源平台：{item.platform}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Crisis Triggers & 5-Stage Actions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="border border-slate-200 rounded-lg p-4 bg-white space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    潛在公關危機觸發條件
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {report.crisisTriggers.map((trigger, i) => (
                      <li key={i} className="leading-relaxed">
                        — {trigger}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/40 space-y-2.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    對應報告五階段危機應變建議
                  </h4>
                  <div className="divide-y divide-emerald-100">
                    {report.recommendedActions.map((act, i) => (
                      <div key={i} className="py-2 first:pt-0 last:pb-0 text-xs">
                        <span className="font-semibold text-emerald-900 mr-2">
                          [{act.stage}]
                        </span>
                        <span className="text-slate-700 leading-relaxed">{act.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Grounded Web Sources */}
            {report.sources.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  Google Search 即時觀測檢索來源（可點擊查證）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {report.sources.map((src) => (
                    <a
                      key={src.uri}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/70 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-colors"
                    >
                      <span className="truncate font-medium">{src.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Session History */}
            {history.length > 1 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  本次工作階段定時觀測紀錄（最近 {history.length} 筆）
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                  {history.map((item, idx) => (
                    <div
                      key={`${item.scannedAt}-${idx}`}
                      className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono-num text-slate-500 shrink-0">
                          {formatTimestamp(item.scannedAt)}
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {item.capsuleSummary}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono-num text-indigo-700 shrink-0">
                        {item.focusTarget}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
