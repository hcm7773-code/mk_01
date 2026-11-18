import { ArrowUpDown, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import {
  analyzeKeywordInTranscript,
  KEYWORDS_DATA,
  SUGGESTED_CUSTOM_KEYWORDS,
  type GlobalFilterResult,
  type KeywordCategory,
  type KeywordItem,
} from '../data/reportData';
import { AnimatedKeywordCloud } from './AnimatedKeywordCloud';

function highlightMatch(text: string, term: string) {
  const clean = term.trim();
  if (!clean) return text;
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    regex.test(part) ? (
      <mark key={idx} className="bg-indigo-100 text-indigo-950 px-0.5 rounded-xs font-medium">
        {part}
      </mark>
    ) : (
      <Fragment key={idx}>{part}</Fragment>
    )
  );
}

const CUSTOM_CATEGORY_OPTIONS: { key: KeywordCategory; label: string }[] = [
  { key: 'spec', label: '產品規格與成分' },
  { key: 'context', label: '使用情境與需求' },
  { key: 'brand_channel', label: '品牌與通路' },
  { key: 'custom', label: '自訂觀察關鍵字' },
];

interface KeywordMatrixSectionProps {
  globalFilter: GlobalFilterResult;
  onClearGlobalFilter: () => void;
}

type CoverageFilter = 'all' | 'high_coverage' | 'core_only' | 'custom_only';
type KeywordSortBy = 'default' | 'occurrences_desc' | 'coverage_desc';

