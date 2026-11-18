import { Download, Printer, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  ACTION_RECOMMENDATIONS,
  COMMUNITY_PERSPECTIVES,
  DATASET_SCOPES,
  HOT_TOPICS,
  KEYWORDS_DATA,
  KPI_METRICS,
  PURCHASE_CRITERIA,
  REPORT_META,
  SENTIMENT_THREE_MONTH,
  type GlobalFilterResult,
} from '../data/reportData';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  globalFilter: GlobalFilterResult;
}

export function ExportPdfModal({ isOpen, onClose, globalFilter }: ExportPdfModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeScopeTitle = globalFilter.isActive
    ? `篩選範圍：${globalFilter.matchedProfile?.displayName ?? globalFilter.query}`
    : '完整市場報告：葉黃素市場總覽';

  const handlePrintPdf = () => {
    window.print();
  };

  const handleDownloadPrintableHtml = () => {
    const scopeHeading = globalFilter.isActive
      ? `篩選條件：${globalFilter.matchedProfile?.displayName ?? globalFilter.query}`
      : '分析範圍：全市場總覽（2026/08–10 主分析 · 2025/10–2026/10 年度補充）';

    const htmlContent = `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <title>${REPORT_META.title} - 匯出報告</title>
  <style>
    body { font-family: "Noto Sans TC", -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; max-width: 820px; margin: 32px auto; padding: 0 20px; line-height: 1.65; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 24px; }
    .meta { font-size: 12px; color: #475569; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 16px 0; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .val { font-size: 20px; font-weight: 700; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${REPORT_META.title}</h1>
  <div class="meta">${REPORT_META.subtitle} · ${REPORT_META.sourceTool} · ${scopeHeading}</div>
  ${
    globalFilter.isActive && globalFilter.matchedProfile
      ? `<div class="card"><strong>品牌／產品專屬摘要</strong><p>${globalFilter.matchedProfile.volumeSummary}</p><p>${globalFilter.matchedProfile.sentimentSummary}</p></div>`
      : ''
  }
  <h2>一、關鍵指標與統計口徑</h2>
  <div class="grid">
    ${(globalFilter.matchedProfile ? globalFilter.matchedProfile.kpis : KPI_METRICS)
      .map(
        (k) =>
          `<div class="card"><div>${k.label}</div><div class="val">${k.value} ${k.unit}</div><div style="font-size:12px;color:#475569;">${k.context}</div></div>`
      )
      .join('')}
  </div>
  <table>
    <thead><tr><th>資料集</th><th>期間</th><th>總量</th><th>明細</th></tr></thead>
    <tbody>
      ${DATASET_SCOPES.map(
        (r) => `<tr><td>${r.dataset}</td><td>${r.period}</td><td>${r.total}</td><td>${r.breakdown}</td></tr>`
      ).join('')}
    </tbody>
  </table>
  <h2>二、熱門關鍵字</h2>
  <p>${KEYWORDS_DATA.map((k) => `${k.term}（${k.role}）`).join(' · ')}</p>
  <h2>三、情緒分析（三個月樣本 n = 576 篇）</h2>
  <ul>
    ${SENTIMENT_THREE_MONTH.items
      .map((s) => `<li><strong>${s.label} ${s.percent}%（${s.count} 篇）</strong>：${s.description}</li>`)
      .join('')}
  </ul>
  <h2>四、消費者關注要點</h2>
  <ul>
    ${HOT_TOPICS.map((t) => `<li><strong>${t.title}</strong>：${t.example}</li>`).join('')}
    ${PURCHASE_CRITERIA.map((c) => `<li><strong>選購指標 ${c.rank} - ${c.factor}</strong>：${c.detail}</li>`).join('')}
  </ul>
  <h2>五、行動建議</h2>
  <ul>
    ${ACTION_RECOMMENDATIONS.map((a) => `<li><strong>${a.strategy}</strong>：${a.summary}</li>`).join('')}
  </ul>
  <p style="font-size:11px;color:#64748b;margin-top:28px;">${REPORT_META.sourceCitation}</p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `葉黃素市場輿情摘要_${globalFilter.isActive ? globalFilter.query : '全市場'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const displayKpis = globalFilter.matchedProfile
    ? globalFilter.matchedProfile.kpis
    : KPI_METRICS;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-pdf-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Modal Header (Hidden when printing) */}
        <div className="no-print px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div>
            <h2 id="export-pdf-title" className="text-base font-bold text-slate-900">
              匯出 PDF 結構化報告預覽
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{activeScopeTitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPrintableHtml}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載離線可列印檔</span>
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 另存 PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉預覽"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Sheet Preview */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white text-slate-900">
          <div className="pb-4 border-b border-slate-200">
            <div className="text-xs font-mono-num text-indigo-700 font-medium mb-1">
              {REPORT_META.subtitle} · {REPORT_META.sourceTool}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{REPORT_META.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{activeScopeTitle}</p>
          </div>

          {globalFilter.isActive && (
            <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-indigo-900">
                品牌／產品篩選分析摘要：{globalFilter.matchedProfile?.displayName ?? globalFilter.query}
              </p>
              {globalFilter.matchedProfile ? (
                <>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold">聲量觀察：</span>
                    {globalFilter.matchedProfile.volumeSummary}
                  </p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold">情緒觀察：</span>
                    {globalFilter.matchedProfile.sentimentSummary}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed">
                  原文輿情分析報告中命中「{globalFilter.query}」共{' '}
                  <span className="font-mono-num font-semibold">
                    {globalFilter.transcriptAnalysis.totalOccurrences}
                  </span>{' '}
                  次，涵蓋 {globalFilter.transcriptAnalysis.matchedSectionsCount} / 9 個章節。
                </p>
              )}
            </div>
          )}

          {/* KPI Grid */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2.5">一、核心數據摘要</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {displayKpis.map((k) => (
                <div key={k.label} className="border border-slate-200 rounded-lg p-3">
                  <div className="text-[11px] text-slate-500">{k.label}</div>
                  <div className="text-lg font-bold font-mono-num text-slate-900 mt-1">
                    {k.value} <span className="text-xs font-normal">{k.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">{k.context}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords & Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">二、關鍵字分布（12 項）</h4>
              <p className="text-xs leading-relaxed text-slate-700">
                {KEYWORDS_DATA.map((k) => `${k.term}（${k.role}）`).join(' · ')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                三、情緒分析（樣本 n = 576 篇）
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {SENTIMENT_THREE_MONTH.items.map((s) => (
                  <li key={s.key}>
                    <span className="font-semibold">
                      {s.label} {s.percent}%（{s.count} 篇）：
                    </span>
                    {s.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consumer Focus */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">四、消費者關注要點</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div>
                <p className="font-semibold text-slate-900 mb-1">熱門主題與社群觀點</p>
                <ul className="space-y-1">
                  {HOT_TOPICS.map((t) => (
                    <li key={t.index}>
                      — {t.title}：{t.example}
                    </li>
                  ))}
                  {COMMUNITY_PERSPECTIVES.map((p) => (
                    <li key={p.title}>
                      — {p.title}：{p.detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">五大消費者選購指標</p>
                <ul className="space-y-1">
                  {PURCHASE_CRITERIA.map((c) => (
                    <li key={c.rank}>
                      {c.rank}. {c.factor}：{c.detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              五、結論與五大行動建議（{REPORT_META.coreDirection}）
            </h4>
            <ul className="space-y-1 text-xs text-slate-700">
              {ACTION_RECOMMENDATIONS.map((a) => (
                <li key={a.id}>
                  <span className="font-semibold">
                    {a.id}. {a.strategy}：
                  </span>
                  {a.summary}
                </li>
              ))}
            </ul>
          </div>

          <p className="pt-4 border-t border-slate-200 text-[11px] text-slate-500">
            {REPORT_META.sourceCitation}
          </p>
        </div>
      </div>
    </div>
  );
}
