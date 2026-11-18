import { Bell, BellRing, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { GlobalFilterResult } from '../data/reportData';
import type { AlertPushNotification } from '../types/alertPush';

interface AlertItem {
  id: string;
  severityLabel: '高優先警報' | '中度警戒' | '情境監控';
  severityStyle: string;
  title: string;
  metricReadout: string;
  triggerReason: string;
  recommendedAction: string;
  tags: string[];
}

interface SentimentAlertModuleProps {
  globalFilter?: GlobalFilterResult;
  onTriggerPushAlert?: (alert: Omit<AlertPushNotification, 'id' | 'timestamp'>) => void;
  pushLogs?: AlertPushNotification[];
  browserNotificationStatus?: NotificationPermission | 'unsupported';
  onRequestBrowserPermission?: () => void;
}

export function SentimentAlertModule({
  globalFilter,
  onTriggerPushAlert,
  pushLogs = [],
  browserNotificationStatus = 'default',
  onRequestBrowserPermission,
}: SentimentAlertModuleProps) {
  // Configurable thresholds grounded in report metrics
  const [dailyVolumeThreshold, setDailyVolumeThreshold] = useState<number>(18);
  const [dailyNegativeThreshold, setDailyNegativeThreshold] = useState<number>(4);
  const [negativeShareThreshold, setNegativeShareThreshold] = useState<number>(10);

  // High-risk context checkboxes from Section 8 of transcript
  const [isPromoPeriod, setIsPromoPeriod] = useState<boolean>(true);
  const [isPostKolPost, setIsPostKolPost] = useState<boolean>(false);
  const [isSpikeDay, setIsSpikeDay] = useState<boolean>(true);

  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  const [autoPushOnChange, setAutoPushOnChange] = useState<boolean>(true);

  // Observed report benchmarks
  const observedMaxDailyVolume = 37; // 9/8
  const observedMaxDailyNegative = 6; // 9/17
  const observedNegativeShare = 10; // 57 / 576 = 10%

  const activeAlerts = useMemo<AlertItem[]>(() => {
    const list: AlertItem[] = [];

    if (observedMaxDailyVolume >= dailyVolumeThreshold) {
      list.push({
        id: 'alert-vol-sep08',
        severityLabel: '高優先警報',
        severityStyle: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        title: '單日聲量異常激增警報（2026/09/08）',
        metricReadout: `實測 ${observedMaxDailyVolume} 筆 / 日（門檻 ${dailyVolumeThreshold} 筆）`,
        triggerReason: '單日聲量超過日常基準均值（約 5.9 筆/日）之警戒門檻，須確認是否為促銷擴散或突發事件。',
        recommendedAction: '執行「階段 01–02」：回查當日熱門貼文、品牌活動、促銷檔期及新聞來源。',
        tags: ['葉黃素', '大研生醫', 'iherb', 'coupang', '聲量'],
      });
    }

    if (observedMaxDailyNegative >= dailyNegativeThreshold) {
      list.push({
        id: 'alert-neg-sep17',
        severityLabel: '高優先警報',
        severityStyle: 'text-red-800 bg-red-50 border-red-200',
        title: '負面情緒集中爆發警報（2026/09/17）',
        metricReadout: `實測 ${observedMaxDailyNegative} 篇負評 / 日（門檻 ${dailyNegativeThreshold} 篇）`,
        triggerReason: '單日負評集中於「產品效果不明顯」，反映消費者體感落差，易引發品牌誠信危機。',
        recommendedAction: '執行「階段 03–04」：啟動專責回覆小組、邀請專業人士提供可查證資訊並檢視產品宣稱。',
        tags: ['葉黃素', '游離型', '善存', '效果', '負評'],
      });
    }

    if (observedNegativeShare >= negativeShareThreshold) {
      list.push({
        id: 'alert-neg-share',
        severityLabel: '中度警戒',
        severityStyle: 'text-indigo-900 bg-indigo-50/70 border-indigo-200',
        title: '負面口碑占比觸及警戒線（樣本 n = 576 篇）',
        metricReadout: `實測 ${observedNegativeShare}% · 57 篇（警戒線 ${negativeShareThreshold}%）`,
        triggerReason: '雖以正面 72% 為主，但負面比例達 10% 門檻，須防範連續負評對品質管理產生疑慮。',
        recommendedAction: '建立固定週期情緒監控，定期檢測並公開品質與檢驗資訊以穩固信任。',
        tags: ['葉黃素', '大研生醫', '善存', '游離型', '品質'],
      });
    }

    if (isPromoPeriod || isPostKolPost || isSpikeDay) {
      const contexts = [
        isPromoPeriod && '促銷期間',
        isPostKolPost && 'KOL 貼文發布後',
        isSpikeDay && '聲量異常高峰日',
      ].filter(Boolean);

      list.push({
        id: 'alert-context-watch',
        severityLabel: '情境監控',
        severityStyle: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        title: `高敏感時段追蹤啟動（${contexts.join(' · ')}）`,
        metricReadout: `已啟用 ${contexts.length} 項時段強化監測`,
        triggerReason: '依據報告第 8 節建議，於特定行銷波段須加密追蹤「效果、成分及品質」相關討論。',
        recommendedAction: '保持客服回應口徑一致性，並預備官方說明及檢驗報告連結隨時應對。',
        tags: ['葉黃素', 'iherb', 'coupang', '大研生醫', '促銷'],
      });
    }

    if (globalFilter?.isActive && globalFilter.matchedProfile?.key !== 'lutein') {
      const q = globalFilter.query.toLowerCase();
      return list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.triggerReason.toLowerCase().includes(q) ||
          item.tags.some((t) => q.includes(t) || t.includes(q))
      );
    }

    return list;
  }, [
    dailyVolumeThreshold,
    dailyNegativeThreshold,
    negativeShareThreshold,
    isPromoPeriod,
    isPostKolPost,
    isSpikeDay,
    globalFilter,
  ]);

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDispatchAlertPush = (item?: AlertItem) => {
    if (!onTriggerPushAlert) return;
    const target = item ?? activeAlerts[0];
    if (!target) {
      onTriggerPushAlert({
        severity: 'info',
        channel: '系統監控推播',
        title: '目前設定門檻下各項指標正常',
        message: '所有實測聲量與負面指標均未超過您設定的警戒值，持續定期追蹤中。',
        metricBadge: `門檻 ${dailyVolumeThreshold} 筆 / ${dailyNegativeThreshold} 篇`,
        targetSectionId: 'sentiment-alerts',
      });
      return;
    }

    onTriggerPushAlert({
      severity:
        target.severityLabel === '高優先警報'
          ? 'high'
          : target.severityLabel === '中度警戒'
            ? 'medium'
            : 'info',
      channel: '輿情警報推播',
      title: target.title,
      message: `${target.triggerReason} 建議：${target.recommendedAction}`,
      metricBadge: target.metricReadout,
      targetSectionId: 'sentiment-alerts',
    });
  };

  const unacknowledgedCount = activeAlerts.filter((a) => !acknowledgedIds.includes(a.id)).length;

  return (
    <div id="sentiment-alerts" className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden scroll-mt-24">
      {/* Midnight Indigo Header Strip */}
      <div className="bg-[#13153D] text-white px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-600/80 border border-indigo-400/40 inline-flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </span>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              輿情警報模組與即時警報推播中心
            </h3>
            <p className="text-xs text-indigo-200/85">
              即時對照報告指標（9/8 單日 37 筆 · 9/17 負評 6 篇 · 負面占比 10%），支援站內與瀏覽器桌面警報推播
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="bg-[#063632]/90 border border-emerald-400/35 rounded-lg px-3.5 py-2 text-xs font-mono-num text-emerald-300">
            觸發警報：{activeAlerts.length} 項 · 待處理：{unacknowledgedCount} 項
          </div>

          <button
            type="button"
            onClick={() => handleDispatchAlertPush()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>發送即時警報推播</span>
          </button>
        </div>
      </div>

      {/* Push Dispatch Controls Strip */}
      <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 font-medium select-none">
            <input
              type="checkbox"
              checked={autoPushOnChange}
              onChange={(e) => setAutoPushOnChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
            />
            <span>門檻突破時自動觸發站內彈出推播</span>
          </label>

          {browserNotificationStatus !== 'unsupported' && onRequestBrowserPermission && (
            <button
              type="button"
              onClick={onRequestBrowserPermission}
              disabled={browserNotificationStatus === 'granted'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                browserNotificationStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default'
                  : browserNotificationStatus === 'denied'
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <BellRing className="w-3 h-3" />
              <span>
                {browserNotificationStatus === 'granted'
                  ? '已啟用瀏覽器系統推播'
                  : browserNotificationStatus === 'denied'
                    ? '瀏覽器推播已封鎖（僅用站內推播）'
                    : '啟用瀏覽器桌面推播通知'}
              </span>
            </button>
          )}
        </div>

        <span className="font-mono-num text-slate-500">
          已發送推播：{pushLogs.length} 則
        </span>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Threshold & Context Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-3">
              預警門檻調整（實測基準對照）
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="vol-threshold" className="text-slate-700 font-medium">
                    單日聲量異常門檻
                  </label>
                  <span className="font-mono-num font-semibold text-indigo-700">
                    ≥ {dailyVolumeThreshold} 筆 / 日
                  </span>
                </div>
                <input
                  id="vol-threshold"
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={dailyVolumeThreshold}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value);
                    const wasTriggered = observedMaxDailyVolume >= dailyVolumeThreshold;
                    setDailyVolumeThreshold(nextVal);
                    if (autoPushOnChange && !wasTriggered && observedMaxDailyVolume >= nextVal) {
                      handleDispatchAlertPush({
                        id: 'alert-vol-sep08',
                        severityLabel: '高優先警報',
                        severityStyle: '',
                        title: '單日聲量門檻突破推播（9/8 達 37 筆）',
                        metricReadout: `實測 37 筆 ≥ 新門檻 ${nextVal} 筆`,
                        triggerReason: '單日討論突破自訂警戒門檻，須回查促銷與熱文來源。',
                        recommendedAction: '執行階段 01–02 聲量來源追查。',
                        tags: [],
                      });
                    }
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                  <span>10 筆</span>
                  <span>9/8 實測：37 筆</span>
                  <span>45 筆</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="neg-threshold" className="text-slate-700 font-medium">
                    單日負面文章警報門檻
                  </label>
                  <span className="font-mono-num font-semibold text-red-700">
                    ≥ {dailyNegativeThreshold} 篇 / 日
                  </span>
                </div>
                <input
                  id="neg-threshold"
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={dailyNegativeThreshold}
                  onChange={(e) => {
                    const nextVal = Number(e.target.value);
                    const wasTriggered = observedMaxDailyNegative >= dailyNegativeThreshold;
                    setDailyNegativeThreshold(nextVal);
                    if (autoPushOnChange && !wasTriggered && observedMaxDailyNegative >= nextVal) {
                      handleDispatchAlertPush({
                        id: 'alert-neg-sep17',
                        severityLabel: '高優先警報',
                        severityStyle: '',
                        title: '負評爆發門檻突破推播（9/17 達 6 篇）',
                        metricReadout: `實測 6 篇 ≥ 新門檻 ${nextVal} 篇`,
                        triggerReason: '負評主因「產品效果不明顯」超過設定門檻。',
                        recommendedAction: '啟動專責回覆小組與可查證成分說明。',
                        tags: [],
                      });
                    }
                  }}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                  <span>2 篇</span>
                  <span>9/17 實測：6 篇</span>
                  <span>10 篇</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor="neg-share-threshold" className="text-slate-700 font-medium">
                    負面情緒占比警戒線
                  </label>
                  <span className="font-mono-num font-semibold text-slate-900">
                    ≥ {negativeShareThreshold}%
                  </span>
                </div>
                <input
                  id="neg-share-threshold"
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={negativeShareThreshold}
                  onChange={(e) => setNegativeShareThreshold(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                  <span>5%</span>
                  <span>樣本實測：10%</span>
                  <span>25%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 mb-2.5">
              高風險監測時段勾選（報告第 8 節）
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isPromoPeriod}
                  onChange={(e) => setIsPromoPeriod(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <span>促銷期間（跨境電商 / 節慶優惠）</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isPostKolPost}
                  onChange={(e) => setIsPostKolPost(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <span>KOL 貼文發布後（開箱 / 用眼經驗分享）</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={isSpikeDay}
                  onChange={(e) => setIsSpikeDay(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <span>聲量異常高峰日追蹤</span>
              </label>
            </div>
          </div>

          {/* Push History Log */}
          {pushLogs.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">
                近期警報推播發送紀錄
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {pushLogs.map((log) => (
                  <div
                    key={log.id}
                    className="px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] flex items-center justify-between gap-2"
                  >
                    <span className="truncate font-medium text-slate-800">{log.title}</span>
                    <span className="font-mono-num text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Triggered Alert Queue */}
        <div className="lg:col-span-7 space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-8 text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900">
                目前設定門檻下無觸發警報
              </p>
              <p className="text-xs text-slate-600 mt-1 mb-4">
                所有實測指標均低於您設定的警戒門檻，可調低門檻或勾選高風險時段進行模擬測試。
              </p>
              <button
                type="button"
                onClick={() => {
                  setDailyVolumeThreshold(18);
                  setDailyNegativeThreshold(4);
                  setNegativeShareThreshold(10);
                  setIsPromoPeriod(true);
                  setIsSpikeDay(true);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
              >
                恢復預設警戒門檻
              </button>
            </div>
          ) : (
            activeAlerts.map((alert) => {
              const isAck = acknowledgedIds.includes(alert.id);
              return (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    isAck ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${alert.severityStyle}`}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>{alert.severityLabel}</span>
                      </span>
                      <span className="font-mono-num text-slate-600">
                        {alert.metricReadout}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onTriggerPushAlert && (
                        <button
                          type="button"
                          onClick={() => handleDispatchAlertPush(alert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Send className="w-3 h-3" />
                          <span>推播</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleAcknowledge(alert.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                          isAck
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {isAck ? '已確認處置（點擊恢復）' : '標記已處置'}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-600 mb-2">
                    {alert.triggerReason}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-800 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-indigo-700">應變動作：</span>
                    {alert.recommendedAction}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
