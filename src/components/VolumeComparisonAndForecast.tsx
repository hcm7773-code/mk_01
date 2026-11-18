import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { VolumeForecastChart } from './VolumeForecastChart';

interface OverlayDayPoint {
  dayLabel: string;
  dateText: string;
  xIndex: number;
  campaignDaily: number;
  baselineDaily: number;
  eventCategory: 'promo' | 'safety_trust' | 'routine';
  eventBadge: string;
  backgroundSummary: string;
  keywords: string[];
  anomaly?: {
    id: string;
    title: string;
    detail: string;
    severity: 'high' | 'negative';
    deltaText: string;
  };
}

// Derived transparently from the report:
// - Routine months: Aug (180 / 31 ≈ 5.8/day) & Oct (182 / 31 ≈ 5.9/day) -> baseline ~5.9/day
// - Campaign/Peak month: Sep (229 total, avg 7.6/day) with exact report peaks: 9/8 = 37, 9/16 week = 30 (weekly), 9/17 negative = 6
const OVERLAY_POINTS: OverlayDayPoint[] = [
  {
    dayLabel: '月初基準',
    dateText: '2026/09/01',
    xIndex: 0,
    campaignDaily: 6.2,
    baselineDaily: 5.8,
    eventCategory: 'routine',
    eventBadge: '開學前哨・日常基準',
    backgroundSummary:
      '9 月初延續 8 月日常護眼討論基準，社群主要詢問學生與 3C 族群葉黃素劑量與游離型吸収差異，尚未出現促銷或負評波動。',
    keywords: ['游離型', '每日攝取量', '日常保養'],
  },
  {
    dayLabel: 'D4',
    dateText: '2026/09/04',
    xIndex: 1,
    campaignDaily: 7.4,
    baselineDaily: 5.9,
    eventCategory: 'promo',
    eventBadge: '節慶促銷預熱',
    backgroundSummary:
      '跨境電商平台（iHerb、Coupang）節慶優惠與品牌檔期預告陸續出現，社群開始彙整折扣碼與複方規格比價清單。',
    keywords: ['iHerb', 'Coupang', '優惠比價'],
  },
  {
    dayLabel: '9/8 高峰',
    dateText: '2026/09/08',
    xIndex: 2,
    campaignDaily: 37.0,
    baselineDaily: 6.0,
    eventCategory: 'promo',
    eventBadge: '節日大促・運動聯名高峰',
    backgroundSummary:
      '單日實測衝上 37 筆（日常基準 6.3 倍）。受「味全龍封王」品牌運動聯名話題與跨境節慶折扣同步發酵，推升大量轉載與品牌互動。',
    keywords: ['味全龍封王', '品牌聯名', '節慶促銷', '37 筆高峰'],
    anomaly: {
      id: 'sep-08',
      title: '9/8 單日聲量異常高峰（37 筆）',
      detail:
        '實測達 37 筆，約為日常日均基準（5.9 筆/日）的 6.3 倍。受運動賽事聯名與跨境電商節慶檔期雙重推升，建議回查自有貼文與自然口碑佔比。',
      severity: 'high',
      deltaText: '+517% vs 日常基準',
    },
  },
  {
    dayLabel: 'D12',
    dateText: '2026/09/12',
    xIndex: 3,
    campaignDaily: 9.2,
    baselineDaily: 5.8,
    eventCategory: 'routine',
    eventBadge: '波峰後規格比對',
    backgroundSummary:
      '首波高峰過後進入長尾比價與開箱評價期，消費者聚焦大研生醫等品牌與跨境平台之單位價格與玉米黃素複方含量。',
    keywords: ['大研生醫', '複方比例', 'KOL 開箱'],
  },
  {
    dayLabel: '9/16 當週',
    dateText: '2026/09/16 當週',
    xIndex: 4,
    campaignDaily: 14.5,
    baselineDaily: 6.1,
    eventCategory: 'promo',
    eventBadge: '電商導購・週聲量高峰',
    backgroundSummary:
      '9/16 當週累計 30 篇寫下週度高峰，延續中秋／節慶電商導購與論壇請益熱度，品牌官方貼文與論壇實測並存。',
    keywords: ['週高峰 30 篇', '促銷檔期', '選購請益'],
    anomaly: {
      id: 'sep-16',
      title: '9/16 當週週聲量高峰（30 篇）',
      detail: '9 月 16 日當週寫下週度討論高峰（30 篇），顯示品牌活動與議題討論具跨日延續性。',
      severity: 'high',
      deltaText: '週高峰 30 篇',
    },
  },
  {
    dayLabel: '9/17 負評峰',
    dateText: '2026/09/17',
    xIndex: 5,
    campaignDaily: 11.8,
    baselineDaily: 5.9,
    eventCategory: 'safety_trust',
    eventBadge: '食安檢驗與品質負評警戒',
    backgroundSummary:
      '於高聲量擴散隔日出現單日負面文章最高紀錄（6 篇），核心爭議為「產品效果不明顯」，同步升高消費者對成分含量標示、檢驗報告透明度與宣稱界線的質疑。',
    keywords: ['效果不明顯', '檢驗透明', '品質信任', '負評 6 篇'],
    anomaly: {
      id: 'sep-17',
      title: '9/17 負面文章單日高峰（6 篇）',
      detail:
        '於高聲量擴散隔日出現單日最多負面文章（6 篇），集中反映「產品效果不明顯」與品質查證訴求，須啟動成分檢驗透明回應。',
      severity: 'negative',
      deltaText: '負面 6 篇 / 日',
    },
  },
  {
    dayLabel: '月底回穩',
    dateText: '2026/09/28',
    xIndex: 6,
    campaignDaily: 6.5,
    baselineDaily: 5.8,
    eventCategory: 'routine',
    eventBadge: '檔期收斂・回歸常態',
    backgroundSummary:
      '9 月底促銷與負評波動逐步收斂回日常水平（約 6.5 筆/日），市場回歸例行補貨評價與 10 月雙十前哨預熱。',
    keywords: ['回穩基準', '複方評價', '日常補貨'],
  },
];

