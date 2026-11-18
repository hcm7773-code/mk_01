import {
  COMMUNITY_PERSPECTIVES,
  HOT_TOPICS,
  PURCHASE_CRITERIA,
  type GlobalFilterResult,
} from '../data/reportData';

interface ConsumerFocusSectionProps {
  globalFilter: GlobalFilterResult;
  onClearGlobalFilter: () => void;
}

export function ConsumerFocusSection({
  globalFilter,
  onClearGlobalFilter,
}: ConsumerFocusSectionProps) {
  const matchesQuery = (text: string) => {
    if (!globalFilter.isActive) return true;
    const q = globalFilter.query.toLowerCase();
    if (text.toLowerCase().includes(q)) return true;
    const hints = globalFilter.matchedProfile?.relatedFocusKeywords ?? [];
    return hints.some((hint) => text.toLowerCase().includes(hint.toLowerCase()));
  };

  const filteredTopics = HOT_TOPICS.filter((t) =>
    matchesQuery(`${t.title} ${t.example} ${t.implication}`)
  );
  const filteredPerspectives = COMMUNITY_PERSPECTIVES.filter((p) =>
    matchesQuery(`${p.title} ${p.detail}`)
  );
  const filteredCriteria = PURCHASE_CRITERIA.filter((c) =>
    matchesQuery(`${c.factor} ${c.detail}`)
  );

  const hasAnyMatch =
    filteredTopics.length > 0 ||
    filteredPerspectives.length > 0 ||
    filteredCriteria.length > 0;

  return (
    <section id="consumer-focus" className="scroll-mt-24 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            04. 消費者關注要點與選購決策
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            熱門討論主題、社群觀點與五大選購指標
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            {globalFilter.isActive
              ? `已篩選顯示與「${globalFilter.matchedProfile?.displayName ?? globalFilter.query}」關聯之消費者討論要點。`
              : '消費者的關注橫跨「聯名促銷話題」、「日常 3C 用眼痛點」與「高度理性的成分規格比對」，品牌必須提供看得懂且可查證的產品資訊。'}
          </p>
        </div>

        {globalFilter.isActive && (
          <span className="text-xs font-mono-num text-indigo-700 shrink-0">
            命中 {filteredTopics.length + filteredPerspectives.length + filteredCriteria.length} 項要點
          </span>
        )}
      </div>

      {!hasAnyMatch ? (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm font-semibold text-slate-900">
            消費者關注要點中無直接符合「{globalFilter.query}」之條目
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            建議清除全域篩選以檢視完整的三大熱門主題、四大社群觀點與五大選購指標。
          </p>
          <button
            type="button"
            onClick={onClearGlobalFilter}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 cursor-pointer"
          >
            檢視全部關注要點
          </button>
        </div>
      ) : (
        <>
          {/* Part A: Filtered Hot Topics */}
          {filteredTopics.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => (
                <article
                  key={topic.index}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono-num text-indigo-700 font-medium mb-2">
                      熱門主題 {topic.index}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-700 mb-3">
                      {topic.example}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 pt-3 border-t border-slate-100">
                    {topic.implication}
                  </p>
                </article>
              ))}
            </div>
          )}

          {/* Part B & C: Filtered Community Perspectives + Purchase Criteria */}
          {(filteredPerspectives.length > 0 || filteredCriteria.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
              {filteredPerspectives.length > 0 && (
                <div
                  className={`${
                    filteredCriteria.length > 0 ? 'lg:col-span-5' : 'lg:col-span-12'
                  } bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      社群內容觀點
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      綜合論壇、社群與內容平台文本歸納之核心對話維度
                    </p>

                    <dl className="divide-y divide-slate-100 border-t border-slate-100">
                      {filteredPerspectives.map((item, idx) => (
                        <div key={item.title} className="py-3.5">
                          <dt className="text-sm font-semibold text-slate-900 flex items-baseline gap-2">
                            <span className="font-mono-num text-xs text-indigo-700">
                              0{idx + 1}
                            </span>
                            <span>{item.title}</span>
                          </dt>
                          <dd className="text-xs leading-relaxed text-slate-600 mt-1 pl-6">
                            {item.detail}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {filteredCriteria.length > 0 && (
                <div
                  className={`${
                    filteredPerspectives.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'
                  } bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          消費者選購核心考量
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          消費者於比較不同葉黃素產品時最在意的實質維度
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">規格與透明度導向</span>
                    </div>

                    <ol className="divide-y divide-slate-100 border-t border-b border-slate-100">
                      {filteredCriteria.map((item) => (
                        <li
                          key={item.rank}
                          className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 items-baseline"
                        >
                          <div className="sm:col-span-5 flex items-baseline gap-2.5">
                            <span className="font-mono-num text-xs font-semibold text-indigo-700">
                              {item.rank}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {item.factor}
                            </span>
                          </div>
                          <p className="sm:col-span-7 text-xs leading-relaxed text-slate-600 pl-6 sm:pl-0">
                            {item.detail}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-5 pt-2">
                    <p className="text-xs leading-relaxed text-slate-700">
                      <span className="font-semibold text-slate-900">行銷溝通啟示：</span>
                      品牌不宜只強調價格或包裝，而應將複雜配方轉化為消費者看得懂、能比較、也可查證的資訊；涉及健康效益的宣稱更應清楚說明依據，避免承諾超過實際可期待效果。
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
