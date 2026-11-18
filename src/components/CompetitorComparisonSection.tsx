import { Layers, ShieldAlert, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import {
  CHANNEL_INSIGHTS,
  CHANNEL_POSITIONING_NODES,
  COMPETITOR_COMPARISON_ITEMS,
  type ChannelPositioningNode,
  type GlobalFilterResult,
} from '../data/reportData';

interface CompetitorComparisonSectionProps {
  globalFilter: GlobalFilterResult;
}

const CHANNEL_BENCHMARK_BARS = [
  {
    name: '大研生醫 FB 粉絲團',
    shortName: '大研生醫 FB',
    count: 12,
    label: '12 則（第 1 名實測）',
    fill: '#4F46E5',
  },
  {
    name: '方格子 Vocus（基準推算）',
    shortName: '方格子（基準）',
    count: 6,
    label: '約 6 則（報告載明約居首一半）',
    fill: '#059669',
  },
];

interface MatrixTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: ChannelPositioningNode;
  }>;
}

function ChannelMatrixTooltip({ active, payload }: MatrixTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const node = payload[0]?.payload;
  if (!node) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3.5 py-2.5 text-xs max-w-[260px]">
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="font-bold text-slate-900">{node.name}</span>
        <span className="text-[11px] font-medium text-indigo-700">{node.category}</span>
      </div>
      <p className="text-[11px] font-mono-num text-slate-700 mb-1">
        原文位置：{node.reportedVolumeText}
      </p>
      <p className="text-[11px] text-slate-600 leading-relaxed">{node.natureNote}</p>
      <p className="text-[10px] text-indigo-700 mt-1.5 font-medium">點擊節點可鎖定檢視判讀原則</p>
    </div>
  );
}

