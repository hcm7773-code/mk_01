import { ChevronLeft, ChevronRight, ExternalLink, Globe, Pause, Play } from 'lucide-react';
import { motion } from 'motion/react';
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

const AUTO_PLAY_INTERVAL_MS = 3000;

const SPOTLIGHT_SLIDES: SpotlightSlide[] = [
  {
    id: 'gold-news',
    indexLabel: '01',
    shortLabel: '金三明葉黃素消息',
    category: '品牌最新動態',
    domain: 'eyeglasses.com.tw',
    title: '大學金三明葉黃素｜最新消息與認證專區',
    summary:
      '掌握大學金三明葉黃素系列最新動態、SNQ 國家品質標章榮譽與醫事推薦通路活動。',
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
      '線上線下整合訂購服務，匯集金三明葉黃素多入組方案、定期配及視力保健精選活動。',
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
      '收錄北、中、南、東各地門市地址與電話資訊，便於對照線上討論與實體諮詢據點分布。',
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
      '比較純葉黃素與蝦紅素、智利酒果、山桑子實證複方劑量，回應消費者體感與選購疑問。',
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

  useEffect(() => {
    if (isPaused || isHoveredOrFocused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SPOTLIGHT_SLIDES.length);
    }, AUTO_PLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, isHoveredOrFocused]);

  const activeSlide = SPOTLIGHT_SLIDES[activeIndex];
  const isAutoPlaying = !isPaused && !isHoveredOrFocused;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + SPOTLIGHT_SLIDES.length) % SPOTLIGHT_SLIDES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % SPOTLIGHT_SLIDES.length);
  };

  return (
    <section
      aria-label="品牌通道與葉黃素專題自動輪播"
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocusCapture={() => setIsHoveredOrFocused(true)}
      onBlurCapture={() => setIsHoveredOrFocused(false)}
      className="mb-5 bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-stretch">
        {/* Compact Left Visual Thumbnail */}
        <a
          href={activeSlide.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`前往 ${activeSlide.title}`}
          className="sm:w-52 md:w-60 shrink-0 h-28 sm:h-auto relative block bg-slate-100 border-b sm:border-b-0 sm:border-r border-slate-200 overflow-hidden group"
        >
          {failedImages[activeSlide.id] ? (
            <div className="w-full h-full bg-gradient-to-br from-[#13153D] via-[#1C174E] to-[#0F172A] text-white p-3.5 flex flex-col justify-between">
              <Globe className="w-4 h-4 text-emerald-300" />
              <p className="text-xs font-mono-num text-indigo-100 truncate">{activeSlide.domain}</p>
            </div>
          ) : (
            <motion.img
              key={activeSlide.id}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
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
            className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent pointer-events-none"
          />
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2 text-[11px] text-white">
            <span className="font-mono-num truncate">{activeSlide.domain}</span>
            <span className="font-mono-num shrink-0 opacity-85">
              {activeSlide.indexLabel}/0{SPOTLIGHT_SLIDES.length}
            </span>
          </div>
        </a>

        {/* Compact Slide Body */}
        <div className="flex-1 min-w-0 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col justify-between gap-2">
          {/* Top Metadata & Compact Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 min-w-0 truncate">
              <span className="font-semibold text-indigo-700 shrink-0">{activeSlide.category}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{activeSlide.shortLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num shrink-0">3s 自動輪播</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1" role="tablist" aria-label="切換輪播項目">
                {SPOTLIGHT_SLIDES.map((slide, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`切換至第 ${idx + 1} 則：${slide.shortLabel}`}
                      onClick={() => setActiveIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        isActive ? 'w-5 bg-indigo-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="上一則輪播"
                  className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-label={isPaused ? '繼續自動輪播' : '暫停自動輪播'}
                  className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {isPaused ? (
                    <Play className="w-3 h-3 text-indigo-600" />
                  ) : (
                    <Pause className="w-3 h-3" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="下一則輪播"
                  className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Title & Concise 1-line Summary */}
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0.45 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="min-w-0"
          >
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 truncate">
              {activeSlide.title}
            </h2>
            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
              {activeSlide.summary}
            </p>
          </motion.div>

          {/* Compact URL & Action Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <a
              href={activeSlide.url}
              target="_blank"
              rel="noopener noreferrer"
              title={activeSlide.url}
              className="text-[11px] font-mono-num text-slate-500 hover:text-indigo-700 underline decoration-slate-300 underline-offset-2 truncate min-w-0 transition-colors"
            >
              {activeSlide.url}
            </a>

            <a
              href={activeSlide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <span>開啟頁面</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 3-Second Auto-Advance Progress Indicator */}
      <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
        <motion.div
          key={`${activeSlide.id}-${isAutoPlaying ? 'run' : 'hold'}`}
          initial={{ scaleX: 0 }}
          animate={isAutoPlaying ? { scaleX: 1 } : { scaleX: 0 }}
          transition={
            isAutoPlaying
              ? { duration: AUTO_PLAY_INTERVAL_MS / 1000, ease: 'linear' }
              : { duration: 0.15 }
          }
          style={{ transformOrigin: 'left' }}
          className="h-full bg-indigo-600"
        />
      </div>
    </section>
  );
}