interface OverlayTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: OverlayDayPoint;
  }>;
  label?: string;
}

function OverlayTooltip({ active, payload, label }: OverlayTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  const badgeTone =
    pt.eventCategory === 'safety_trust'
      ? 'bg-red-50 text-red-700 border-red-200'
      : pt.eventCategory === 'promo'
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-3 text-xs max-w-[320px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-2 border-b border-slate-100">
        <div>
          <span className="font-mono-num font-bold text-slate-900">{pt.dateText}</span>
          <span className="ml-1.5 text-[11px] text-slate-500">({label})</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${badgeTone}`}>
          {pt.eventBadge}
        </span>
      </div>

      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-indigo-700 font-medium">活動期間（9 月）</span>
          <span className="font-mono-num font-bold text-slate-900">{pt.campaignDaily} 筆</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-700 font-medium">日常基準（8/10 月）</span>
          <span className="font-mono-num font-bold text-slate-900">{pt.baselineDaily} 筆</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 space-y-2">
        <p className="text-[11px] leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">當日輿情背景：</span>
          {pt.backgroundSummary}
        </p>
        <div className="flex flex-wrap gap-1">
          {pt.keywords.map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono-num"
            >
              #{kw}
            </span>
          ))}
        </div>
        {pt.anomaly && (
          <div
            className={`pt-1 text-[11px] font-semibold ${
              pt.anomaly.severity === 'negative' ? 'text-red-700' : 'text-indigo-700'
            }`}
          >
            異常節點：{pt.anomaly.title}
          </div>
        )}
      </div>
    </div>
  );
}

export function VolumeComparisonAndForecast() {
  const [showCampaign, setShowCampaign] = useState(true);
  const [showRoutine, setShowRoutine] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [eventMarkerScope, setEventMarkerScope] = useState<'all' | 'promo' | 'safety_trust'>('all');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>('sep-08');

  const selectedPoint = useMemo(
    () =>
      OVERLAY_POINTS.find((p) => p.anomaly?.id === selectedAnomalyId) ?? OVERLAY_POINTS[2],
    [selectedAnomalyId]
  );
  const selectedAnomaly = selectedPoint.anomaly!;

  const visibleEventPoints = useMemo(
    () =>
      OVERLAY_POINTS.filter((p) => {
        if (!showAnomalies) return false;
        if (p.eventCategory === 'routine') return false;
        if (eventMarkerScope === 'all') return true;
        return p.eventCategory === eventMarkerScope;
      }),
    [showAnomalies, eventMarkerScope]
  );

  return (
    <div className="space-y-6 mt-6">
      {/* 1. 活動期間 vs 日常期間 重疊聲量對比 (Recharts 增強互動圖表) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              活動期間 vs. 日常期間重疊聲量對比與關鍵事件標註（Recharts 互動對比）
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              自動標記節日大促、運動聯名與負評／檢驗警戒日；滑鼠懸停任一數據點即可顯示該日期之具體輿情背景摘要
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-800 font-medium">
              <input
                type="checkbox"
                checked={showCampaign}
                onChange={(e) => setShowCampaign(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span className="inline-block w-3 h-0.5 bg-indigo-600" aria-hidden="true" />
              <span>活動期間（9 月高峰期）</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showRoutine}
                onChange={(e) => setShowRoutine(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer"
              />
              <span
                className="inline-block w-3 h-0.5 border-t-2 border-dashed border-emerald-600"
                aria-hidden="true"
              />
              <span>日常期間基準（8、10 月）</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showAnomalies}
                onChange={(e) => setShowAnomalies(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-600 cursor-pointer"
              />
              <span>自動標記關鍵事件／異常點</span>
            </label>
          </div>
        </div>

        {/* Automatic Event Marker Filter Strip */}
        {showAnomalies && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 pb-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500">自動事件標記篩選：</span>
              {(
                [
                  { key: 'all', label: '全部關鍵事件 (4)' },
                  { key: 'promo', label: '節日大促／品牌聯名' },
                  { key: 'safety_trust', label: '食安檢驗／負評警戒' },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setEventMarkerScope(item.key)}
                  className={`px-2.5 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                    eventMarkerScope === item.key
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                <span>大促與聯名波峰</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                <span>食安檢驗與負評風險</span>
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            {!showCampaign && !showRoutine ? (
              <div className="h-[255px] border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center p-6">
                <p className="text-sm font-medium text-slate-700">尚未勾選任何比較期間曲線</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  請勾選上方「活動期間」或「日常期間基準」以顯示重疊聲量對比。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCampaign(true);
                    setShowRoutine(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  恢復雙期間對比顯示
                </button>
              </div>
            ) : (
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={OVERLAY_POINTS}
                    margin={{ top: 24, right: 22, left: -12, bottom: 4 }}
                    onClick={(state) => {
                      const label = state?.activeLabel;
                      const found = OVERLAY_POINTS.find((p) => p.dayLabel === label);
                      if (found?.anomaly) setSelectedAnomalyId(found.anomaly.id);
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="dayLabel"
                      tick={{ fontSize: 11, fill: '#475569' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 44]}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                      unit=" 筆"
                    />
                    <Tooltip content={<OverlayTooltip />} />

                    {showAnomalies && (
                      <ReferenceLine
                        y={18}
                        stroke="#F43F5E"
                        strokeDasharray="4 4"
                        strokeOpacity={0.65}
                        label={{
                          value: '異常警戒參考線 (18 筆/日)',
                          position: 'insideTopRight',
                          fill: '#BE123C',
                          fontSize: 10,
                        }}
                      />
                    )}

                    {/* Automatic Key Event Vertical Reference Markers */}
                    {visibleEventPoints.map((pt) => {
                      const isRisk = pt.eventCategory === 'safety_trust';
                      const shortMarker =
                        pt.dayLabel === 'D4'
                          ? '促銷預熱'
                          : pt.dayLabel === '9/8 高峰'
                            ? '★ 聯名＆大促高峰'
                            : pt.dayLabel === '9/16 當週'
                              ? '電商週高峰'
                              : '▲ 檢驗／負評警戒';
                      return (
                        <ReferenceLine
                          key={`ev-line-${pt.dayLabel}`}
                          x={pt.dayLabel}
                          stroke={isRisk ? '#DC2626' : '#4F46E5'}
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                          label={{
                            value: shortMarker,
                            position: 'top',
                            fill: isRisk ? '#B91C1C' : '#4338CA',
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        />
                      );
                    })}

                    {showRoutine && (
                      <Line
                        type="monotone"
                        dataKey="baselineDaily"
                        name="日常期間基準"
                        stroke="#059669"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        dot={{ r: 3.5, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                        activeDot={{ r: 5.5, fill: '#059669' }}
                        isAnimationActive={false}
                      />
                    )}

                    {showCampaign && (
                      <Line
                        type="monotone"
                        dataKey="campaignDaily"
                        name="活動期間（9 月）"
                        stroke="#4F46E5"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#4F46E5', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                        activeDot={{ r: 6.5, fill: '#4338CA' }}
                        isAnimationActive={false}
                      />
                    )}

                    {showCampaign &&
                      visibleEventPoints.map((p) => {
                        const isRisk = p.eventCategory === 'safety_trust';
                        const isSelected = p.anomaly?.id === selectedAnomalyId;
                        return (
                          <ReferenceDot
                            key={`ev-dot-${p.dayLabel}`}
                            x={p.dayLabel}
                            y={p.campaignDaily}
                            r={isSelected ? 8 : 6}
                            fill={isRisk ? '#DC2626' : '#4F46E5'}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            onClick={() => {
                              if (p.anomaly) setSelectedAnomalyId(p.anomaly.id);
                            }}
                          />
                        );
                      })}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-[11px] text-slate-500 mt-2">
              註：日常基準係依據報告 8 月（180 筆）與 10 月（182 筆）推算之日均基線（約 5.9 筆/日），與 9 月實測異常節點（9/8 單日 37 筆、9/16 當週 30 篇、9/17 負評 6 篇）進行重疊對照。
            </p>
          </div>

          <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <AlertTriangle
                    className={`w-3.5 h-3.5 ${
                      selectedAnomaly.severity === 'negative' ? 'text-red-700' : 'text-indigo-700'
                    }`}
                  />
                  <span>關鍵事件與異常診斷</span>
                </span>
                <span
                  className={`text-xs font-mono-num font-semibold ${
                    selectedAnomaly.severity === 'negative' ? 'text-red-700' : 'text-indigo-700'
                  }`}
                >
                  {selectedAnomaly.deltaText}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-mono-num text-slate-500">
                  {selectedPoint.dateText}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    selectedPoint.eventCategory === 'safety_trust'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {selectedPoint.eventBadge}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">{selectedAnomaly.title}</h4>
              <p className="text-xs leading-relaxed text-slate-700">
                {selectedPoint.backgroundSummary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5">
              <span className="block text-[11px] text-slate-500">切換檢視其他事件節點：</span>
              <div className="flex flex-wrap gap-1.5">
                {OVERLAY_POINTS.filter((p) => p.anomaly).map((p) => {
                  const a = p.anomaly!;
                  const isActive = a.id === selectedAnomalyId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAnomalyId(a.id)}
                      className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {p.dayLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recharts 接下來兩週聲量預測圖表 */}
      <VolumeForecastChart />
    </div>
  );
}
