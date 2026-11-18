import { useRef, useState } from 'react';
import {
  ACTION_RECOMMENDATIONS,
  CHANNEL_INSIGHTS,
  CRISIS_STAGES,
  KOL_ARCHETYPES,
} from '../data/reportData';
import { RiskHeatmapSection } from './RiskHeatmapSection';
import { VolumeCorrelationAnalysis } from './VolumeCorrelationAnalysis';

export function StrategyAndRiskTab() {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const crisisWorkflowRef = useRef<HTMLDivElement>(null);
  const currentStage = CRISIS_STAGES[activeStageIndex];

  const handleSelectStageFromHeatmap = (stageIndex: number) => {
    setActiveStageIndex(stageIndex);
    crisisWorkflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="space-y-12 pt-8">
      {/* 05. 來源頻道與 KOL 合作 */}
      <section className="scroll-mt-24">
        <div className="pb-5 border-b border-slate-200">
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            05. 傳播路徑與 KOL 佈局
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            來源頻道表現、競品比較與 KOL 合作策略
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            品牌自有社群、內容平台、論壇與新聞媒體共同構成葉黃素市場傳播路徑，應區分貼文性質並規劃分眾 KOL 測試。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-stretch">
          {/* Channels & Competitors */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  來源頻道與網站聲量結構
                </h3>
                <dl className="divide-y divide-slate-100 border-t border-b border-slate-100 text-xs">
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-slate-600">來源頻道排行首位</dt>
                    <dd className="font-semibold text-slate-900 text-right">
                      {CHANNEL_INSIGHTS.topSource}
                    </dd>
                  </div>
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-slate-600">領先幅度對照</dt>
                    <dd className="font-medium text-slate-800 text-right">
                      {CHANNEL_INSIGHTS.runnerUpNote}
                    </dd>
                  </div>
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-slate-600 shrink-0">網站排行突出平台</dt>
                    <dd className="font-medium text-slate-800 text-right">
                      {CHANNEL_INSIGHTS.prominentSites.join(' · ')}
                    </dd>
                  </div>
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-slate-600 shrink-0">涵蓋來源管道</dt>
                    <dd className="text-slate-700 text-right">
                      {CHANNEL_INSIGHTS.platforms.join('、')}
                    </dd>
                  </div>
                  <div className="py-3 flex items-baseline justify-between gap-4">
                    <dt className="text-slate-600 shrink-0">競品輔助分析架構</dt>
                    <dd className="text-slate-700 text-right">
                      {CHANNEL_INSIGHTS.analyticalTools.join('、')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">判讀準則：</span>
                {CHANNEL_INSIGHTS.caution}
              </p>
            </div>
          </div>

          {/* KOL Collaboration */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                Instagram KOL 三大評估受眾與內容規劃
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                報告評估 3 位不同內容定位之 IG 帳號，建議先小規模測試再依互動與轉換擴大
              </p>

              <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                {KOL_ARCHETYPES.map((kol, idx) => (
                  <div key={kol.type} className="py-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        0{idx + 1}. {kol.type}
                      </span>
                      <span className="text-xs font-medium text-indigo-700 whitespace-nowrap shrink-0">
                        {kol.suggestedFormat}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      受眾切角：{kol.audienceFit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-900">話題操作原則：</span>
                可結合體育賽事、節慶促銷及創新科技等話題，但須確認與受眾及護眼情境相關，並設計留言、分享、參與或導流等明確行動（CTA）。
              </p>
            </div>
          </div>
        </div>

        {/* 聲量關聯分析 (Volume Correlation Analysis) */}
        <VolumeCorrelationAnalysis />
      </section>

      {/* 06. 輿情風險與五階段應變流程 */}
      <section className="scroll-mt-24">
        <div className="pb-5 border-b border-slate-200">
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            06. 風險管理與應變架構
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            輿情風險熱力圖與五階段標準應變流程
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            主要風險集中於「產品效果爭議」、「品牌信任危機」與「社會責任期待」，需在促銷期、KOL 發文後及異常高峰日透過週曆熱力圖加強監測。
          </p>
        </div>

        {/* 輿情風險熱力圖 (Weekly Risk Heatmap) */}
        <RiskHeatmapSection onSelectCrisisStage={handleSelectStageFromHeatmap} />

        <div
          ref={crisisWorkflowRef}
          className="mt-6 bg-white border border-slate-200 rounded-xl p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-base font-semibold text-slate-900">
              五階段危機應變流程（點擊檢視各階段執行要點）
            </h3>
            <span className="text-xs text-slate-500">
              高風險監測時機：促銷期間 · KOL 貼文後 · 聲量異常高峰日
            </span>
          </div>

          {/* Interactive 5-Stage Selector */}
          <div
            role="tablist"
            aria-label="輿情應變五階段"
            className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6"
          >
            {CRISIS_STAGES.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={stage.step}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveStageIndex(idx)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? 'bg-[#161442] text-white border-indigo-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`block text-[11px] font-mono-num ${
                      isActive ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <span className="block text-sm font-bold mt-0.5">{stage.title}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 border-t border-slate-100">
            <div className="lg:col-span-5">
              <p className="text-xs font-mono-num text-indigo-700 font-medium mb-1">
                {currentStage.step}
              </p>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {currentStage.title}階段重點
              </h4>
              <p className="text-sm leading-relaxed text-slate-700">
                {currentStage.summary}
              </p>
            </div>
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold text-slate-900 mb-2.5">
                具體對應作為
              </p>
              <ul className="space-y-2">
                {currentStage.actions.map((act) => (
                  <li key={act} className="text-sm text-slate-700 leading-relaxed">
                    — {act}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Short-term vs Mid/Long-term Response */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-200">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                短期即時應變措施
              </h4>
              <p className="text-xs leading-relaxed text-slate-600">
                發布官方說明、主動回應高聲量負評、設置專責回覆小組、邀請專業人士提供可查證資訊，並依消費者回饋檢視配方與包裝說明。
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                中長期信任建設機制
              </h4>
              <p className="text-xs leading-relaxed text-slate-600">
                讓消費者參與產品改進、定期檢測並公開品質資訊、培訓客服以提升回應一致性，並建立常態化危機管理與持續監測機制。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07. 五大行動建議 */}
      <section className="scroll-mt-24 pb-4">
        <div className="pb-5 border-b border-slate-200">
          <p className="text-xs font-medium tracking-wide text-indigo-700 mb-1">
            07. 結論與落地方向
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            五大行動建議：透明溝通、精準內容、持續監測
          </h2>
        </div>

        <div className="mt-6 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {ACTION_RECOMMENDATIONS.map((item) => (
            <div
              key={item.id}
              className="p-5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-baseline"
            >
              <div className="md:col-span-3 flex items-baseline gap-3">
                <span className="font-mono-num text-xs font-semibold text-indigo-700">
                  {item.id}
                </span>
                <span className="text-base font-bold text-slate-900">
                  {item.strategy}
                </span>
              </div>
              <p className="md:col-span-9 text-sm leading-relaxed text-slate-700">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
