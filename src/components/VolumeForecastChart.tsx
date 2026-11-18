import { SlidersHorizontal, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
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

interface ForecastPoint {
  day: string;
  phase: '歷史基準' | '兩週預測';
  historical: number | null;
  forecast: number | null;
  upperBound: number | null;
  lowerBound: number | null;
  forecastRange: [number, number] | null;
  eventTag?: string;
  eventCategory?: 'promo' | 'safety_trust' | 'routine';
  backgroundSummary: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | null;
    payload?: ForecastPoint;
  }>;
  label?: string;
}

function ForecastTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const isForecast = point.phase === '兩週預測';
  const mainValue = isForecast ? point.forecast : point.historical;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-3 text-xs max-w-[300px]">
      <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-100">
        <span className="font-mono-num font-bold text-slate-900">{label}</span>
        <span
          className={`font-medium px-1.5 py-0.5 rounded text-[10px] ${
            point.eventCategory === 'safety_trust'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : point.eventCategory === 'promo'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : isForecast
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
          }`}
        >
          {point.eventTag ?? point.phase}
        </span>
      </div>
      {mainValue !== null && (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">
              {isForecast ? '預測日聲量' : '基準日聲量'}
            </span>
            <span className="font-mono-num font-bold text-slate-900">
              {mainValue.toFixed(1)} 筆
            </span>
          </div>
          {isForecast && point.lowerBound !== null && point.upperBound !== null && (
            <div className="flex items-center justify-between gap-4 text-[11px] text-slate-500">
              <span>波動區間</span>
              <span className="font-mono-num">
                {point.lowerBound.toFixed(1)} – {point.upperBound.toFixed(1)} 筆
              </span>
            </div>
          )}
          <p className="pt-2 mt-1.5 border-t border-slate-100 text-[11px] leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">情境背景：</span>
            {point.backgroundSummary}
          </p>
          {mainValue >= 18 && (
            <div className="pt-1 text-[11px] font-medium text-red-700">
              已達異常警戒線（≥ 18 筆/日）
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Anchored on 10月 182筆 (avg 5.9/day) & 8月 180筆 (avg 5.8/day)
const HISTORICAL_TAIL = [
  { day: '前6日', value: 5.6 },
  { day: '前5日', value: 6.1 },
  { day: '前4日', value: 5.8 },
  { day: '前3日', value: 6.3 },
  { day: '前2日', value: 5.7 },
  { day: '前1日', value: 6.0 },
  { day: '基準日', value: 5.9 },
];

export function VolumeForecastChart() {
  // Interactive sliders requested by user: 大促期間、淡季影響 + 波動延續係數
  const [promoIntensity, setPromoIntensity] = useState<number>(85); // % boost (0 to 250)
  const [offSeasonImpact, setOffSeasonImpact] = useState<number>(10); // % drag (0 to 45)
  const [momentumWeight, setMomentumWeight] = useState<number>(1.0); // 0.6x to 1.6x
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);

  const applyPreset = (promo: number, offSeason: number, momentum: number) => {
    setPromoIntensity(promo);
    setOffSeasonImpact(offSeason);
    setMomentumWeight(momentum);
  };

  const { chartData, summaryStats } = useMemo(() => {
    const baseDaily = 5.9; // Derived from Oct 182 / 31 ≈ 5.87 & Aug 180 / 31 ≈ 5.81
    const netSeasonMultiplier = Math.max(0.45, 1 - offSeasonImpact / 100);
    const promoFactor = promoIntensity / 100;

    const data: ForecastPoint[] = HISTORICAL_TAIL.map((h, idx) => ({
      day: h.day,
      phase: '歷史基準',
      historical: h.value,
      // Connect last historical point smoothly to forecast start
      forecast: idx === HISTORICAL_TAIL.length - 1 ? h.value : null,
      upperBound: idx === HISTORICAL_TAIL.length - 1 ? h.value : null,
      lowerBound: idx === HISTORICAL_TAIL.length - 1 ? h.value : null,
      forecastRange: idx === HISTORICAL_TAIL.length - 1 ? [h.value, h.value] : null,
      eventCategory: 'routine',
      eventTag: idx === HISTORICAL_TAIL.length - 1 ? '基準銜接點' : '歷史日常基準',
      backgroundSummary:
        idx === HISTORICAL_TAIL.length - 1
          ? '依據 8 月與 10 月穩定討論（約 5.9 筆/日）作為未來 14 天預測基準起點。'
          : '日常 3C 護眼請益與成分比價維持平穩水位（約 5.6–6.3 筆/日）。',
    }));

    let total14Day = 0;
    let peakVal = 0;
    let peakDay = '第 1 天';
    let peakDayCode = 'D+6';
    let alertDaysCount = 0;

    // Simulate next 14 days (兩週)
    for (let d = 1; d <= 14; d++) {
      // Bell-shaped campaign surge centered around Day 6–8 (mirroring 9/8 & 9/16 mid-period bursts)
      const promoCurve = Math.exp(-Math.pow((d - 6.5) / (2.4 * momentumWeight), 2));
      // Subtle organic weekend/mid-week ripple
      const organicRipple = Math.sin(d * 0.9) * 0.35;
      const simulated =
        (baseDaily * netSeasonMultiplier + baseDaily * promoFactor * promoCurve * 1.45 + organicRipple) *
        (1 + (momentumWeight - 1) * 0.08);

      const clamped = Math.max(2.2, Number(simulated.toFixed(1)));
      const bandWidth = Math.max(0.8, clamped * 0.16 * momentumWeight);
      const upper = Number((clamped + bandWidth).toFixed(1));
      const lower = Number(Math.max(1.5, clamped - bandWidth).toFixed(1));

      total14Day += clamped;
      if (clamped > peakVal) {
        peakVal = clamped;
        peakDay = `第 ${d} 天`;
        peakDayCode = `D+${d}`;
      }
      if (clamped >= 18) {
        alertDaysCount += 1;
      }

      let eventCategory: 'promo' | 'safety_trust' | 'routine' = 'routine';
      let eventTag = '日常延續期';
      let backgroundSummary =
        '社群回歸例行配方討論與電商比價，維持穩定負評管控觀察。';

      if (d === 3 && promoIntensity >= 40) {
        eventCategory = 'promo';
        eventTag = '節慶促銷預熱';
        backgroundSummary =
          '檔期折扣與聯名預告開始擴散，iHerb／Coupang 優惠討論升溫，進入波峰前導期。';
      } else if ((d === 6 || d === 7) && promoIntensity >= 40) {
        eventCategory = 'promo';
        eventTag = '模擬活動／聯名高峰';
        backgroundSummary =
          '大促折扣與話題聯名疊加發酵，帶動導購分享與跨平台開箱轉載達到預測峰值。';
      } else if (d === 8 && promoIntensity >= 60) {
        eventCategory = 'safety_trust';
        eventTag = '峰後負評與檢驗監測窗口';
        backgroundSummary =
          '參照 9/16→9/17 歷史轉折，高曝光隔日易引發「產品效果」與成分檢驗查證訴求，須提前備妥檢驗聲明。';
      }

      data.push({
        day: `D+${d}`,
        phase: '兩週預測',
        historical: null,
        forecast: clamped,
        upperBound: upper,
        lowerBound: lower,
        forecastRange: [lower, upper],
        eventCategory,
        eventTag,
        backgroundSummary,
      });
    }

    const baseline14DayTotal = baseDaily * 14;
    const changeVsBaselinePct = ((total14Day - baseline14DayTotal) / baseline14DayTotal) * 100;

    return {
      chartData: data,
      summaryStats: {
        total14Day: Math.round(total14Day),
        avgDaily: (total14Day / 14).toFixed(1),
        peakVal: peakVal.toFixed(1),
        peakDay,
        peakDayCode,
        changeVsBaselinePct: changeVsBaselinePct.toFixed(1),
        alertDaysCount,
      },
    };
  }, [promoIntensity, offSeasonImpact, momentumWeight]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Recharts 動態預測模擬 · 未來兩週（14 天）</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            聲量預測圖表（接下來兩週日趨勢模擬）
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            以 8–10 月日常日均基準（5.9 筆/日）與 9 月波峰結構為依據，即時調整下方大促與淡季參數滑桿觀察未來 14 天走向。
          </p>
        </div>

        {/* Quick Scenario Presets */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="text-xs text-slate-500 mr-1">快速情境：</span>
          <button
            type="button"
            onClick={() => applyPreset(0, 25, 0.85)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            淡季常態
          </button>
          <button
            type="button"
            onClick={() => applyPreset(85, 10, 1.0)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            一般促銷波段
          </button>
          <button
            type="button"
            onClick={() => applyPreset(220, 0, 1.3)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            大促期間衝刺
          </button>
        </div>
      </div>

      {/* Main Content: Left Recharts Chart + Right Sliders & Readouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
        {/* Left: Recharts ComposedChart */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block" aria-hidden="true" />
                <span>過往基準走勢</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" aria-hidden="true" />
                <span>兩週模擬預測</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-red-600 inline-block" aria-hidden="true" />
                <span>異常警戒線 (18 筆/日)</span>
              </span>
            </div>

            <label className="inline-flex items-center gap-2 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showConfidenceBand}
                onChange={(e) => setShowConfidenceBand(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
              />
              <span>顯示波動區間</span>
            </label>
          </div>

          <div className="w-full h-[275px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 14, right: 16, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, (dataMax: number) => Math.max(24, Math.ceil(dataMax + 4))]}
                  unit=" 筆"
                />
                <Tooltip content={<ForecastTooltip />} />
                <ReferenceLine
                  x="基準日"
                  stroke="#94A3B8"
                  strokeDasharray="3 3"
                  label={{
                    value: '兩週預測起點 →',
                    position: 'insideTopRight',
                    fill: '#64748B',
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={18}
                  stroke="#DC2626"
                  strokeDasharray="4 4"
                  strokeOpacity={0.7}
                />

                {showConfidenceBand && (
                  <Area
                    type="monotone"
                    dataKey="forecastRange"
                    stroke="none"
                    fill="#10B981"
                    fillOpacity={0.16}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="historical"
                  name="過往基準"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4F46E5', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#4F46E5' }}
                  connectNulls={false}
                  isAnimationActive={false}
                />

                <Line
                  type="monotone"
                  dataKey="forecast"
                  name="兩週預測"
                  stroke="#059669"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 3.5, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 5.5, fill: '#059669' }}
                  connectNulls={false}
                  isAnimationActive={false}
                />

                {promoIntensity >= 40 && (
                  <ReferenceDot
                    x={summaryStats.peakDayCode}
                    y={Number(summaryStats.peakVal)}
                    r={6}
                    fill="#4F46E5"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
                {promoIntensity >= 60 && (() => {
                  const d8 = chartData.find((p) => p.day === 'D+8');
                  if (!d8 || d8.forecast === null) return null;
                  return (
                    <ReferenceDot
                      x="D+8"
                      y={d8.forecast}
                      r={5.5}
                      fill="#DC2626"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                })()}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Parameter Sliders & Forecast Readout */}
        <div className="lg:col-span-4 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-700" />
              <span>預測參數滑桿調整</span>
            </div>

            {/* Slider 1: 大促期間強度 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-promo" className="text-slate-700 font-medium">
                  大促期間／聯名強度
                </label>
                <span className="font-mono-num font-semibold text-indigo-700">
                  +{promoIntensity}%
                </span>
              </div>
              <input
                id="slider-promo"
                type="range"
                min={0}
                max={250}
                step={5}
                value={promoIntensity}
                onChange={(e) => setPromoIntensity(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                <span>無促銷 (0%)</span>
                <span>大促高峰 (+250%)</span>
              </div>
            </div>

            {/* Slider 2: 淡季影響 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-offseason" className="text-slate-700 font-medium">
                  淡季影響／需求回落
                </label>
                <span className="font-mono-num font-semibold text-slate-900">
                  -{offSeasonImpact}%
                </span>
              </div>
              <input
                id="slider-offseason"
                type="range"
                min={0}
                max={45}
                step={5}
                value={offSeasonImpact}
                onChange={(e) => setOffSeasonImpact(Number(e.target.value))}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                <span>無影響 (0%)</span>
                <span>明顯淡季 (-45%)</span>
              </div>
            </div>

            {/* Slider 3: 話題延續度 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-momentum" className="text-slate-700 font-medium">
                  社群話題延續係數
                </label>
                <span className="font-mono-num font-semibold text-emerald-700">
                  {momentumWeight.toFixed(1)}x
                </span>
              </div>
              <input
                id="slider-momentum"
                type="range"
                min={0.6}
                max={1.6}
                step={0.1}
                value={momentumWeight}
                onChange={(e) => setMomentumWeight(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono-num text-slate-400">
                <span>快速消退 (0.6x)</span>
                <span>長尾擴散 (1.6x)</span>
              </div>
            </div>
          </div>

          {/* Forecast Summary Readouts */}
          <dl className="divide-y divide-slate-200 border-t border-slate-200 pt-2 text-xs">
            <div className="py-2 flex items-baseline justify-between gap-2">
              <dt className="text-slate-600">未來 14 天預估總聲量</dt>
              <dd className="font-mono-num font-bold text-slate-900">
                {summaryStats.total14Day} 筆
                <span className="text-slate-500 font-normal ml-1">
                  ({Number(summaryStats.changeVsBaselinePct) >= 0 ? `+${summaryStats.changeVsBaselinePct}%` : `${summaryStats.changeVsBaselinePct}%`})
                </span>
              </dd>
            </div>
            <div className="py-2 flex items-baseline justify-between gap-2">
              <dt className="text-slate-600">模擬單日高峰</dt>
              <dd className="font-mono-num font-semibold text-indigo-700">
                {summaryStats.peakVal} 筆（{summaryStats.peakDay}）
              </dd>
            </div>
            <div className="py-2 flex items-baseline justify-between gap-2">
              <dt className="text-slate-600">突破警戒線天數（≥ 18 筆）</dt>
              <dd
                className={`font-mono-num font-semibold ${
                  summaryStats.alertDaysCount > 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {summaryStats.alertDaysCount} 天
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