export function CompetitorComparisonSection({
  globalFilter,
}: CompetitorComparisonSectionProps) {
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([
    'daiken',
    'centrum',
    'crossborder',
  ]);
  const [activeSubView, setActiveSubView] = useState<'matrix' | 'charts'>('matrix');
  const [selectedChannelId, setSelectedChannelId] = useState<string>('daiken-fb');

  // Auto-ensure searched brand is included in comparison when globalFilter is active
  useEffect(() => {
    if (!globalFilter.isActive || !globalFilter.matchedProfile) return;
    const key = globalFilter.matchedProfile.key;
    const mappedId =
      key === 'daiken'
        ? 'daiken'
        : key === 'centrum'
          ? 'centrum'
          : key === 'iherb' || key === 'coupang'
            ? 'crossborder'
            : null;
    if (mappedId) {
      setSelectedBrandIds((prev) => (prev.includes(mappedId) ? prev : [mappedId, ...prev]));
    }
  }, [globalFilter]);

  const toggleBrandSelection = (id: string) => {
    setSelectedBrandIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1 selected
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const comparedBrands = useMemo(
    () => COMPETITOR_COMPARISON_ITEMS.filter((item) => selectedBrandIds.includes(item.id)),
    [selectedBrandIds]
  );

  const selectedChannel = useMemo(
    () =>
      CHANNEL_POSITIONING_NODES.find((c) => c.id === selectedChannelId) ??
      CHANNEL_POSITIONING_NODES[0],
    [selectedChannelId]
  );

  const getCategoryColor = (cat: ChannelPositioningNode['category']) => {
    if (cat === '品牌自有社群') return '#4F46E5';
    if (cat === '內容與媒體平台') return '#059669';
    return '#0F172A';
  };

  return (
    <section id="competitors" className="scroll-mt-24 pt-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            互動競品比較 · 品牌比較樣本 284 則
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            互動競品比較與來源平台競爭力矩陣
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            依第 4 節與第 6 節原文，自由勾選「大研生醫」、「善存」、「iHerb／Coupang 跨境陣營」與「方格子」進行並列比較，並檢視品牌自有粉專與論壇口碑的本質差異。
          </p>
        </div>

        <div
          role="tablist"
          aria-label="競品比較視圖切換"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSubView === 'matrix'}
            onClick={() => setActiveSubView('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubView === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            互動競品並列比較
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSubView === 'charts'}
            onClick={() => setActiveSubView('charts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubView === 'charts'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            社群競爭力矩陣圖表
          </button>
        </div>
      </div>

      {/* Competitor Selector Strip */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 shrink-0">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>勾選欲並列比較之品牌／通路對象：</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COMPETITOR_COMPARISON_ITEMS.map((item) => {
            const checked = selectedBrandIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
                  checked
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrandSelection(item.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <span>{item.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {activeSubView === 'matrix' ? (
        <div className="mt-6 space-y-6">
          {/* Side-by-side interactive comparison grid */}
          <div
            className={`grid grid-cols-1 gap-5 ${
              comparedBrands.length === 1
                ? 'md:grid-cols-1'
                : comparedBrands.length === 2
                  ? 'md:grid-cols-2'
                  : 'md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {comparedBrands.map((brand) => {
              const isGloballyHighlighted =
                globalFilter.isActive &&
                (brand.name.toLowerCase().includes(globalFilter.query.toLowerCase()) ||
                  (globalFilter.matchedProfile?.key === 'daiken' && brand.id === 'daiken') ||
                  (globalFilter.matchedProfile?.key === 'centrum' && brand.id === 'centrum') ||
                  ((globalFilter.matchedProfile?.key === 'iherb' ||
                    globalFilter.matchedProfile?.key === 'coupang') &&
                    brand.id === 'crossborder'));

              return (
                <div
                  key={brand.id}
                  className={`bg-white rounded-xl p-5 flex flex-col justify-between border transition-colors ${
                    isGloballyHighlighted
                      ? 'border-indigo-600 ring-1 ring-indigo-600/20'
                      : 'border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono-num text-slate-500 mb-1">
                        <span>{brand.category}</span>
                        <span className="text-indigo-700 font-semibold">{brand.roleLabel}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{brand.name}</h3>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
                      <span className="block text-[11px] text-slate-500">
                        {brand.reportMetricLabel}
                      </span>
                      <span className="block text-xs sm:text-sm font-bold font-mono-num text-slate-900 mt-0.5">
                        {brand.reportMetricValue}
                      </span>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-slate-900 mb-1">
                        核心討論焦點
                      </span>
                      <p className="text-xs leading-relaxed text-slate-700">
                        {brand.discussionFocus}
                      </p>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-slate-900 mb-1.5">
                        主要出現渠道
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {brand.primaryChannels.map((ch) => (
                          <span
                            key={ch}
                            className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded border border-slate-200"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                      <span>{brand.trustAndRiskNote}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-xs text-emerald-900 bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2.5 leading-relaxed">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold">應對策略：</strong>
                        {brand.strategyCue}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Always show or toggle into Interactive Charts: keep charts directly interactive under Competitor section */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch`}>
        {/* Left: Interactive Recharts Community Competitiveness Matrix (ScatterChart) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  社群競爭力矩陣：品牌主導度 vs. 消費者自發口碑度
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  依據第 6 節「頻道特色與競爭矩陣」定性分類繪製；點擊各平台座標點可檢視右側判讀準則
                </p>
              </div>
              <span className="text-[11px] font-mono-num text-indigo-700 font-medium">
                互動象限分析
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                <span>品牌自有社群</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>內容／媒體平台</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
                <span>匿名／社群論壇</span>
              </span>
            </div>

            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 14, right: 20, bottom: 16, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    dataKey="brandControlScore"
                    name="品牌主導度"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    label={{
                      value: '品牌官方內容主導度 →',
                      position: 'insideBottom',
                      offset: -8,
                      fontSize: 11,
                      fill: '#475569',
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="organicDiscussionScore"
                    name="消費者自發度"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    label={{
                      value: '自發討論度',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 16,
                      fontSize: 11,
                      fill: '#475569',
                    }}
                  />
                  <ZAxis type="number" dataKey="bubbleSize" range={[120, 420]} />
                  <ReferenceLine x={50} stroke="#CBD5E1" strokeDasharray="4 4" />
                  <ReferenceLine y={50} stroke="#CBD5E1" strokeDasharray="4 4" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#4F46E5' }}
                    content={<ChannelMatrixTooltip />}
                  />
                  <Scatter
                    name="平台節點"
                    data={CHANNEL_POSITIONING_NODES}
                    onClick={(nodeData) => {
                      const clicked = nodeData as unknown as ChannelPositioningNode;
                      if (clicked?.id) setSelectedChannelId(clicked.id);
                    }}
                    className="cursor-pointer"
                  >
                    {CHANNEL_POSITIONING_NODES.map((entry) => {
                      const isSelected = entry.id === selectedChannelId;
                      return (
                        <Cell
                          key={entry.id}
                          fill={getCategoryColor(entry.category)}
                          fillOpacity={isSelected ? 1 : 0.72}
                          stroke={isSelected ? '#0F172A' : '#FFFFFF'}
                          strokeWidth={isSelected ? 2.5 : 1.5}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {CHANNEL_POSITIONING_NODES.map((node) => {
              const isSelected = node.id === selectedChannelId;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedChannelId(node.id)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {node.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Platform Inspector + Recharts Reported Benchmark */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <span className="text-xs font-mono-num font-semibold text-indigo-700">
                {selectedChannel.category}
              </span>
              <span className="text-[11px] font-mono-num text-slate-500">
                {selectedChannel.reportedVolumeText}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{selectedChannel.name}</h3>
            <p className="text-xs leading-relaxed text-slate-700">{selectedChannel.natureNote}</p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">口碑判讀提醒：</span>
              {selectedChannel.interpretationRule}
            </div>
          </div>

          {/* Reported Benchmark BarChart */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h4 className="text-xs font-semibold text-slate-900">
                來源頻道實測排行領先落差（原文揭露數值）
              </h4>
              <span className="text-[11px] font-mono-num text-slate-500">約 2.0 倍領先</span>
            </div>

            <div className="w-full h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CHANNEL_BENCHMARK_BARS}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 14]} hide />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={96}
                    tick={{ fontSize: 11, fill: '#334155' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} 則`, '來源頻道聲量']}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: '#E2E8F0',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                    {CHANNEL_BENCHMARK_BARS.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
              {CHANNEL_INSIGHTS.caution}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
