import { Activity, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { AlertPushToastContainer } from './components/AlertPushToastContainer';
import { CompetitorComparisonSection } from './components/CompetitorComparisonSection';
import { ConsumerFocusSection } from './components/ConsumerFocusSection';
import { KeywordMatrixSection } from './components/KeywordMatrixSection';
import { StrategyAndRiskTab } from './components/StrategyAndRiskTab';
import { VolumeAndSentimentSection } from './components/VolumeAndSentimentSection';
import {
  KPI_METRICS,
  QUICK_GLOBAL_SEARCH_TERMS,
  REPORT_META,
  resolveGlobalBrandFilter,
} from './data/reportData';
import type { AlertPushNotification } from './types/alertPush';

type ViewMode = 'summary' | 'strategy';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [globalQuery, setGlobalQuery] = useState('');

  // Real-time Sentiment Alert Push Notifications state
  const [pushToasts, setPushToasts] = useState<AlertPushNotification[]>([]);
  const [pushLogs, setPushLogs] = useState<AlertPushNotification[]>([]);
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return window.Notification.permission;
  });

  const triggerPushAlert = useCallback(
    (payload: Omit<AlertPushNotification, 'id' | 'timestamp'>) => {
      const nowStr = new Date().toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const notification: AlertPushNotification = {
        ...payload,
        id: `push-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowStr,
      };
      setPushToasts((prev) => [notification, ...prev].slice(0, 3));
      setPushLogs((prev) => [notification, ...prev].slice(0, 12));

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        try {
          new window.Notification(`【輿情警報推播】${payload.title}`, {
            body: `${payload.metricBadge} — ${payload.message}`,
          });
        } catch {
          // Ignore browser Notification exceptions in sandboxed frames
        }
      }
    },
    []
  );

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotificationStatus('unsupported');
      return;
    }
    try {
      const result = await window.Notification.requestPermission();
      setBrowserNotificationStatus(result);
      if (result === 'granted') {
        triggerPushAlert({
          severity: 'info',
          channel: '瀏覽器系統推播已啟用',
          title: '已訂閱葉黃素市場即時輿情警報推播',
          message: '當單日聲量或負面評論突破警戒門檻時，將同步發送即時警示通知。',
          metricBadge: '訂閱成功',
          targetSectionId: 'sentiment-alerts',
        });
      }
    } catch {
      // Sandboxed iframe may block permission prompt; fallback remains active in-app toast
    }
  }, [triggerPushAlert]);

  const globalFilter = useMemo(
    () => resolveGlobalBrandFilter(globalQuery),
    [globalQuery]
  );

  const displayKpis = useMemo(() => {
    if (!globalFilter.isActive) {
      return KPI_METRICS.map((m, idx) => ({ ...m, isHighlight: idx === 2 }));
    }
    if (globalFilter.matchedProfile) {
      return globalFilter.matchedProfile.kpis;
    }
    const { totalOccurrences, matchedSectionsCount, sectionCoveragePct, matchedParagraphsCount } =
      globalFilter.transcriptAnalysis;
    return [
      {
        label: '篩選條件',
        value: globalFilter.query,
        unit: '',
        context: '自訂品牌／產品全域檢索',
      },
      {
        label: '輿情分析報告總提及次數',
        value: String(totalOccurrences),
        unit: '次',
        context: `出現於 ${matchedParagraphsCount} 個分析段落`,
      },
      {
        label: '報告章節覆蓋比例',
        value: `${sectionCoveragePct}%`,
        unit: `（${matchedSectionsCount}/9 節）`,
        context: totalOccurrences > 0 ? '已自動過濾下方相關段落與要點' : '原文未直接收錄該詞獨立數據',
        isHighlight: true,
      },
      {
        label: '獨立正負情緒揭露',
        value: '未單獨拆分',
        unit: '',
        context: '全市場基準為正面 72% / 中立 18% / 負面 10%',
      },
    ];
  }, [globalFilter]);

  const navigateToSection = (sectionId: string) => {
    if (viewMode !== 'summary') {
      setViewMode('summary');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FB] text-slate-900">
      {/* Top Bar Contract: 1-line brand wordmark — 5 concise nav links — 1 primary action (Export PDF) */}
      <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setViewMode('summary');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <span
              className="w-7 h-7 rounded-lg bg-indigo-600 text-white inline-flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Activity className="w-4 h-4" />
            </span>
            <span>葉黃素輿情分析平台</span>
          </a>

          <nav
            aria-label="摘要章節導覽"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={() => navigateToSection('keywords')}
              className="hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              關鍵字
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('volume')}
              className="hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              聲量情緒
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('competitors')}
              className="hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              競品比較
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('consumer-focus')}
              className="hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              關注要點
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="no-print flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Hero Split */}
        <div id="overview" className="scroll-mt-24 pb-8 border-b border-slate-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono-num text-slate-500 mb-3">
                  <span>{REPORT_META.sourceTool}</span>
                  <span aria-hidden="true">·</span>
                  <span>{REPORT_META.mainPeriod}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
                  {REPORT_META.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed max-w-2xl">
                  從長時間用眼保健需求出發，統整葉黃素市場之高頻關鍵字、月度與單日聲量波峰、正負情緒結構及消費者選購決策重點。
                </p>
              </div>

              {/* View Switcher */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  role="tablist"
                  aria-label="報告檢視模式"
                  className="inline-flex flex-wrap items-center gap-1 p-1 bg-white rounded-xl border border-slate-200"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'summary'}
                    onClick={() => setViewMode('summary')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'summary'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    結構化核心摘要
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'strategy'}
                    onClick={() => setViewMode('strategy')}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      viewMode === 'strategy'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    渠道、風險與建議
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Deep Midnight Indigo Tech Command Card */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#13153D] via-[#1C174E] to-[#0F172A] text-white p-6 flex flex-col justify-between border border-indigo-950/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-mono-num">
                  <span className="text-emerald-300 font-medium tracking-wide">
                    {globalFilter.isActive
                      ? `品牌／產品篩選中 · ${globalFilter.matchedProfile?.displayName ?? globalFilter.query}`
                      : '核心研究結論 · 2026/08–10'}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-white">
                  {globalFilter.isActive && globalFilter.matchedProfile
                    ? `${globalFilter.matchedProfile.displayName} — 專屬摘要`
                    : REPORT_META.coreDirection}
                </h2>

                <p className="text-xs sm:text-sm leading-relaxed text-indigo-100/85">
                  {globalFilter.isActive && globalFilter.matchedProfile
                    ? globalFilter.matchedProfile.volumeSummary
                    : '社群討論已從單純品名轉向成分透明與體感驗證；9 月討論高峰伴隨 9/17 負評峰值，顯示產品實效溝通為信任關鍵。'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/15 space-y-3">
                <div className="bg-[#063632]/90 border border-emerald-400/35 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-emerald-200">
                    {globalFilter.isActive ? '輿情分析報告原文命中' : '樣本正面口碑占比'}
                  </span>
                  <span className="text-sm font-bold font-mono-num text-emerald-300">
                    {globalFilter.isActive
                      ? `${globalFilter.transcriptAnalysis.totalOccurrences} 次（${globalFilter.transcriptAnalysis.matchedSectionsCount}/9 節）`
                      : '72%（416 / 576 篇）'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] font-mono-num text-indigo-200/80">
                  <span>9 月討論高峰：229 筆</span>
                  <span>單日負評轉折：9/17（6 篇）</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Brand / Product Filter Search Bar */}
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                placeholder="全域搜尋品牌或產品關鍵詞（例如：大研生醫、善存、iHerb、Coupang、游離型），自動過濾各區塊聲量與情緒資料..."
                aria-label="全域品牌或產品搜尋列"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
              {globalQuery && (
                <button
                  type="button"
                  onClick={() => setGlobalQuery('')}
                  aria-label="清除全域搜尋"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {globalFilter.isActive && (
              <button
                type="button"
                onClick={() => setGlobalQuery('')}
                className="px-4 py-2.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                清除篩選（顯示全市場）
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5 text-slate-500">
              <span>快速篩選品牌／產品：</span>
              {QUICK_GLOBAL_SEARCH_TERMS.map((term) => {
                const isActive = globalQuery.trim().toLowerCase() === term.toLowerCase();
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setGlobalQuery(isActive ? '' : term)}
                    className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                  >
                    {term}
                  </button>
                );
              })}
            </div>

            {globalFilter.isActive && (
              <span className="font-mono-num text-indigo-700 font-medium">
                已過濾各區塊：僅顯示「{globalFilter.matchedProfile?.displayName ?? globalFilter.query}」關聯資料
              </span>
            )}
          </div>
        </div>

        {/* 4-Column Full-Width KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {displayKpis.map((kpi) => {
            const isSentimentKpi = Boolean(kpi.isHighlight);
            return (
              <div
                key={kpi.label}
                className={`rounded-xl p-5 flex flex-col justify-between border transition-colors ${
                  isSentimentKpi
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-indigo-200'
                }`}
              >
                <span
                  className={`text-xs font-medium ${
                    isSentimentKpi ? 'text-emerald-800' : 'text-slate-500'
                  }`}
                >
                  {kpi.label}
                </span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl sm:text-3xl font-bold font-mono-num tracking-tight ${
                      isSentimentKpi ? 'text-emerald-800' : 'text-slate-900'
                    }`}
                  >
                    {kpi.value}
                  </span>
                  {kpi.unit && (
                    <span className="text-xs font-medium text-slate-600">
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <p className="mt-2.5 pt-2.5 border-t border-slate-200/70 text-xs text-slate-600 leading-snug">
                  {kpi.context}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active View Content */}
        {viewMode === 'summary' && (
          <div className="pb-6">
            <KeywordMatrixSection
              globalFilter={globalFilter}
              onClearGlobalFilter={() => setGlobalQuery('')}
            />
            <VolumeAndSentimentSection
              globalFilter={globalFilter}
              onClearGlobalFilter={() => setGlobalQuery('')}
              onTriggerPushAlert={triggerPushAlert}
              pushLogs={pushLogs}
              browserNotificationStatus={browserNotificationStatus}
              onRequestBrowserPermission={requestBrowserPermission}
            />
            <CompetitorComparisonSection globalFilter={globalFilter} />
            <ConsumerFocusSection
              globalFilter={globalFilter}
              onClearGlobalFilter={() => setGlobalQuery('')}
            />
          </div>
        )}

        {viewMode === 'strategy' && <StrategyAndRiskTab />}
      </main>

      {/* Clean Institutional Footer */}
      <footer className="no-print border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>{REPORT_META.sourceCitation}</p>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('summary')}
              className="hover:text-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              核心摘要
            </button>
            <button
              type="button"
              onClick={() => setViewMode('strategy')}
              className="hover:text-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              渠道與建議
            </button>
          </div>
        </div>
      </footer>

      {/* Live Sentiment Alert Push Toast Stack */}
      <AlertPushToastContainer
        notifications={pushToasts}
        onDismiss={(id) =>
          setPushToasts((prev) => prev.filter((item) => item.id !== id))
        }
        onActionJump={(sectionId, toastId) => {
          setPushToasts((prev) => prev.filter((item) => item.id !== toastId));
          navigateToSection(sectionId);
        }}
      />
    </div>
  );
}
