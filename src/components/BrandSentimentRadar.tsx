import { Compass, Info } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  BRAND_RADAR_BRANDS,
  BRAND_RADAR_DIMENSIONS,
  type BrandRadarBrandMeta,
  type GlobalFilterResult,
  type RadarDimensionKey,
} from '../data/reportData';

interface BrandSentimentRadarProps {
  globalFilter?: GlobalFilterResult;
}

interface RadarRow {
  dimensionKey: RadarDimensionKey;
  dimension: string;
  daiken: number;
  centrum: number;
  crossborder: number;
  market: number;
}

interface RadarTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: RadarRow;
  }>;
}

function CustomRadarTooltip({ active, payload }: RadarTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3.5 py-2.5 text-xs min-w-[200px]">
      <div className="font-bold text-slate-900 pb-1.5 mb-1.5 border-b border-slate-100">
        維度：{row.dimension}情緒極性指數
      </div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color ?? '#4F46E5' }}
              />
              <span>{entry.name}</span>
            </span>
            <span className="font-mono-num font-bold text-slate-900">
              {entry.value} / 100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BrandSentimentRadar({ globalFilter }: BrandSentimentRadarProps) {
  const [selectedBrandIds, setSelectedBrandIds] = useState<BrandRadarBrandMeta['id'][]>([
    'daiken',
    'centrum',
    'crossborder',
  ]);
  const [activeDimKey, setActiveDimKey] = useState<RadarDimensionKey>('efficacy');

  // Auto-ensure globally searched brand is included on the radar
  useEffect(() => {
    if (!globalFilter?.isActive || !globalFilter.matchedProfile) return;
    const key = globalFilter.matchedProfile.key;
    const targetId: BrandRadarBrandMeta['id'] | null =
      key === 'daiken'
        ? 'daiken'
        : key === 'centrum'
          ? 'centrum'
          : key === 'iherb' || key === 'coupang'
            ? 'crossborder'
            : key === 'lutein'
              ? 'market'
              : null;

    if (targetId) {
      setSelectedBrandIds((prev) => (prev.includes(targetId) ? prev : [targetId, ...prev]));
    }
  }, [globalFilter]);

  const toggleBrand = (id: BrandRadarBrandMeta['id']) => {
    setSelectedBrandIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1 brand polygon visible
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const chartData = useMemo<RadarRow[]>(() => {
    const byId = Object.fromEntries(BRAND_RADAR_BRANDS.map((b) => [b.id, b])) as Record<
      BrandRadarBrandMeta['id'],
      BrandRadarBrandMeta
    >;
    return BRAND_RADAR_DIMENSIONS.map((dim) => ({
      dimensionKey: dim.key,
      dimension: dim.label,
      daiken: byId.daiken.scores[dim.key],
      centrum: byId.centrum.scores[dim.key],
      crossborder: byId.crossborder.scores[dim.key],
      market: byId.market.scores[dim.key],
    }));
  }, []);

  const selectedBrands = useMemo(
    () => BRAND_RADAR_BRANDS.filter((b) => selectedBrandIds.includes(b.id)),
    [selectedBrandIds]
  );

  const activeDimMeta = useMemo(
    () =>
      BRAND_RADAR_DIMENSIONS.find((d) => d.key === activeDimKey) ??
      BRAND_RADAR_DIMENSIONS[0],
    [activeDimKey]
  );

  return (
    <div
      id="brand-sentiment-radar"
      className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-5 scroll-mt-24"
    >
      {/* Header + Multi-brand Checkboxes */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Recharts 品牌情緒雷達圖 · 四維度極性多選對比</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            品牌情緒雷達圖（價格・功效・成份・副作用）
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            勾選多組品牌／通路同時疊加比較四個核心維度的正向情緒極性指數（0–100，數值越高代表正面與安心情緒越強）。
          </p>
        </div>

        {/* Multi-select brand checkboxes */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {BRAND_RADAR_BRANDS.map((brand) => {
            const isChecked = selectedBrandIds.includes(brand.id);
            return (
              <label
                key={brand.id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
                  isChecked
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: brand.color }}
                  aria-hidden="true"
                />
                <span>{brand.shortName}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Main Split: Left RadarChart + Right Dimension Polarity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/50 border border-slate-200/80 rounded-xl p-4">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="74%" data={chartData}>
                <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={45}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                />
                <Tooltip content={<CustomRadarTooltip />} />
                {selectedBrands.map((brand) => (
                  <Radar
                    key={brand.id}
                    name={brand.shortName}
                    dataKey={brand.id}
                    stroke={brand.color}
                    strokeWidth={2.5}
                    fill={brand.color}
                    fillOpacity={brand.fillOpacity}
                    isAnimationActive={false}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              資料說明：原報告公開全市場正面情緒占 72% 與負評主因（效果不明顯）及各品牌語境定位；本雷達圖據此結構化呈現四維度相對情緒極性指數，供多品牌策略比較。
            </span>
          </div>
        </div>

        {/* Right: Interactive 4-Dimension Inspector */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Dimension Tabs */}
          <div>
            <span className="block text-xs font-semibold text-slate-900 mb-2">
              切換檢視各維度情緒極性差異：
            </span>
            <div
              role="tablist"
              aria-label="雷達圖四維度檢視"
              className="grid grid-cols-4 gap-2"
            >
              {BRAND_RADAR_DIMENSIONS.map((dim) => {
                const isActive = dim.key === activeDimKey;
                return (
                  <button
                    key={dim.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveDimKey(dim.key)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {dim.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Dimension Context */}
          <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-950">
                {activeDimMeta.label}維度 · {activeDimMeta.subtitle}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              {activeDimMeta.reportContext}
            </p>
          </div>

          {/* Selected Brands Score & Explanation on Active Dimension */}
          <div className="space-y-2.5">
            {selectedBrands.map((brand) => {
              const score = brand.scores[activeDimKey];
              return (
                <div
                  key={brand.id}
                  className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: brand.color }}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {brand.name}
                      </span>
                    </div>
                    <span className="font-mono-num text-sm font-bold text-slate-900">
                      {score}{' '}
                      <span className="text-[11px] font-normal text-slate-500">/ 100</span>
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${score}%`,
                        backgroundColor: brand.color,
                      }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brand.dimensionNotes[activeDimKey]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
