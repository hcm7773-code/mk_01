import { ChevronLeft, ChevronRight, ExternalLink, Globe, Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import eyemallEventsPromoImg from '../assets/images/eyemall_events_promo_1795284342591.jpg';
import eyeglassesLocationImg from '../assets/images/eyeglasses_store_location_1795284342868.jpg';
import luteinGoldNewsImg from '../assets/images/lutein_gold_news_1795284342348.jpg';
import luteinResearchGuideImg from '../assets/images/lutein_research_guide_1795284342577.jpg';

export interface SpotlightSlide {
  id: string;
  indexLabel: string;
  shortLabel: string;
  category: string;
  domain: string;
  title: string;
  summary: string;
  url: string;
  image: string;
  imageAlt: string;
}

const SPOTLIGHT_SLIDES: SpotlightSlide[] = [
  {
    id: 'gold-news',
    indexLabel: '01',
    shortLabel: '金三明葉黃素消息',
    category: '品牌最新動態',
    domain: 'eyeglasses.com.tw',
    title: '大學金三明葉黃素｜最新消息與認證專區',
    summary:
      '掌握大學金三明葉黃素系列最新動態、SNQ 國家品質標章榮譽與成分設計特色，追蹤專業醫事推薦與通路活動公告。',
    url: 'https://www.eyeglasses.com.tw/Gold/news',
    image: luteinGoldNewsImg,
    imageAlt: '大學金三明葉黃素軟膠囊與琥珀玻璃瓶展示',
  },
  {
    id: 'eyemall-events',
    indexLabel: '02',
    shortLabel: 'EYEMALL 主題活動',
    category: '官方線上商城',
    domain: 'eyemall.com.tw',
    title: 'EYEMALL 大學眼鏡官方商城｜精選主題優惠',
    summary:
      '整合線上訂購與線下門市支援，提供大學金三明葉黃素多入優惠組合、定期配方案及視力保健精選活動資訊。',
    url: 'https://www.eyemall.com.tw/Events?themeID=1',
    image: eyemallEventsPromoImg,
    imageAlt: '光學鏡框與視力保健禮盒官方商城展示陳列',
  },
  {
    id: 'eyeglasses-location',
    indexLabel: '03',
    shortLabel: '全台門市據點',
    category: '實體門市通路',
    domain: 'eyeglasses.com.tw',
    title: '大學眼鏡｜全台直營門市據點查詢',
    summary:
      '完整收錄北、中、南、東各地門市地址、聯絡電話與服務資訊，便於對照線上聲量與實體體驗驗配據點分布。',
    url: 'https://www.eyeglasses.com.tw/Location',
    image: eyeglassesLocationImg,
    imageAlt: '現代化明亮驗光室與眼鏡門市服務空間',
  },
  {
    id: 'medicalnews-lutein',
    indexLabel: '04',
    shortLabel: '複方成分評比',
    category: '成分評比專題',
    domain: 'medicalnewstw.com',
    title: 'Medical News｜葉黃素挑選與複方成分比較指南',
    summary:
      '剖析純葉黃素與複方成分差異，整理蝦紅素、智利酒果與山桑子實證研究劑量，對照社群常見「體感與效果」選購疑問。',
    url: 'https://medicalnewstw.com/article/01-lutein-best/?prod=lutein&pg=best&act=all&site=mdn&kw=%E8%91%89%E9%BB%83%E7%B4%A0&gad_source=1&gad_campaignid=20619435551&gbraid=0AAAAAqKr4A-0cb3g6-wy-6gyKMuiLOuyF&gclid=CjwKCAiAn4XYBhA-EiwA8176FYLY53CTADjSuCXsnwCT89jpyzBXX6DSBwThv_fmfCzhK4PZJtih3xoCNbwQAvD_BwE',
    image: luteinResearchGuideImg,
    imageAlt: '金盞花葉黃素、山桑子與光學鏡片研究平拍圖',
  },
];

export function TopSpotlightCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isPaused || isHoveredOrFocused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SPOTLIGHT_SLIDES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isPaused, isHoveredOrFocused, prefersReducedMotion]);

  const activeSlide = SPOTLIGHT_SLIDES[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SPOTLIGHT_SLIDES.length) % SPOTLIGHT_SLIDES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SPOTLIGHT_SLIDES.length);
  };

  return (
    <section
      aria-label="品牌通道與葉黃素專題輪播"
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocusCapture={() => setIsHoveredOrFocused(true)}
      onBlurCapture={() => setIsHoveredOrFocused(false)}
      className="mb-8 bg-white border border-slate-200 rounded-2xl overflow-hidden"
    >
      {/* Top Control Header */}
      <div className="px-5 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">焦點專題與通路資源輪播</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num text-indigo-700 font-medium">
            {activeSlide.indexLabel} / 0{SPOTLIGHT_SLIDES.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="上一則輪播"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? '繼續自動輪播' : '暫停自動輪播'}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>自動播放</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-600" />
                <span>暫停輪播</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="下一則輪播"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Split Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-medium text-indigo-700">{activeSlide.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">{activeSlide.domain}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-balance">
              {activeSlide.title}
            </h2>

            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
              {activeSlide.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <a
              href={activeSlide.url}
              target="_blank"
              rel="noopener noreferrer"
              title={activeSlide.url}
              className="text-xs font-mono-num text-slate-500 hover:text-indigo-700 underline decoration-slate-300 underline-offset-4 truncate max-w-full sm:max-w-[380px] transition-colors"
            >
              {activeSlide.url}
            </a>

            <a
              href={activeSlide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <span>開啟外部頁面</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Visual Media Container */}
        <a
          href={activeSlide.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`前往 ${activeSlide.title}`}
          className="lg:col-span-5 relative block min-h-[210px] lg:min-h-[250px] bg-slate-100 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-hidden group"
        >
          {failedImages[activeSlide.id] ? (
            <div className="w-full h-full min-h-[210px] bg-gradient-to-br from-[#13153D] via-[#1C174E] to-[#0F172A] text-white p-6 flex flex-col justify-between">
              <Globe className="w-6 h-6 text-emerald-300" />
              <div>
                <p className="text-xs font-mono-num text-indigo-200">{activeSlide.domain}</p>
                <p className="text-base font-bold mt-1">{activeSlide.title}</p>
              </div>
            </div>
          ) : (
            <img
              src={activeSlide.image}
              alt={activeSlide.imageAlt}
              referrerPolicy="no-referrer"
              onError={() =>
                setFailedImages((prev) => ({ ...prev, [activeSlide.id]: true }))
              }
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent pointer-events-none"
          />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2 text-xs text-white">
            <span className="font-mono-num truncate">{activeSlide.domain}</span>
            <span className="inline-flex items-center gap-1 font-medium whitespace-nowrap shrink-0">
              <span>前往瀏覽</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </a>
      </div>

      {/* Bottom Slide Switcher Tabs */}
      <div
        role="tablist"
        aria-label="切換焦點輪播項目"
        className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 bg-slate-50/70"
      >
        {SPOTLIGHT_SLIDES.map((slide, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveIndex(idx)}
              className={`px-4 py-3 text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className={`font-mono-num text-[11px] shrink-0 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {slide.indexLabel}
                </span>
                <span className="text-xs truncate">{slide.shortLabel}</span>
              </span>
              <span
                aria-hidden="true"
                className={`h-1.5 w-6 rounded-full shrink-0 transition-colors ${
                  isActive ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
