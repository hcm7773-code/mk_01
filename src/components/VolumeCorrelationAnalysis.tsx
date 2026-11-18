import { GitCommitHorizontal, Network, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

type CorrelationMode = 'lag_effect' | 'channel_matrix' | 'topic_cooccurrence';

interface LagWavePoint {
  wave: string;
  campaignVolume: number;
  sameDayNegative: number;
  lag1Negative: number;
  lag2Negative: number;
  context: string;
}

const LAG_WAVE_SERIES: LagWavePoint[] = [
  {
    wave: '8 月日常基準',
    campaignVolume: 6.0,
    sameDayNegative: 0.6,
    lag1Negative: 0.7,
    lag2Negative: 0.6,
    context: '日常 3C 保養問答期間，聲量低檔平穩，負評幾乎不具滯後擴散。',
  },
  {
    wave: '9/4 促銷預熱',
    campaignVolume: 9.5,
    sameDayNegative: 1.0,
    lag1Negative: 1.5,
    lag2Negative: 1.2,
    context: 'iHerb／Coupang 優惠預熱帶動價格比對，隔日小幅出現 1–2 則性價比疑問。',
  },
  {
    wave: '9/8 單日高峰',
    campaignVolume: 37.0,
    sameDayNegative: 2.0,
    lag1Negative: 3.4,
    lag2Negative: 2.3,
    context: '9/8 單日衝上 37 筆（聯名與促銷），隔日（T+1）質疑聲量明顯攀升。',
  },
  {
    wave: '9/16 週高峰',
    campaignVolume: 30.0,
    sameDayNegative: 2.5,
    lag1Negative: 6.0,
    lag2Negative: 3.2,
    context: '9/16 當週 30 篇高曝光討論後，次日（9/17）集中爆發 6 篇負面文章，核心痛點為「效果不明顯」。',
  },
  {
    wave: '10 月雙十延續',
    campaignVolume: 14.0,
    sameDayNegative: 1.3,
    lag1Negative: 2.1,
    lag2Negative: 1.5,
    context: '10 月節慶電商檔期促銷延續，T+1 負面轉化維持可控溫和水位。',
  },
  {
    wave: '11/11 檔期峰值',
    campaignVolume: 26.0,
    sameDayNegative: 2.2,
    lag1Negative: 5.0,
    lag2Negative: 4.0,
    context: '雙十一高曝光檔期帶動高轉載，峰後 24 小時負評與批號查證顯著提升。',
  },
];

interface ChannelScatterPoint {
  channel: string;
  exposureIndex: number; // 0-100
  negativeSensitivity: number; // 0-100
  shareWeight: number;
  role: string;
  insight: string;
}

const CHANNEL_SCATTER_DATA: ChannelScatterPoint[] = [
  {
    channel: '大研生醫 FB 粉專',
    exposureIndex: 92,
    negativeSensitivity: 24,
    shareWeight: 420,
    role: '品牌自有社群領先頻道（12 則居首）',
    insight: '自有粉專曝光居首但多為官方促銷與互動貼文，負評敏感度相對低，不可直接等同於自然口碑。',
  },
  {
    channel: '方格子',
    exposureIndex: 62,
    negativeSensitivity: 28,
    shareWeight: 260,
    role: '內容平台深度評比（約居首者一半）',
    insight: '以長文成分解析與選購指南為主，消費者重視客觀比較與可查證資訊，中立理性討論多。',
  },
  {
    channel: 'LINE TODAY',
    exposureIndex: 74,
    negativeSensitivity: 38,
    shareWeight: 310,
    role: '新聞媒體轉載入口',
    insight: '新聞轉載放大觸及廣度，若標題或健康效益宣稱引發質疑，留言區易出現嘲諷或信任疑慮。',
  },
  {
    channel: 'Threads',
    exposureIndex: 68,
    negativeSensitivity: 72,
    shareWeight: 290,
    role: '即時情緒與開箱擴散陣地',
    insight: '短文互動節奏快，KOL 開箱或大促隔日極易聚集「無感／業配太多」之即時負面串文。',
  },
  {
    channel: 'PTT',
    exposureIndex: 58,
    negativeSensitivity: 84,
    shareWeight: 270,
    role: '高敏感規格與誠信檢驗場域',
    insight: '受眾對劑量標示、檢驗報告與廣告宣稱界線最嚴格，9/17 類負評常在此形成長串驗證討論。',
  },
  {
    channel: 'Dcard',
    exposureIndex: 64,
    negativeSensitivity: 69,
    shareWeight: 280,
    role: '年輕族群實測與價格比對論壇',
    insight: '聚焦學生與 3C 上班族真實體感回饋，「吃了有沒有感」與跨境平台比價討論比例高。',
  },
  {
    channel: '一般新聞平台',
    exposureIndex: 52,
    negativeSensitivity: 45,
    shareWeight: 210,
    role: '公關事件與衛教報導來源',
    insight: '日常負評敏感度中等，但一旦出現食安或檢驗爭議新聞，將快速擴大跨平台搜尋聲量。',
  },
];

interface TopicCorrelationItem {
  topic: string;
  volumeCorrPct: number; // % contribution to volume surge
  riskCorrPct: number; // % probability of triggering negative inquiry
  note: string;
}

const TOPIC_CORRELATION_DATA: TopicCorrelationItem[] = [
  {
    topic: '產品效果與體感期待',
    volumeCorrPct: 68,
    riskCorrPct: 88,
    note: '與負評關聯度最高（9/17 主因「產品效果不明顯」），當行銷承諾過高時極易引爆反彈。',
  },
  {
    topic: '跨境電商優惠 (iHerb/Coupang)',
    volumeCorrPct: 82,
    riskCorrPct: 54,
    note: '顯著推升促銷期討論聲量，同時伴隨價格透明度與含量性價比之比較批評。',
  },
  {
    topic: '運動與品牌聯名 (味全龍封王)',
    volumeCorrPct: 91,
    riskCorrPct: 36,
    note: '對單日聲量拉抬最強（+517% 級波峰），負評風險較低但須防受眾與護眼需求脫節。',
  },
  {
    topic: '原料品質與檢驗資訊',
    volumeCorrPct: 58,
    riskCorrPct: 76,
    note: '平時多為理性請益，一旦進入大促或負評期間便成為消費者查證品牌誠信的核心指標。',
  },
  {
    topic: '游離型／玉米黃素複方規格',
    volumeCorrPct: 74,
    riskCorrPct: 32,
    note: '高度帶動選購指南與 KOL 開箱討論，屬建立專業信任的正面轉化型關鍵詞。',
  },
  {
    topic: '3C 長時間用眼需求',
    volumeCorrPct: 79,
    riskCorrPct: 24,
    note: '全市場最穩定的剛性討論來源，負面極性最低，適合長期分眾內容經營。',
  },
];

export function VolumeCorrelationAnalysis() {
  const [mode, setMode] = useState<CorrelationMode>('lag_effect');
  const [lagWindow, setLagWindow] = useState<'sameDay' | 'lag1' | 'lag2'>('lag1');
  const [selectedChannel, setSelectedChannel] = useState<ChannelScatterPoint>(
    CHANNEL_SCATTER_DATA[4] // PTT
  );
  const [selectedTopic, setSelectedTopic] = useState<TopicCorrelationItem>(
    TOPIC_CORRELATION_DATA[0]
  );

  const lagMetricKey =
    lagWindow === 'sameDay'
      ? 'sameDayNegative'
      : lagWindow === 'lag1'
        ? 'lag1Negative'
        : 'lag2Negative';

  const lagCorrelationScore = useMemo(() => {
    if (lagWindow === 'sameDay') return 'r = +0.62（當日同步相關）';
    if (lagWindow === 'lag1') return 'r = +0.84（T+1 日顯著正相關）';
    return 'r = +0.71（T+2 日長尾延續相關）';
  }, [lagWindow]);

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
      {/* Header & Mode Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
            <Network className="w-3.5 h-3.5" />
            <span>聲量關聯分析 · 曝光、平台與負評風險聯動檢驗</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            聲量波動 × 渠道屬性 × 負評風險關聯度分析
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            驗證報告核心判讀「曝光不等於好感」，量化大促高峰後負評滯後效應、各渠道風險敏感度與話題共現強度
          </p>
        </div>

        <div
          role="tablist"
          aria-label="聲量關聯分析維度切換"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'lag_effect'}
            onClick={() => setMode('lag_effect')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'lag_effect'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            波峰與負評滯後關聯
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'channel_matrix'}
            onClick={() => setMode('channel_matrix')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'channel_matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            渠道曝光 vs. 負評敏感度
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'topic_cooccurrence'}
            onClick={() => setMode('topic_cooccurrence')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'topic_cooccurrence'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            議題話題與風險關聯度
          </button>
        </div>
      </div>

      {/* Mode 1: Lagged Volume-to-Negative Correlation */}
      {mode === 'lag_effect' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500">觀察負評滯後窗口：</span>
                {(
                  [
                    { key: 'sameDay', label: '當日同步 (T+0)' },
                    { key: 'lag1', label: '峰後隔日 (T+1 · 如 9/16→9/17)' },
                    { key: 'lag2', label: '峰後兩日 (T+2)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setLagWindow(opt.key)}
                    className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      lagWindow === opt.key
                        ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="font-mono-num font-semibold text-indigo-700">
                {lagCorrelationScore}
              </span>
            </div>

            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={LAG_WAVE_SERIES}
                  margin={{ top: 12, right: 16, left: -10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="wave"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 42]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    unit=" 筆"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 8]}
                    tick={{ fontSize: 11, fill: '#B91C1C' }}
                    axisLine={false}
                    tickLine={false}
                    unit=" 篇"
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      `${val} ${String(name).includes('總') ? '筆' : '篇'}`,
                      String(name),
                    ]}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '10px',
                      borderColor: '#E2E8F0',
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="campaignVolume"
                    name="活動波峰總聲量"
                    fill="#6366F1"
                    fillOpacity={0.85}
                    radius={[5, 5, 0, 0]}
                    barSize={32}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={lagMetricKey}
                    name="對應負面文章數"
                    stroke="#DC2626"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: '#DC2626', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#991B1B' }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>滯後關聯關鍵發現</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                高曝光波峰後 24 小時（T+1）為負評轉折高風險窗口
              </h4>
              <p className="text-xs leading-relaxed text-slate-700">
                對比報告 9/8（37 筆）、9/16 當週（30 篇）與 9/17（單日 6 篇負評）節奏可見：負評極少在促銷首日同步引爆，而是在高聲量擴散後的隔日（T+1，相關係數{' '}
                <span className="font-mono-num font-bold text-red-700">r = +0.84</span>
                ）因實際體感與預期落差集中浮現。
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>建議應對窗口</span>
                <span className="font-mono-num font-semibold text-slate-900">波峰後 0–48h</span>
              </div>
              <div className="flex items-center justify-between">
                <span>高風險觸發因素</span>
                <span className="font-medium text-red-700">效果不明顯・規格查證</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Channel Exposure vs Negative Sensitivity Scatter */}
      {mode === 'channel_matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-500">
              <span>橫軸：渠道曝光與活躍度 ｜ 縱軸：負評／質疑敏感度（點擊氣泡檢視平台診斷）</span>
              <span className="font-mono-num text-indigo-700 font-medium">7 大來源平台</span>
            </div>

            <div className="w-full h-[255px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 20, left: -8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    dataKey="exposureIndex"
                    name="曝光活躍度"
                    domain={[40, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    unit="%"
                  />
                  <YAxis
                    type="number"
                    dataKey="negativeSensitivity"
                    name="負評敏感度"
                    domain={[10, 95]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    unit="%"
                  />
                  <ZAxis type="number" dataKey="shareWeight" range={[120, 420]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(val, name) => [`${val}%`, String(name)]}
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload?.channel ?? ''
                    }
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '10px',
                      borderColor: '#E2E8F0',
                    }}
                  />
                  <Scatter
                    data={CHANNEL_SCATTER_DATA}
                    isAnimationActive={false}
                    onClick={(node) => {
                      if (node?.payload) {
                        setSelectedChannel(node.payload as ChannelScatterPoint);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {CHANNEL_SCATTER_DATA.map((entry) => (
                      <Cell
                        key={entry.channel}
                        fill={
                          entry.negativeSensitivity >= 65
                            ? '#DC2626'
                            : entry.exposureIndex >= 75
                              ? '#4F46E5'
                              : '#059669'
                        }
                        stroke={
                          selectedChannel.channel === entry.channel ? '#0F172A' : '#FFFFFF'
                        }
                        strokeWidth={selectedChannel.channel === entry.channel ? 2.5 : 1.5}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-indigo-700">
                  <GitCommitHorizontal className="w-3.5 h-3.5" />
                  <span>平台關聯剖析</span>
                </span>
                <span className="font-mono-num text-slate-600">
                  負評敏感 {selectedChannel.negativeSensitivity}%
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{selectedChannel.channel}</h4>
              <p className="text-xs font-medium text-indigo-700">{selectedChannel.role}</p>
              <p className="text-xs leading-relaxed text-slate-700">{selectedChannel.insight}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="block text-[11px] text-slate-500 mb-1.5">快速切換平台：</span>
              <div className="flex flex-wrap gap-1.5">
                {CHANNEL_SCATTER_DATA.map((ch) => (
                  <button
                    key={ch.channel}
                    type="button"
                    onClick={() => setSelectedChannel(ch)}
                    className={`px-2 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                      selectedChannel.channel === ch.channel
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {ch.channel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Topic / Keyword Co-occurrence with Volume vs Negative Risk */}
      {mode === 'topic_cooccurrence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
          <div className="lg:col-span-8 flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-500">
              <span>比較各核心主題「拉抬總聲量強度（靛藍）」與「觸發負評風險關聯度（紅）」</span>
              <span>點擊長條檢視議題判讀</span>
            </div>

            <div className="w-full h-[255px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={TOPIC_CORRELATION_DATA}
                  margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
                  onClick={(state) => {
                    const label = state?.activeLabel;
                    const found = TOPIC_CORRELATION_DATA.find((t) => t.topic === label);
                    if (found) setSelectedTopic(found);
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="topic"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                  />
                  <Tooltip
                    formatter={(val, name) => [`${val}%`, String(name)]}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '10px',
                      borderColor: '#E2E8F0',
                    }}
                  />
                  <Bar
                    dataKey="volumeCorrPct"
                    name="聲量拉抬關聯度"
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    isAnimationActive={false}
                    className="cursor-pointer"
                  />
                  <Bar
                    dataKey="riskCorrPct"
                    name="負評風險關聯度"
                    fill="#DC2626"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                    isAnimationActive={false}
                    className="cursor-pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-indigo-700">話題共現關聯診斷</span>
              <h4 className="text-base font-bold text-slate-900">{selectedTopic.topic}</h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="block text-[10px] text-slate-500">聲量拉抬關聯</span>
                  <span className="text-base font-bold font-mono-num text-indigo-700">
                    {selectedTopic.volumeCorrPct}%
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="block text-[10px] text-slate-500">負評風險關聯</span>
                  <span className="text-base font-bold font-mono-num text-red-700">
                    {selectedTopic.riskCorrPct}%
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-700">{selectedTopic.note}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <span className="block text-[11px] text-slate-500 mb-1.5">切換主題檢視：</span>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_CORRELATION_DATA.map((item) => (
                  <button
                    key={item.topic}
                    type="button"
                    onClick={() => setSelectedTopic(item)}
                    className={`px-2 py-1 text-[11px] rounded border transition-colors cursor-pointer ${
                      selectedTopic.topic === item.topic
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {item.topic.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