export function KeywordMatrixSection({
  globalFilter,
  onClearGlobalFilter,
}: KeywordMatrixSectionProps) {
  const [keywords, setKeywords] = useState<KeywordItem[]>(KEYWORDS_DATA);
  const [activeCategory, setActiveCategory] = useState<'all' | KeywordCategory>('all');
  const [keywordSearch, setKeywordSearch] = useState('');
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>('all');
  const [sortBy, setSortBy] = useState<KeywordSortBy>('default');
  const [selectedId, setSelectedId] = useState<string>(KEYWORDS_DATA[1].id);

  // Add-keyword form state
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newCategory, setNewCategory] = useState<KeywordCategory>('spec');
  const [newNote, setNewNote] = useState('');
  const [formError, setFormError] = useState('');

  // Live transcript analysis for every keyword (built-in and user-added)
  const keywordAnalyses = useMemo(() => {
    const map = new Map<string, ReturnType<typeof analyzeKeywordInTranscript>>();
    keywords.forEach((k) => {
      map.set(k.id, analyzeKeywordInTranscript(k.term));
    });
    return map;
  }, [keywords]);

  const categoryFilters = useMemo(() => {
    const base: { key: 'all' | KeywordCategory; label: string; count: number }[] = [
      { key: 'all', label: '全部關鍵字', count: keywords.length },
      {
        key: 'spec',
        label: '規格與成分',
        count: keywords.filter((k) => k.category === 'spec').length,
      },
      {
        key: 'context',
        label: '使用情境',
        count: keywords.filter((k) => k.category === 'context').length,
      },
      {
        key: 'brand_channel',
        label: '品牌與通路',
        count: keywords.filter((k) => k.category === 'brand_channel').length,
      },
    ];
    const customCount = keywords.filter((k) => k.category === 'custom').length;
    if (customCount > 0) {
      base.push({ key: 'custom', label: '自訂觀察', count: customCount });
    }
    return base;
  }, [keywords]);

  const globalMatchedKeywords = useMemo(() => {
    if (!globalFilter.isActive) return keywords;
    const q = globalFilter.query.toLowerCase();
    const relatedIds = globalFilter.matchedProfile?.relatedKeywordIds ?? [];
    return keywords.filter((item) => {
      if (relatedIds.includes(item.id)) return true;
      return (
        item.term.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.insight.toLowerCase().includes(q) ||
        item.commentSummary.toLowerCase().includes(q) ||
        item.relatedTopics.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [keywords, globalFilter]);

  const filteredKeywords = useMemo(() => {
    const localQ = keywordSearch.trim().toLowerCase();

    const list = globalMatchedKeywords.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }

      if (localQ) {
        const hit =
          item.term.toLowerCase().includes(localQ) ||
          item.role.toLowerCase().includes(localQ) ||
          item.categoryLabel.toLowerCase().includes(localQ) ||
          item.insight.toLowerCase().includes(localQ) ||
          item.commentSummary.toLowerCase().includes(localQ) ||
          item.relatedTopics.some((t) => t.toLowerCase().includes(localQ));
        if (!hit) return false;
      }

      const stats = keywordAnalyses.get(item.id);
      if (coverageFilter === 'high_coverage') {
        if (!stats || stats.sectionCoveragePct < 50) return false;
      } else if (coverageFilter === 'core_only') {
        if (item.isCustom) return false;
      } else if (coverageFilter === 'custom_only') {
        if (!item.isCustom) return false;
      }

      return true;
    });

    if (sortBy === 'default') return list;

    return [...list].sort((a, b) => {
      const sa = keywordAnalyses.get(a.id);
      const sb = keywordAnalyses.get(b.id);
      if (sortBy === 'occurrences_desc') {
        return (sb?.totalOccurrences ?? 0) - (sa?.totalOccurrences ?? 0);
      }
      return (sb?.sectionCoveragePct ?? 0) - (sa?.sectionCoveragePct ?? 0);
    });
  }, [globalMatchedKeywords, activeCategory, keywordSearch, coverageFilter, sortBy, keywordAnalyses]);

  const hasLocalFilterActive =
    activeCategory !== 'all' ||
    keywordSearch.trim() !== '' ||
    coverageFilter !== 'all' ||
    sortBy !== 'default';

  const handleResetLocalFilters = () => {
    setActiveCategory('all');
    setKeywordSearch('');
    setCoverageFilter('all');
    setSortBy('default');
  };

  useEffect(() => {
    if (filteredKeywords.length > 0 && !filteredKeywords.some((k) => k.id === selectedId)) {
      setSelectedId(filteredKeywords[0].id);
    }
  }, [filteredKeywords, selectedId]);

  const selectedKeyword = useMemo(
    () => filteredKeywords.find((k) => k.id === selectedId) ?? filteredKeywords[0] ?? null,
    [filteredKeywords, selectedId]
  );

  const selectedAnalysis = useMemo(
    () =>
      selectedKeyword
        ? keywordAnalyses.get(selectedKeyword.id) ?? analyzeKeywordInTranscript(selectedKeyword.term)
        : analyzeKeywordInTranscript(globalFilter.query || keywordSearch),
    [selectedKeyword, keywordAnalyses, globalFilter.query, keywordSearch]
  );
  const livePreviewAnalysis = useMemo(() => analyzeKeywordInTranscript(newTerm), [newTerm]);

  const handleCategoryChange = (cat: 'all' | KeywordCategory) => {
    setActiveCategory(cat);
    const nextList =
      cat === 'all'
        ? globalMatchedKeywords
        : globalMatchedKeywords.filter((k) => k.category === cat);
    if (nextList.length > 0 && !nextList.some((k) => k.id === selectedKeyword?.id)) {
      setSelectedId(nextList[0].id);
    }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTerm.trim();
    if (!trimmed) {
      setFormError('請輸入欲分析的關鍵字名稱。');
      return;
    }
    const duplicate = keywords.find(
      (k) => k.term.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setSelectedId(duplicate.id);
      setActiveCategory('all');
      setFormError(`「${duplicate.term}」已在關鍵字矩陣中，已為您定位該項目。`);
      return;
    }

    const analysis = analyzeKeywordInTranscript(trimmed);
    const categoryOption = CUSTOM_CATEGORY_OPTIONS.find((c) => c.key === newCategory);
    const matchedHeadings = analysis.sectionDistribution
      .filter((s) => s.matches > 0)
      .map((s) => s.heading);

    const customSummary =
      analysis.totalOccurrences > 0
        ? `此關鍵字於上傳輿情分析報告中共出現 ${analysis.totalOccurrences} 次，涵蓋 ${analysis.matchedSectionsCount} 個章節（${analysis.sectionCoveragePct}% 章節覆蓋率）。${
            newNote.trim() ? `自訂觀察：${newNote.trim()}` : '下方列出輿情分析報告關聯段落摘錄供交互比對。'
          }`
        : newNote.trim()
          ? `輿情分析報告原文未直接出現「${trimmed}」，以下顯示您的自訂觀察筆記：${newNote.trim()}`
          : `輿情分析報告原文未直接出現「${trimmed}」（出現 0 次），建議可搭配品牌延伸議題或外部評論補充觀察。`;

    const created: KeywordItem = {
      id: `custom-${Date.now()}`,
      term: trimmed,
      category: newCategory,
      categoryLabel: categoryOption?.label ?? '自訂觀察關鍵字',
      role: '新增自訂分析詞彙',
      insight: newNote.trim() || `依據輿情分析報告全文掃描「${trimmed}」之章節分布與語境關聯。`,
      commentSummary: customSummary,
      relatedTopics:
        matchedHeadings.length > 0
          ? matchedHeadings.slice(0, 3)
          : ['自訂延伸觀察', '無輿情分析報告直接命中'],
      isCustom: true,
    };

    setKeywords((prev) => [...prev, created]);
    setSelectedId(created.id);
    setActiveCategory('all');
    setNewTerm('');
    setNewNote('');
    setFormError('');
    setIsAddPanelOpen(false);
  };

  const handleRemoveCustomKeyword = (id: string) => {
    setKeywords((prev) => {
      const updated = prev.filter((k) => k.id !== id);
      if (selectedId === id && updated.length > 0) {
        setSelectedId(updated[0].id);
      }
      return updated;
    });
  };

  const handleSelectCloudTerm = (term: string, keywordId?: string) => {
    if (keywordId && keywords.some((k) => k.id === keywordId)) {
      setActiveCategory('all');
      setSelectedId(keywordId);
      return;
    }

    const existing = keywords.find((k) => k.term.toLowerCase() === term.toLowerCase());
    if (existing) {
      setActiveCategory('all');
      setSelectedId(existing.id);
      return;
    }

    const analysis = analyzeKeywordInTranscript(term);
    const matchedHeadings = analysis.sectionDistribution
      .filter((s) => s.matches > 0)
      .map((s) => s.heading);

    const created: KeywordItem = {
      id: `cloud-${term}`,
      term,
      category: 'custom',
      categoryLabel: '市場關鍵字雲延伸',
      role: '輿情分析報告高關聯熱詞',
      insight: `從市場關鍵字雲點選帶入，即時檢視「${term}」於報告輿情分析報告之出現次數與章節分布。`,
      commentSummary:
        analysis.totalOccurrences > 0
          ? `此關鍵字於輿情分析報告中共出現 ${analysis.totalOccurrences} 次，涵蓋 ${analysis.matchedSectionsCount} 個章節（${analysis.sectionCoveragePct}% 章節覆蓋率）。下方同步列出原文摘錄供比對。`
          : `輿情分析報告中出現 0 次，為延伸觀察市場熱詞。`,
      relatedTopics:
        matchedHeadings.length > 0 ? matchedHeadings.slice(0, 3) : ['市場關鍵字雲'],
      isCustom: true,
    };

    setKeywords((prev) => [...prev, created]);
    setActiveCategory('all');
    setSelectedId(created.id);
  };

  return (
    <section id="keywords" className="scroll-mt-24 pt-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            01. 關鍵字結構分析
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            熱門關鍵字與消費意圖矩陣
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            點擊任一關鍵字即可檢視「關聯討論摘要」、「輿情分析報告討論比例」與「跨章節分布趨勢」；亦可即時新增關鍵字進行全文掃描分析。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div
            role="tablist"
            aria-label="關鍵字分類篩選"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200"
          >
            {categoryFilters.map((filter) => {
              const isActive = activeCategory === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(filter.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1.5 font-mono-num text-[11px] text-slate-500">
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddPanelOpen((prev) => !prev);
              setFormError('');
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              isAddPanelOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {isAddPanelOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>收合新增面板</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>新增關鍵字分析</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add New Keyword Analysis Panel */}
      {isAddPanelOpen && (
        <form
          onSubmit={handleAddKeyword}
          className="mt-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                新增關鍵字分析（即時比對輿情分析報告原文）
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                輸入或點選輿情分析報告提及詞彙，系統將自動計算原文出現次數、章節覆蓋比例與關聯討論摘錄。
              </p>
            </div>
            {newTerm.trim() && (
              <span className="text-xs font-mono-num text-indigo-700 font-medium">
                即時掃描：原文出現 {livePreviewAnalysis.totalOccurrences} 次 · 覆蓋{' '}
                {livePreviewAnalysis.matchedSectionsCount} / {livePreviewAnalysis.totalSections} 章節（
                {livePreviewAnalysis.sectionCoveragePct}%）
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label htmlFor="new-keyword-term" className="block text-xs font-medium text-slate-700 mb-1.5">
                關鍵字名稱
              </label>
              <input
                id="new-keyword-term"
                type="text"
                value={newTerm}
                onChange={(e) => {
                  setNewTerm(e.target.value);
                  setFormError('');
                }}
                placeholder="例如：玉米黃素、大研生醫、3C"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label htmlFor="new-keyword-cat" className="block text-xs font-medium text-slate-700 mb-1.5">
                分析分類
              </label>
              <select
                id="new-keyword-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as KeywordCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                {CUSTOM_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label htmlFor="new-keyword-note" className="block text-xs font-medium text-slate-700 mb-1.5">
                觀察筆記（選填）
              </label>
              <input
                id="new-keyword-note"
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="補充欲追蹤的消費者疑問或行銷切角"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span>快速帶入輿情分析報告詞彙：</span>
              {SUGGESTED_CUSTOM_KEYWORDS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setNewTerm(term);
                    setFormError('');
                  }}
                  className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {formError && <span className="text-xs text-red-700">{formError}</span>}
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                加入關鍵字分析
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Optimized Keyword Filtering & Sorting Bar */}
      <div className="mt-5 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Instant Keyword Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              placeholder="優化篩選：搜尋關鍵字、角色、關聯焦點或討論摘要..."
              aria-label="即時篩選關鍵字"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            {keywordSearch && (
              <button
                type="button"
                onClick={() => setKeywordSearch('')}
                aria-label="清除關鍵字搜尋"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Coverage & Origin Filter Chips */}
          <div className="lg:col-span-4 flex flex-wrap items-center gap-1.5">
            {(
              [
                { key: 'all', label: '全部範圍' },
                { key: 'high_coverage', label: '高覆蓋熱詞 (≥50%)' },
                { key: 'core_only', label: '報告核心詞' },
                { key: 'custom_only', label: '自訂延伸' },
              ] as const
            ).map((opt) => {
              const isSelected = coverageFilter === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setCoverageFilter(opt.key)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Sort Mode Selector & Reset */}
          <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-2">
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                aria-label="關鍵字排序方式"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as KeywordSortBy)}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="default">預設矩陣順位</option>
                <option value="occurrences_desc">提及次數（高 → 低）</option>
                <option value="coverage_desc">章節覆蓋（高 → 低）</option>
              </select>
            </div>

            {hasLocalFilterActive && (
              <button
                type="button"
                onClick={handleResetLocalFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重設</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            篩選結果：<span className="font-mono-num font-bold text-slate-900">{filteredKeywords.length}</span> /{' '}
            <span className="font-mono-num">{keywords.length}</span> 項關鍵字（即時同步下方星雲與矩陣）
          </span>
          <span>提示：點擊右側「關聯焦點」標籤可一鍵反查相關詞條</span>
        </div>
      </div>

      {/* Animated Market Keyword Cloud */}
      <AnimatedKeywordCloud
        activeCategory={activeCategory}
        selectedTerm={selectedKeyword?.term ?? ''}
        globalQuery={globalFilter.query}
        localQuery={keywordSearch}
        coverageFilter={coverageFilter}
        onSelectCloudTerm={handleSelectCloudTerm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
        {/* Left: Interactive Keyword Grid */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          {filteredKeywords.length === 0 ? (
            <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-slate-900">
                {keywordSearch.trim()
                  ? `無符合篩選「${keywordSearch}」之關鍵字詞條`
                  : globalFilter.isActive
                    ? `既有關鍵字矩陣中無符合「${globalFilter.query}」之詞條`
                    : '目前篩選條件下無符合關鍵字'}
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm">
                您可以重設篩選條件檢視全部詞條，或直接將搜尋詞加入自訂關鍵字掃描輿情分析報告原文。
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {hasLocalFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetLocalFilters}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    重設關鍵字篩選
                  </button>
                )}
                {globalFilter.isActive && (
                  <button
                    type="button"
                    onClick={onClearGlobalFilter}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    清除全域搜尋
                  </button>
                )}
                {(keywordSearch.trim() || globalFilter.query.trim()) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewTerm((keywordSearch || globalFilter.query).trim());
                      setIsAddPanelOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    以「{(keywordSearch || globalFilter.query).trim()}」新增分析
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredKeywords.map((item) => {
                const isSelected = selectedKeyword?.id === item.id;
                const stats = keywordAnalyses.get(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-base font-bold tracking-tight text-slate-900 truncate">
                        {highlightMatch(item.term, keywordSearch)}
                      </span>
                      <span className="text-[11px] font-mono-num text-slate-500 whitespace-nowrap shrink-0">
                        {stats ? `${stats.sectionCoveragePct}%` : '0%'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {highlightMatch(item.role, keywordSearch)}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono-num text-slate-500">
                      <span>{item.categoryLabel}</span>
                      <span>{stats ? `${stats.totalOccurrences} 次` : '0 次'}</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isSelected ? 'bg-indigo-600' : 'bg-slate-400'}`}
                        style={{ width: `${Math.max(4, stats?.sectionCoveragePct ?? 0)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {globalFilter.isActive
                ? `已套用全域搜尋「${globalFilter.query}」`
                : '卡片百分比代表該關鍵字於報告 9 大章節中的討論覆蓋比例'}
            </span>
            <span className="font-mono-num">
              顯示 {filteredKeywords.length} / {keywords.length} 項詞彙
            </span>
          </div>
        </div>

        {/* Right: Selected Keyword Detailed Summary, Ratio & Cross-Section Trend */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
          {!selectedKeyword ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <p className="text-sm font-semibold text-slate-800 mb-2">
                「{globalFilter.query}」輿情分析報告直接掃描結果
              </p>
              <p>
                原文提及 {selectedAnalysis.totalOccurrences} 次 · 涵蓋{' '}
                {selectedAnalysis.matchedSectionsCount} / {selectedAnalysis.totalSections} 章節（
                {selectedAnalysis.sectionCoveragePct}%）
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <span className="font-medium text-indigo-700">{selectedKeyword.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedKeyword.role}</span>
                  {selectedKeyword.isCustom && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-700 font-medium">自訂新增項目</span>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  「{selectedKeyword.term}」
                </h3>
              </div>

              {selectedKeyword.isCustom && (
                <button
                  type="button"
                  onClick={() => handleRemoveCustomKeyword(selectedKeyword.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-700 border border-red-200 rounded-md hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>移除自訂</span>
                </button>
              )}
            </div>

            {/* Discussion Ratio Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3.5 border-t border-b border-slate-100">
              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-slate-600">輿情分析報告章節討論比例</span>
                  <span className="font-mono-num font-semibold text-slate-900">
                    {selectedAnalysis.sectionCoveragePct}%（{selectedAnalysis.matchedSectionsCount}/
                    {selectedAnalysis.totalSections} 節）
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-200"
                    style={{ width: `${selectedAnalysis.sectionCoveragePct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-slate-600">輿情分析報告段落涵蓋比例</span>
                  <span className="font-mono-num font-semibold text-slate-900">
                    {selectedAnalysis.paragraphCoveragePct}%（共提及 {selectedAnalysis.totalOccurrences} 次）
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-200"
                    style={{ width: `${selectedAnalysis.paragraphCoveragePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Related Discussion Summary */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 mb-1.5">
                關聯評論與討論摘要
              </h4>
              <p className="text-sm leading-relaxed text-slate-700">
                {selectedKeyword.commentSummary}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span>關聯焦點：</span>
                {selectedKeyword.relatedTopics.map((topic) => {
                  const isTopicFiltered = keywordSearch.trim().toLowerCase() === topic.toLowerCase();
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setKeywordSearch(isTopicFiltered ? '' : topic)}
                      className={`px-2 py-0.5 rounded border text-[11px] transition-colors cursor-pointer ${
                        isTopicFiltered
                          ? 'bg-indigo-600 text-white border-indigo-600 font-medium'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cross-Section Trend Interactive Recharts BarChart */}
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <h4 className="text-xs font-semibold text-slate-900">
                  跨章節討論分布趨勢（一至九節 · 互動長條圖）
                </h4>
                <span className="text-[11px] font-mono-num text-slate-500">
                  單節提及次數
                </span>
              </div>
              <div className="w-full h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={selectedAnalysis.sectionDistribution}
                    margin={{ top: 8, right: 6, left: 6, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val, _name, item) => [
                        `${val} 次`,
                        item?.payload?.heading ?? '章節',
                      ]}
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                        borderColor: '#E2E8F0',
                      }}
                    />
                    <Bar dataKey="matches" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                      {selectedAnalysis.sectionDistribution.map((sec) => (
                        <Cell
                          key={sec.id}
                          fill={sec.matches > 0 ? '#4F46E5' : '#E2E8F0'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verbatim Excerpts */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">
                輿情分析報告關聯原文摘錄
              </h4>
              {selectedAnalysis.excerpts.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedAnalysis.excerpts.map((ex, i) => (
                    <div key={i} className="text-xs leading-relaxed text-slate-600">
                      <span className="font-medium text-slate-800">
                        {ex.sectionHeading}（第 {ex.page} 頁）：
                      </span>
                      <span>{highlightMatch(ex.text, selectedKeyword.term)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  此自訂詞彙未直接出現於輿情分析報告內文中（0 次），可搭配上方自訂觀察筆記追蹤後續討論。
                </p>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
