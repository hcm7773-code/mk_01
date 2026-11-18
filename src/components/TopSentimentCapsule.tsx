import { AlertTriangle, ArrowDownRight, Radio, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { SentimentWatchErrorState, SentimentWatchReport } from '../types/sentimentWatch';

interface TopSentimentCapsuleProps {
  report: SentimentWatchReport | null;
  loading: boolean;
  error: SentimentWatchErrorState | null;
  onRefresh: () => void;
  onJumpToModule: () => void;
}

export function TopSentimentCapsule({
  report,
  loading,
  error,
  onRefresh,
  onJumpToModule,
}: TopSentimentCapsuleProps) {
  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const riskConfig = (() => {
    if (error) {
      return {
        wrapper: 'bg-rose-50/95 border-rose-200 text-rose-950',
        badge: 'bg-rose-700 text-white',
        label: error.code === 'GEMINI_API_KEY_MISSING' ? '待設定 AI 金鑰' : '觀測異常',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
    }
    if (loading && !report) {
      return {
        wrapper: 'bg-indigo-50/90 border-indigo-200 text-indigo-950',
        badge: 'bg-indigo-600 text-white',
        label: '24H AI 掃描中',
        icon: <Radio className="w-3.5 h-3.5" />,
      };
    }
    if (report?.riskLevel === 'high') {
      return {
        wrapper: 'bg-red-50/95 border-red-200 text-red-950',
        badge: 'bg-red-700 text-white',
        label: '高度風險警示',
        icon: <ShieldAlert className="w-3.5 h-3.5" />,
      };
    }
    if (report?.riskLevel === 'medium') {
      return {
        wrapper: 'bg-indigo-50/95 border-indigo-200 text-slate-900',
        badge: 'bg-indigo-700 text-white',
        label: '24H 中度警戒',
        icon: <Radio className="w-3.5 h-3.5" />,
      };
    }
    return {
      wrapper: 'bg-emerald-50/95 border-emerald-200 text-slate-900',
      badge: 'bg-emerald-700 text-white',
      label: '24H 輿情穩定',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    };
  })();

  const summaryText = error
    ? error.message
    : loading && !report
      ? '正在連線 Gemini 搜尋並彙整最近 24 小時葉黃素市場負面輿情與潛在公關風險...'
      : report?.capsuleSummary ?? '點擊「立即觀測」啟動最近 24 小時市場負面輿情與公關風險掃描';

  return (
    <div className="mb-6">
      <div
        role="status"
        aria-live="polite"
        className={`rounded-full border px-3 sm:px-4 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 shadow-xs transition-colors ${riskConfig.wrapper}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap shrink-0 ${riskConfig.badge}`}
          >
            {riskConfig.icon}
            <span>{riskConfig.label}</span>
          </span>

          <button
            type="button"
            onClick={onJumpToModule}
            className="text-left text-xs font-medium truncate hover:underline cursor-pointer min-w-0"
            title={summaryText}
          >
            {summaryText}
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {report?.scannedAt && !error && (
            <span className="hidden lg:inline text-[11px] font-mono-num text-slate-500 whitespace-nowrap">
              更新 {formatTime(report.scannedAt)}
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="立即重新執行 24 小時 AI 輿情觀測"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? '掃描中' : '即時更新'}</span>
          </button>

          <button
            type="button"
            onClick={onJumpToModule}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-white hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>24H 報告詳情</span>
            <ArrowDownRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
