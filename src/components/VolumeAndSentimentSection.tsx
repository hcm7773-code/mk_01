import { useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DATASET_SCOPES,
  MONTHLY_VOLUME_DATA,
  SENTIMENT_ANNUAL,
  SENTIMENT_THREE_MONTH,
  SEPTEMBER_TIMELINE_NODES,
  type GlobalFilterResult,
  type MonthlyVolumePoint,
  type SeptemberTimelineNode,
} from '../data/reportData';
import type { AlertPushNotification } from '../types/alertPush';
import { BrandSentimentRadar } from './BrandSentimentRadar';
import { SentimentAlertModule } from './SentimentAlertModule';
import { VolumeComparisonAndForecast } from './VolumeComparisonAndForecast';

interface VolumeAndSentimentSectionProps {
  globalFilter: GlobalFilterResult;
  onClearGlobalFilter: () => void;
  onTriggerPushAlert?: (alert: Omit<AlertPushNotification, 'id' | 'timestamp'>) => void;
  pushLogs?: AlertPushNotification[];
  browserNotificationStatus?: NotificationPermission | 'unsupported';
  onRequestBrowserPermission?: () => void;
}

interface MonthlyTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: MonthlyVolumePoint;
  }>;
}

function MonthlyVolumeTooltip({ active, payload }: MonthlyTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0]?.payload;
  if (!pt) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-3 text-xs max-w-[310px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-2 border-b border-slate-100">
        <span className="font-bold text-slate-900">{pt.month}</span>
        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
          {pt.note}
        </span>
      </div>
      <div className="space-y-1 mb-2.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600">討論聲量</span>
          <span className="font-mono-num font-bold text-slate-900">
            {pt.count} {pt.unit}（占比 {pt.sharePct}%）
          </span>
        </div>
        {pt.momChangePct !== null && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">月增率 (MoM)</span>
            <span
              className={`font-mono-num font-semibold ${
                pt.momChangePct > 0 ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {pt.momChangePct > 0 ? `+${pt.momChangePct}%` : `${pt.momChangePct}%`}
            </span>
          </div>
        )}
      </div>

      {/* Key Event Markers & Sentiment Background Summary */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex flex-wrap gap-1">
          {pt.eventTags.map((tag) => (
            <span
              key={tag.badge}
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                tag.category === 'safety_trust'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : tag.category === 'promo'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {tag.badge}
            </span>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-700">{pt.sentimentBackground}</p>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {pt.keyKeywords.map((kw) => (
            <span
              key={kw}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono-num"
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SepTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: SeptemberTimelineNode & { shortDate: string };
  }>;
}

function SeptemberTimelineTooltip({ active, payload }: SepTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const node = payload[0]?.payload;
  if (!node) return null;
  const isNegative = node.metricType === 'negative';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-3 text-xs max-w-[300px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="font-mono-num font-bold text-slate-900">{node.dateLabel}</span>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            isNegative
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}
        >
          {node.eventBadge}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="font-semibold text-slate-900">{node.title}</span>
        <span
          className={`font-mono-num font-bold ${
            isNegative ? 'text-red-700' : 'text-indigo-700'
          }`}
        >
          {node.metricValue} {node.metricUnit}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-700">{node.summary}</p>
    </div>
  );
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#047857',
  neutral: '#64748B',
  other: '#94A3B8',
  negative: '#B91C1C',
};

export function VolumeAndSentimentSection({
  globalFilter,
  onClearGlobalFilter,
  onTriggerPushAlert,
  pushLogs,
  browserNotificationStatus,
  onRequestBrowserPermission,
}: VolumeAndSentimentSectionProps) {
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(1);
  const [chartType, setChartType] = useState<'trend' | 'bar'>('trend');
  const [eventMarkerFilter, setEventMarkerFilter] = useState<'all' | 'promo' | 'safety_trust' | 'off'>('all');
  const [selectedTimelineIdx, setSelectedTimelineIdx] = useState<number>(2);
  const [sentimentView, setSentimentView] = useState<'three_month' | 'annual'>('three_month');
  const [selectedSentimentKey, setSelectedSentimentKey] = useState<string>('positive');
  const [showMarketBaselineInFilter, setShowMarketBaselineInFilter] = useState(false);

  const isBrandScoped =
    globalFilter.isActive && globalFilter.matchedProfile?.key !== 'lutein';

  const filteredDatasetScopes = isBrandScoped
    ? DATASET_SCOPES.filter((row) => {
        const q = globalFilter.query.toLowerCase();
        const combined = `${row.dataset} ${row.breakdown} ${row.purpose}`.toLowerCase();
        if (combined.includes(q)) return true;
        if (globalFilter.matchedProfile?.key === 'daiken' && row.dataset.includes('品牌比較')) return true;
        if (globalFilter.matchedProfile?.key === 'centrum' && row.dataset.includes('品牌比較')) return true;
        if (
          (globalFilter.matchedProfile?.key === 'iherb' ||
            globalFilter.matchedProfile?.key === 'coupang') &&
          row.dataset.includes('社群主題')
        ) {
          return true;
        }
        return false;
      })
    : DATASET_SCOPES;

  const selectedMonth = MONTHLY_VOLUME_DATA[selectedMonthIdx];
  const selectedTimelineNode = SEPTEMBER_TIMELINE_NODES[selectedTimelineIdx];

  const sentimentDonutData =
    sentimentView === 'three_month'
      ? SENTIMENT_THREE_MONTH.items.map((item) => ({
          key: item.key,
          name: `${item.label}情緒`,
          value: item.count,
          percent: item.percent,
          unit: SENTIMENT_THREE_MONTH.unit,
          fill: SENTIMENT_COLORS[item.key] ?? '#4F46E5',
        }))
      : SENTIMENT_ANNUAL.items.map((item) => ({
          key: item.key,
          name: item.label,
          value: item.count,
          percent: item.percent,
          unit: SENTIMENT_ANNUAL.unit,
          fill: SENTIMENT_COLORS[item.key] ?? '#4F46E5',
        }));

  const sepChartData = SEPTEMBER_TIMELINE_NODES.map((node, idx) => ({
    ...node,
    shortDate: node.dateLabel.replace('2026 / ', ''),
    idx,
  }));

  return (
    <>
      {/* 02. 聲量分析與趨勢視覺化 */}
      <section id="volume" className="scroll-mt-24 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
              02. 聲量分布與增強互動圖表
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              聲量月度趨勢、波峰時間軸與資料口徑總覽
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl">
              三個月社群主題共 591 筆，9 月為討論高峰（229 筆，月增 +27.2%）；年度關鍵字補充聲量達 384,830 則。各項統計口徑不同，解讀時應分開看待。
            </p>
          </div>

          <div
            role="tablist"
            aria-label="聲量圖表模式切換"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={chartType === 'trend'}
              onClick={() => setChartType('trend')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                chartType === 'trend'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              趨勢視覺化（Recharts 折線面積）
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={chartType === 'bar'}
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              月度長條對比
            </button>
          </div>
        </div>

        {/* Brand-Scoped Volume Filter Card */}
        {isBrandScoped && (
          <div className="mt-6 bg-white border border-indigo-200 rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono-num text-indigo-700 font-medium">
                  全域品牌／產品聲量篩選 · {globalFilter.matchedProfile?.entityType ?? '自訂關鍵詞檢索'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  「{globalFilter.matchedProfile?.displayName ?? globalFilter.query}」關聯聲量數據
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMarketBaselineInFilter((prev) => !prev)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  {showMarketBaselineInFilter ? '隱藏全市場圖表' : '對照全市場趨勢圖表'}
                </button>
                <button
                  type="button"
                  onClick={onClearGlobalFilter}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  恢復全市場檢視
                </button>
              </div>
            </div>

            {globalFilter.matchedProfile ? (
              <p className="text-sm leading-relaxed text-slate-700">
                {globalFilter.matchedProfile.volumeSummary}
              </p>
            ) : globalFilter.transcriptAnalysis.totalOccurrences > 0 ? (
              <p className="text-sm leading-relaxed text-slate-700">
                原輿情分析報告未獨立拆出「{globalFilter.query}」的單一品牌聲量數，但於原文中直接提及{' '}
                <span className="font-mono-num font-bold text-indigo-700">
                  {globalFilter.transcriptAnalysis.totalOccurrences} 次
                </span>
                （涵蓋 {globalFilter.transcriptAnalysis.matchedSectionsCount} / 9 個報告章節）。
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600">
                原輿情分析報告中未收錄「{globalFilter.query}」的獨立聲量統計數據。請清除篩選以檢視全市場（384,830 則／591 筆）基準。
              </p>
            )}

            {globalFilter.transcriptAnalysis.excerpts.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="block text-xs font-semibold text-slate-900">
                  輿情分析報告關聯段落實證：
                </span>
                {globalFilter.transcriptAnalysis.excerpts.map((ex, i) => (
                  <p key={i} className="text-xs leading-relaxed text-slate-600">
                    <span className="font-medium text-slate-800">
                      {ex.sectionHeading}（第 {ex.page} 頁）：
                    </span>
                    {ex.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {(!isBrandScoped || showMarketBaselineInFilter) && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
              {/* Interactive Recharts Monthly Trend Visualization */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        三個月社群主題聲量趨勢（合計 591 筆）
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        滑鼠懸停檢視詳細數據，點擊月份長條／節點或下方按鈕聯動波峰洞察
                      </p>
                    </div>
                    <span className="text-xs font-mono-num text-slate-500">
                      2026/08 – 2026/10
                    </span>
                  </div>

                  {/* Quick Month Pills & Automatic Key Event Marker Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {MONTHLY_VOLUME_DATA.map((m, idx) => (
                        <button
                          key={m.month}
                          type="button"
                          onClick={() => setSelectedMonthIdx(idx)}
                          className={`px-2.5 py-1 text-xs rounded-md border font-mono-num transition-colors cursor-pointer ${
                            selectedMonthIdx === idx
                              ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {m.shortLabel} ({m.count} 筆)
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="text-slate-500 mr-0.5">事件標記：</span>
                      {(
                        [
                          { key: 'all', label: '全部事件' },
                          { key: 'promo', label: '大促聯名' },
                          { key: 'safety_trust', label: '食安與負評警戒' },
                          { key: 'off', label: '隱藏' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setEventMarkerFilter(opt.key)}
                          className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            eventMarkerFilter === opt.key
                              ? 'bg-slate-900 text-white border-slate-900 font-medium'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-[225px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'trend' ? (
                        <ComposedChart
                          data={MONTHLY_VOLUME_DATA}
                          margin={{ top: 24, right: 24, left: -10, bottom: 4 }}
                          onClick={(state) => {
                            if (typeof state?.activeTooltipIndex === 'number') {
                              setSelectedMonthIdx(state.activeTooltipIndex);
                            }
                          }}
                        >
                          <defs>
                            <linearGradient id="rechartsMonthlyFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#475569' }}
                            axisLine={{ stroke: '#CBD5E1' }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 270]}
                            tick={{ fontSize: 11, fill: '#64748B' }}
                            axisLine={false}
                            tickLine={false}
                            unit=" 筆"
                          />
                          <Tooltip content={<MonthlyVolumeTooltip />} />

                          {(eventMarkerFilter === 'all' || eventMarkerFilter === 'promo') && (
                            <ReferenceLine
                              x="2026 年 9 月"
                              stroke="#4F46E5"
                              strokeDasharray="4 4"
                              strokeOpacity={0.65}
                              label={{
                                value: '★ 節日大促／聯名＆9/17負評',
                                position: 'top',
                                fill: '#4338CA',
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                          )}
                          {eventMarkerFilter === 'all' && (
                            <ReferenceLine
                              x="2026 年 10 月"
                              stroke="#059669"
                              strokeDasharray="3 3"
                              strokeOpacity={0.45}
                              label={{
                                value: '節慶電商延續',
                                position: 'top',
                                fill: '#047857',
                                fontSize: 10,
                              }}
                            />
                          )}
                          {eventMarkerFilter === 'safety_trust' && (
                            <ReferenceLine
                              x="2026 年 9 月"
                              stroke="#DC2626"
                              strokeDasharray="4 4"
                              strokeOpacity={0.8}
                              label={{
                                value: '▲ 9/17 品質檢驗與負評高峰',
                                position: 'top',
                                fill: '#B91C1C',
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                          )}

                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="none"
                            fill="url(#rechartsMonthlyFill)"
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#4338CA"
                            strokeWidth={2.5}
                            dot={{ r: 5, fill: '#4F46E5', stroke: '#FFFFFF', strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: '#059669' }}
                            isAnimationActive={false}
                          />

                          {eventMarkerFilter !== 'off' &&
                            (eventMarkerFilter === 'all' || eventMarkerFilter === 'promo') && (
                              <ReferenceDot
                                x="2026 年 9 月"
                                y={229}
                                r={7}
                                fill="#4F46E5"
                                stroke="#FFFFFF"
                                strokeWidth={2}
                              />
                            )}
                          {eventMarkerFilter === 'safety_trust' && (
                            <ReferenceDot
                              x="2026 年 9 月"
                              y={229}
                              r={7}
                              fill="#DC2626"
                              stroke="#FFFFFF"
                              strokeWidth={2}
                            />
                          )}
                          {eventMarkerFilter === 'all' && (
                            <ReferenceDot
                              x="2026 年 10 月"
                              y={182}
                              r={6}
                              fill="#059669"
                              stroke="#FFFFFF"
                              strokeWidth={2}
                            />
                          )}
                        </ComposedChart>
                      ) : (
                        <BarChart
                          data={MONTHLY_VOLUME_DATA}
                          margin={{ top: 24, right: 24, left: -10, bottom: 4 }}
                          onClick={(state) => {
                            if (typeof state?.activeTooltipIndex === 'number') {
                              setSelectedMonthIdx(state.activeTooltipIndex);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#475569' }}
                            axisLine={{ stroke: '#CBD5E1' }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 270]}
                            tick={{ fontSize: 11, fill: '#64748B' }}
                            axisLine={false}
                            tickLine={false}
                            unit=" 筆"
                          />
                          <Tooltip content={<MonthlyVolumeTooltip />} />
                          {eventMarkerFilter !== 'off' && (
                            <ReferenceLine
                              x="2026 年 9 月"
                              stroke={eventMarkerFilter === 'safety_trust' ? '#DC2626' : '#4F46E5'}
                              strokeDasharray="4 4"
                              strokeOpacity={0.6}
                              label={{
                                value:
                                  eventMarkerFilter === 'safety_trust'
                                    ? '▲ 9/17 負評檢驗警戒'
                                    : '★ 節日大促・聯名高峰',
                                position: 'top',
                                fill: eventMarkerFilter === 'safety_trust' ? '#B91C1C' : '#4338CA',
                                fontSize: 10,
                                fontWeight: 600,
                              }}
                            />
                          )}
                          <Bar
                            dataKey="count"
                            radius={[6, 6, 0, 0]}
                            barSize={56}
                            isAnimationActive={false}
                            className="cursor-pointer"
                          >
                            {MONTHLY_VOLUME_DATA.map((entry, idx) => (
                              <Cell
                                key={entry.month}
                                fill={
                                  selectedMonthIdx === idx
                                    ? entry.isPeak
                                      ? '#4338CA'
                                      : '#0F172A'
                                    : entry.isPeak
                                      ? '#6366F1'
                                      : '#CBD5E1'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Selected Month Detail Strip with Event Background Context */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {selectedMonth.month} · {selectedMonth.note}
                      </span>
                      {selectedMonth.eventTags.map((tag) => (
                        <span
                          key={tag.badge}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            tag.category === 'safety_trust'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : tag.category === 'promo'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {tag.badge}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-mono-num text-slate-600">
                      占三個月總量 {selectedMonth.sharePct}%（{selectedMonth.count} / 591 筆）
                      {selectedMonth.momChangePct !== null && (
                        <>
                          {' '}
                          · 月增率{' '}
                          {selectedMonth.momChangePct > 0
                            ? `+${selectedMonth.momChangePct}%`
                            : `${selectedMonth.momChangePct}%`}
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 mb-2">
                    <span className="font-semibold text-slate-900">輿情背景摘要：</span>
                    {selectedMonth.sentimentBackground}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {selectedMonth.highlights.map((line) => (
                      <li key={line} className="leading-relaxed">
                        — {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Peak Events & Channel Dominance Bar Visual */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-3">
                      關鍵波峰與異常日檢視
                    </h3>
                    <dl className="divide-y divide-slate-100 border-t border-b border-slate-100">
                      <div className="py-3 flex items-baseline justify-between gap-4">
                        <dt className="text-xs text-slate-600">單日聲量高峰（2026/09/08）</dt>
                        <dd className="text-sm font-semibold font-mono-num text-slate-900 whitespace-nowrap">
                          37 筆
                        </dd>
                      </div>
                      <div className="py-3 flex items-baseline justify-between gap-4">
                        <dt className="text-xs text-slate-600">週聲量高峰（2026/09/16 當週）</dt>
                        <dd className="text-sm font-semibold font-mono-num text-slate-900 whitespace-nowrap">
                          30 篇
                        </dd>
                      </div>
                      <div className="py-3 flex items-baseline justify-between gap-4">
                        <dt className="text-xs text-slate-600">單日負面高峰（2026/09/17）</dt>
                        <dd className="text-sm font-semibold font-mono-num text-red-800 whitespace-nowrap">
                          6 篇
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Channel Volume Visual Comparison */}
                  <div>
                    <div className="flex items-baseline justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-900">
                        來源頻道領先落差視覺化
                      </h4>
                      <span className="text-[11px] text-slate-500">品牌比較 284 則</span>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-800">
                            大研生醫 Facebook 粉絲團（第 1 名）
                          </span>
                          <span className="font-mono-num font-semibold text-slate-900">12 則</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600">
                            方格子（第 2 名，報告載明約居首者一半）
                          </span>
                          <span className="font-mono-num text-slate-700">約 6 則基準</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-500" style={{ width: '50%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-1.5">
                      核心判讀原則：曝光不等於好感
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-600">
                      品牌自有貼文、論壇討論（Threads / PTT / Dcard）與新聞轉載（LINE TODAY）性質不同，不能直接將曝光量等同於消費者口碑，應同步檢視貼文主題與互動品質。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dedicated Trend Visualization: September Event & Risk Timeline (Recharts Bar/Line Interactive) */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    趨勢視覺化：9 月討論高峰與負評轉折時間軸（互動聯動圖表）
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    點選各時間節點卡片或下方互動長條圖，同步檢視觸發原因與應變建議
                  </p>
                </div>
                <span className="text-xs font-mono-num text-slate-500">
                  2026 / 09 關鍵波峰演變
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {SEPTEMBER_TIMELINE_NODES.map((node, idx) => {
                      const isActive = selectedTimelineIdx === idx;
                      const isNegative = node.metricType === 'negative';
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={() => setSelectedTimelineIdx(idx)}
                          className={`text-left p-4 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                            isActive
                              ? isNegative
                                ? 'bg-red-50/70 border-red-700'
                                : 'bg-indigo-50/70 border-indigo-600'
                              : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <span className="block text-[11px] font-mono-num text-slate-500">
                            {node.dateLabel}
                          </span>
                          <span className="block text-sm font-bold text-slate-900 mt-1">
                            {node.title}
                          </span>
                          <div className="mt-3 flex items-baseline gap-1">
                            <span
                              className={`text-2xl font-bold font-mono-num ${
                                isNegative ? 'text-red-800' : 'text-indigo-700'
                              }`}
                            >
                              {node.metricValue}
                            </span>
                            <span className="text-xs text-slate-600">{node.metricUnit}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Recharts September Peak Comparison */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>9 月三大關鍵節點強度對比</span>
                      <span>聲量高峰（9/8 · 9/16）→ 負評轉折（9/17）</span>
                    </div>
                    <div className="w-full h-[125px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sepChartData}
                          margin={{ top: 8, right: 16, left: -16, bottom: 2 }}
                          onClick={(state) => {
                            if (typeof state?.activeTooltipIndex === 'number') {
                              setSelectedTimelineIdx(state.activeTooltipIndex);
                            }
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                          <XAxis
                            dataKey="shortDate"
                            tick={{ fontSize: 11, fill: '#475569' }}
                            axisLine={{ stroke: '#CBD5E1' }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 40]}
                            tick={{ fontSize: 10, fill: '#64748B' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<SeptemberTimelineTooltip />} />
                          <Bar
                            dataKey="metricValue"
                            radius={[4, 4, 0, 0]}
                            barSize={42}
                            isAnimationActive={false}
                            className="cursor-pointer"
                          >
                            {sepChartData.map((entry, idx) => (
                              <Cell
                                key={entry.id}
                                fill={
                                  entry.metricType === 'negative'
                                    ? '#B91C1C'
                                    : selectedTimelineIdx === idx
                                      ? '#4338CA'
                                      : '#6366F1'
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Selected Timeline Event Diagnosis */}
                <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-mono-num font-medium text-slate-800">
                        {selectedTimelineNode.dateLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          selectedTimelineNode.metricType === 'negative'
                            ? 'text-red-800 font-medium'
                            : 'text-indigo-700 font-medium'
                        }
                      >
                        {selectedTimelineNode.metricType === 'negative' ? '負面情緒警示' : '高聲量波峰'}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {selectedTimelineNode.title}（{selectedTimelineNode.metricValue}{' '}
                      {selectedTimelineNode.metricUnit}）
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {selectedTimelineNode.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-xs leading-relaxed text-slate-700">
                    <span className="font-semibold text-slate-900">對應追蹤建議：</span>
                    {selectedTimelineNode.actionNote}
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay Comparison (Campaign vs Routine) & Volume Forecast */}
            <VolumeComparisonAndForecast />

            {/* Statistical Scope Table */}
            <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  報告資料口徑與統計樣本對照表
                </h3>
                <span className="text-xs text-slate-500">
                  依據原簡報統計口徑獨立列示，避免混用基準
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-600">
                      <th className="py-2.5 px-6 whitespace-nowrap">資料集名稱</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">統計期間</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">總量</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">明細結構</th>
                      <th className="py-2.5 px-6 whitespace-nowrap">研究用途</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredDatasetScopes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-5 px-6 text-center text-slate-500">
                          無符合「{globalFilter.query}」的獨立資料集口徑列，可點擊上方「恢復全市場檢視」查看全部 4 項統計口徑。
                        </td>
                      </tr>
                    ) : (
                      filteredDatasetScopes.map((row) => (
                        <tr key={row.dataset} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-6 font-medium text-slate-900 whitespace-nowrap">
                            {row.dataset}
                          </td>
                          <td className="py-3 px-4 font-mono-num text-slate-600 whitespace-nowrap">
                            {row.period}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold font-mono-num text-slate-900 whitespace-nowrap">
                            {row.total}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{row.breakdown}</td>
                          <td className="py-3 px-6 text-slate-600">{row.purpose}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 03. 情緒分析 (Interactive Donut + Proportional Breakdown) */}
      <section id="sentiment" className="scroll-mt-24 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
              03. 情緒極性與負評診斷
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              正負情緒結構與品牌信任風險
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              三個月樣本中正面討論占 72%，整體偏向正向；但 10% 負面評價集中反映「產品效果不明顯」，揭露消費者期待與實際體感間的落差。
            </p>
          </div>

          <div
            role="tablist"
            aria-label="情緒分析統計口徑切換"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={sentimentView === 'three_month'}
              onClick={() => {
                setSentimentView('three_month');
                setSelectedSentimentKey('positive');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sentimentView === 'three_month'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              三個月分類樣本 (576 篇)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sentimentView === 'annual'}
              onClick={() => {
                setSentimentView('annual');
                setSelectedSentimentKey('positive');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sentimentView === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              年度關鍵字補充 (384,830 則)
            </button>
          </div>
        </div>

        {/* Brand-Scoped Sentiment Filter Card */}
        {isBrandScoped && (
          <div className="mt-6 bg-white border border-emerald-200 rounded-xl p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                「{globalFilter.matchedProfile?.displayName ?? globalFilter.query}」情緒與信任風險篩選說明
              </h3>
              <span className="text-xs font-mono-num text-emerald-800 font-medium">
                {globalFilter.matchedProfile ? '專屬語境對照' : '全文檢索比對'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {globalFilter.matchedProfile
                ? globalFilter.matchedProfile.sentimentSummary
                : `原報告未針對「${globalFilter.query}」單獨列示正負情緒比例。全市場三個月樣本（576 篇）正面占 72%、中立 18%、負面 10%，負評主要集中於「產品效果不明顯」。`}
            </p>
          </div>
        )}

        {(!isBrandScoped || showMarketBaselineInFilter) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
            {/* Sentiment Proportional Bar + Interactive Recharts Donut */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between gap-2 mb-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    {sentimentView === 'three_month'
                      ? '情緒分類樣本分布（n = 576 篇）'
                      : '年度關鍵字情緒趨勢補充（總聲量 384,830 則）'}
                  </h3>
                  <span className="text-xs font-mono-num text-slate-500">
                    {sentimentView === 'three_month' ? '2026/08 – 2026/10' : SENTIMENT_ANNUAL.period}
                  </span>
                </div>

                {/* Donut Chart + List Split */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mb-4">
                  <div className="sm:col-span-5 h-[190px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentDonutData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={74}
                          paddingAngle={2}
                          isAnimationActive={false}
                          onClick={(entry) => {
                            if (entry?.key) setSelectedSentimentKey(String(entry.key));
                          }}
                          className="cursor-pointer"
                        >
                          {sentimentDonutData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={entry.fill}
                              stroke={selectedSentimentKey === entry.key ? '#0F172A' : '#FFFFFF'}
                              strokeWidth={selectedSentimentKey === entry.key ? 2.5 : 1.5}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name, item) => [
                            `${Number(val).toLocaleString()} ${item?.payload?.unit ?? ''} (${item?.payload?.percent ?? 0}%)`,
                            String(name),
                          ]}
                          contentStyle={{
                            fontSize: '12px',
                            borderRadius: '8px',
                            borderColor: '#E2E8F0',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="sm:col-span-7 divide-y divide-slate-100 border-t border-b border-slate-100">
                    {(sentimentView === 'three_month'
                      ? SENTIMENT_THREE_MONTH.items
                      : SENTIMENT_ANNUAL.items
                    ).map((item) => {
                      const isSelected = selectedSentimentKey === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setSelectedSentimentKey(item.key)}
                          className={`w-full text-left py-3 px-2.5 flex items-center justify-between gap-2 transition-colors cursor-pointer rounded-md ${
                            isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2.5 h-2.5 rounded-xs shrink-0 ${item.colorClass}`}
                                aria-hidden="true"
                              />
                              <span className={`text-xs sm:text-sm font-semibold ${item.textClass}`}>
                                {sentimentView === 'three_month' ? `${item.label}情緒` : item.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed pl-4">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-base font-bold font-mono-num text-slate-900">
                              {item.percent}%
                            </span>
                            <span className="block text-[11px] font-mono-num text-slate-500">
                              {item.count.toLocaleString()}{' '}
                              {sentimentView === 'three_month' ? '篇' : '則'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                <span>點擊圓餅圖區塊或右側列項可標註對照情緒占比</span>
                <span className="font-mono-num">
                  總樣本：
                  {sentimentView === 'three_month' ? '576 篇' : '384,830 則'}
                </span>
              </div>
            </div>

            {/* Negative Peak Diagnosis */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">負面情緒高峰診斷</h3>
                  <span className="text-xs font-medium text-red-800">風險警示 · 2026/09/17</span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold font-mono-num text-red-800">6 篇</span>
                  <span className="text-xs text-slate-600">
                    9 月 17 日單日負面文章數居三個月樣本之首
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-1">
                      核心導火線：產品效果不明顯
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-600">
                      負面討論多集中在質疑產品實際體感與視力改善效果，反映消費者對葉黃素的期待高於實際感受。
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-1">信任危機傳導鏈</h4>
                    <p className="text-xs leading-relaxed text-slate-600">
                      當行銷承諾過高且品牌未提供清楚、可查證的成分與檢驗依據時，連續負評將由單純的效果質疑演變為對品牌誠信與品質管理的疑慮。
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
                建議於促銷期、KOL 貼文後及高峰日隔日（如 9/16 週高峰後之 9/17）即時回查負評。
              </div>
            </div>
          </div>
        )}

        {/* Recharts 品牌情緒雷達圖（價格・功效・成份・副作用 四維度多選比較） */}
        <BrandSentimentRadar globalFilter={globalFilter} />

        {/* Interactive Sentiment Alert Module & Push Notifications */}
        <SentimentAlertModule
          globalFilter={globalFilter}
          onTriggerPushAlert={onTriggerPushAlert}
          pushLogs={pushLogs}
          browserNotificationStatus={browserNotificationStatus}
          onRequestBrowserPermission={onRequestBrowserPermission}
        />
      </section>
    </>
  );
}
