import { Search, X } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { TRANSCRIPT_SECTIONS } from '../data/reportData';

const QUICK_TERMS = ['葉黃素', '游離型', '9 月 17 日', '大研生醫', 'iHerb', '效果不明顯'];

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-indigo-100 text-indigo-950 px-0.5 rounded-xs">
        {part}
      </mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

interface TranscriptExplorerTabProps {
  globalQuery?: string;
}

export function TranscriptExplorerTab({ globalQuery = '' }: TranscriptExplorerTabProps) {
  const [searchQuery, setSearchQuery] = useState(globalQuery);
  const [pageFilter, setPageFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    setSearchQuery(globalQuery);
  }, [globalQuery]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TRANSCRIPT_SECTIONS.filter((sec) => {
      const matchesPage = pageFilter === 'all' || sec.page === pageFilter;
      if (!matchesPage) return false;
      if (!q) return true;
      return (
        sec.heading.toLowerCase().includes(q) ||
        sec.paragraphs.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, pageFilter]);

  return (
    <section className="pt-8 pb-6">
      <div className="pb-5 border-b border-slate-200">
        <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
          輿情分析報告原文查核
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          精簡口頭輿情分析報告全文（共 3 頁）
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          支援關鍵字即時檢索與頁碼篩選，便於快速核對摘要數據、日期波峰與原文表述。
        </p>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋輿情分析報告關鍵詞（如：游離型、384,830、方格子）"
              aria-label="搜尋輿情分析報告關鍵詞"
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="清除搜尋"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="輿情分析報告頁數篩選"
            className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0"
          >
            {[
              { key: 'all' as const, label: '全部 3 頁' },
              { key: 1, label: '第 1 頁' },
              { key: 2, label: '第 2 頁' },
              { key: 3, label: '第 3 頁' },
            ].map((tab) => {
              const isActive = pageFilter === tab.key;
              return (
                <button
                  key={String(tab.key)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPageFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>快速檢索：</span>
          {QUICK_TERMS.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setSearchQuery(term)}
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Transcript Sections */}
      {filteredSections.length === 0 ? (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-900">
            找不到符合「{searchQuery}」的輿情分析報告段落
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            請嘗試其他關鍵字或重設頁碼篩選條件。
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setPageFilter('all');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            重設搜尋與篩選
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {filteredSections.map((sec) => (
            <article
              key={sec.id}
              className="bg-white border border-slate-200 rounded-xl p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {highlightText(sec.heading, searchQuery)}
                </h3>
                <span className="text-xs font-mono-num text-slate-500">
                  PDF 第 {sec.page} / 3 頁
                </span>
              </div>
              <div className="space-y-3 max-w-prose">
                {sec.paragraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className="text-sm leading-[1.8] text-slate-700"
                  >
                    {highlightText(para, searchQuery)}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
