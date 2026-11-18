import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  analyzeKeywordInTranscript,
  KEYWORD_CLOUD_ITEMS,
  type KeywordCategory,
  type MarketKeywordCloudItem,
} from '../data/reportData';

interface AnimatedKeywordCloudProps {
  activeCategory: 'all' | KeywordCategory;
  selectedTerm: string;
  globalQuery: string;
  localQuery?: string;
  coverageFilter?: 'all' | 'high_coverage' | 'core_only' | 'custom_only';
  onSelectCloudTerm: (term: string, keywordId?: string) => void;
}

export function AnimatedKeywordCloud({
  activeCategory,
  selectedTerm,
  globalQuery,
  localQuery = '',
  coverageFilter = 'all',
  onSelectCloudTerm,
}: AnimatedKeywordCloudProps) {
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  const cloudMetrics = useMemo(() => {
    return KEYWORD_CLOUD_ITEMS.map((item, index) => {
      const analysis = analyzeKeywordInTranscript(item.term);
      return {
        ...item,
        index,
        occurrences: analysis.totalOccurrences,
        coveragePct: analysis.sectionCoveragePct,
      };
    });
  }, []);

  const getSizeClass = (weight: number) => {
    if (weight >= 5) return 'text-xl sm:text-2xl px-4 py-2 font-bold';
    if (weight === 4) return 'text-base sm:text-lg px-3.5 py-1.5 font-bold';
    if (weight === 3) return 'text-sm sm:text-base px-3 py-1 font-semibold';
    return 'text-xs sm:text-sm px-2.5 py-1 font-medium';
  };

  const getCategoryTone = (
    item: MarketKeywordCloudItem,
    isSelected: boolean,
    isDimmed: boolean
  ) => {
    if (isSelected) {
      return 'bg-indigo-600 text-white border-indigo-300 shadow-lg shadow-indigo-900/50';
    }
    if (isDimmed) {
      return 'bg-white/5 text-indigo-200/35 border-white/10';
    }
    switch (item.category) {
      case 'core':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50 hover:bg-emerald-500/30';
      case 'spec':
        return 'bg-indigo-500/20 text-indigo-100 border-indigo-400/40 hover:bg-indigo-500/35';
      case 'context':
        return 'bg-sky-500/20 text-sky-100 border-sky-400/40 hover:bg-sky-500/30';
      case 'brand_channel':
        return 'bg-white/10 text-white border-white/25 hover:bg-white/20';
    }
  };

  const activeHoverItem = useMemo(
    () => cloudMetrics.find((c) => c.term === (hoveredTerm ?? selectedTerm)) ?? cloudMetrics[0],
    [cloudMetrics, hoveredTerm, selectedTerm]
  );

  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#13153D] via-[#1C174E] to-[#0F172A] text-white border border-indigo-950/70 p-5 sm:p-6 overflow-hidden">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/15">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-num text-emerald-300 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>市場關鍵字雲 · 聲量語境即時聯動</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
            葉黃素市場關鍵字星雲（點擊詞彙即時鎖定右側剖析）
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-indigo-200/80">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>核心</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>規格成分</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>使用情境</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>品牌通路</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Keyword Cloud Field */}
      <div className="py-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[168px]">
        {cloudMetrics.map((item) => {
          const isSelected = selectedTerm.toLowerCase() === item.term.toLowerCase();
          const matchesCategory =
            activeCategory === 'all' ||
            activeCategory === 'custom' ||
            item.category === activeCategory;
          const matchesGlobal =
            !globalQuery.trim() ||
            item.term.toLowerCase().includes(globalQuery.trim().toLowerCase());
          const matchesLocal =
            !localQuery.trim() ||
            item.term.toLowerCase().includes(localQuery.trim().toLowerCase()) ||
            item.categoryLabel.toLowerCase().includes(localQuery.trim().toLowerCase());
          const matchesCoverage =
            coverageFilter === 'all' ||
            (coverageFilter === 'high_coverage' && item.coveragePct >= 50) ||
            (coverageFilter === 'core_only' && Boolean(item.keywordId)) ||
            (coverageFilter === 'custom_only' && !item.keywordId);
          const isDimmed =
            !matchesCategory ||
            (!matchesGlobal && !isSelected) ||
            (!matchesLocal && !isSelected) ||
            (!matchesCoverage && !isSelected);

          return (
            <button
              key={item.term}
              type="button"
              onClick={() => onSelectCloudTerm(item.term, item.keywordId)}
              onMouseEnter={() => setHoveredTerm(item.term)}
              onMouseLeave={() => setHoveredTerm(null)}
              className={`rounded-xl border transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer inline-flex items-baseline gap-1.5 select-none ${getSizeClass(
                item.weight
              )} ${getCategoryTone(item, isSelected, isDimmed)}`}
            >
              <span>{item.term}</span>
              <span className="text-[10px] font-mono-num opacity-75">
                {item.occurrences}次
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Live Cloud Readout Strip */}
      <div className="pt-3.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-indigo-100">
          <span className="px-2 py-0.5 rounded bg-[#063632]/90 border border-emerald-400/35 text-emerald-300 font-mono-num text-[11px]">
            焦點詞：{activeHoverItem.term}
          </span>
          <span className="text-indigo-200/90">
            類別：{activeHoverItem.categoryLabel} · 輿情分析報告出現 {activeHoverItem.occurrences} 次（涵蓋{' '}
            {activeHoverItem.coveragePct}% 章節）
          </span>
        </div>
        <span className="text-[11px] font-mono-num text-indigo-200/75">
          點擊任一關鍵字可同步展開評論摘要與段落原文
        </span>
      </div>
    </div>
  );
}
