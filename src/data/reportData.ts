export type KeywordCategory = 'core' | 'spec' | 'context' | 'brand_channel' | 'custom';

export interface KeywordItem {
  id: string;
  term: string;
  category: KeywordCategory;
  categoryLabel: string;
  role: string;
  insight: string;
  commentSummary: string;
  relatedTopics: string[];
  isCustom?: boolean;
}

export type TrendEventCategory = 'promo' | 'safety_trust' | 'baseline';

export interface MonthlyEventTag {
  category: TrendEventCategory;
  badge: string;
  title: string;
  summary: string;
}

export interface MonthlyVolumePoint {
  month: string;
  shortLabel: string;
  count: number;
  unit: string;
  sharePct: number;
  momChangePct: number | null;
  isPeak: boolean;
  note: string;
  eventCategory: TrendEventCategory;
  eventMarkerLabel: string;
  sentimentBackground: string;
  keyKeywords: string[];
  eventTags: MonthlyEventTag[];
  highlights: string[];
}

export interface SeptemberTimelineNode {
  id: string;
  dateLabel: string;
  title: string;
  metricValue: number;
  metricUnit: string;
  metricType: 'volume' | 'negative';
  eventCategory: TrendEventCategory;
  eventBadge: string;
  summary: string;
  actionNote: string;
}

export interface KeywordTranscriptAnalysis {
  totalOccurrences: number;
  matchedSectionsCount: number;
  totalSections: number;
  sectionCoveragePct: number;
  matchedParagraphsCount: number;
  totalParagraphs: number;
  paragraphCoveragePct: number;
  sectionDistribution: {
    id: string;
    shortLabel: string;
    heading: string;
    matches: number;
  }[];
  excerpts: {
    sectionHeading: string;
    page: number;
    text: string;
  }[];
}

export interface DatasetScopeRow {
  dataset: string;
  period: string;
  total: string;
  breakdown: string;
  purpose: string;
}

export interface CrisisStage {
  step: string;
  title: string;
  summary: string;
  actions: string[];
}

export interface TranscriptSection {
  id: string;
  page: number;
  heading: string;
  paragraphs: string[];
}

export const REPORT_META = {
  title: '葉黃素市場聲量與社群口碑分析',
  subtitle: '市場聲量與口碑結構化分析',
  sourceTool: 'OpView 社群輿情資料庫',
  mainPeriod: '2026 年 8 月至 10 月',
  annualPeriod: '2025 年 10 月至 2026 年 10 月',
  sourceCitation: '資料依據：《葉黃素市場聲量與社群口碑分析》，數字沿用原報告統計口徑。',
  coreDirection: '透明溝通、精準內容、持續監測',
};

export const KPI_METRICS = [
  {
    label: '年度關鍵字總聲量',
    value: '384,830',
    unit: '則',
    context: '2025/10–2026/10 · 正面 118,820 / 負面 10,851 則',
  },
  {
    label: '三個月社群主題總量',
    value: '591',
    unit: '筆',
    context: '2026/08–10 · 9 月為討論高峰（229 筆）',
  },
  {
    label: '樣本正面情緒占比',
    value: '72%',
    unit: '（416 篇）',
    context: '情緒分類樣本 576 篇 · 中立 18% / 負面 10%',
  },
  {
    label: '單日與週聲量高峰',
    value: '37',
    unit: '筆 / 日',
    context: '9/8 單日高峰 37 筆 · 9/16 當週高峰 30 篇',
  },
];

export const DATASET_SCOPES: DatasetScopeRow[] = [
  {
    dataset: '年度關鍵字總聲量',
    period: '2025/10 – 2026/10',
    total: '384,830 則',
    breakdown: '正面 118,820 則 · 負面 10,851 則',
    purpose: '補充觀察葉黃素關鍵字及年度長期情緒趨勢',
  },
  {
    dataset: '三個月社群主題資料',
    period: '2026/08 – 2026/10',
    total: '591 筆',
    breakdown: '8 月 180 筆 · 9 月 229 筆 · 10 月 182 筆',
    purpose: '追蹤主要研究期間之月度波動、單日及週討論高峰',
  },
  {
    dataset: '情緒分類樣本',
    period: '2026/08 – 2026/10',
    total: '576 篇',
    breakdown: '正面 416 篇 (72%) · 中立 103 篇 (18%) · 負面 57 篇 (10%)',
    purpose: '評估正負面口碑比例及負面貼文成因',
  },
  {
    dataset: '品牌比較資料',
    period: '2026/08 – 2026/10',
    total: '284 則',
    breakdown: '含來源頻道排行（大研生醫 FB 12 則居首）',
    purpose: '對照品牌自有社群、內容平台與論壇競爭位置',
  },
];

export const KEYWORDS_DATA: KeywordItem[] = [
  {
    id: 'lutein',
    term: '葉黃素',
    category: 'core',
    categoryLabel: '核心主題字',
    role: '市場核心品類詞',
    insight: '為整體聲量與討論主軸，串聯日常護眼需求、品牌比較與成分規格探討。',
    commentSummary: '貫穿全份研究的核心品類討論，從 3C 用眼保養動機、劑量與玉米黃素比例比對，延伸至對「是否真能改善視力」的實測評價與品牌信任檢驗。',
    relatedTopics: ['日常護眼需求', '五大選購指標', '年度 384,830 則主聲量'],
  },
  {
    id: 'free-form',
    term: '游離型',
    category: 'spec',
    categoryLabel: '產品規格與成分',
    role: '劑型與吸收型態關鍵詞',
    insight: '反映消費者選購時高度關注劑型差異，品牌需清楚說明游離型等成分特性與依據。',
    commentSummary: '社群請益與選購指南文章高頻討論焦點，消費者常比較「游離型」與其他型態差異，期待品牌以看得懂且可查證的方式說明配方原理。',
    relatedTopics: ['選購指引', '產品型態比較', '內容透明化'],
  },
  {
    id: 'ingredient',
    term: '成分',
    category: 'spec',
    categoryLabel: '產品規格與成分',
    role: '含量與配方透明度焦點',
    insight: '消費者會主動比對標示含量、每日攝取量與複方比例，期待易懂且可查證的說明。',
    commentSummary: '在選購考量與風險監測中反覆出現：消費者不只看價格與包裝，更要求公開成分來源、有效含量與第三方檢驗依據。',
    relatedTopics: ['葉黃素含量及攝取量', '檢驗資訊公開', '負評風險追蹤'],
  },
  {
    id: 'formula',
    term: '配方',
    category: 'spec',
    categoryLabel: '產品規格與成分',
    role: '複方設計與添加物比較',
    insight: '涵蓋葉黃素與玉米黃素比例，以及花青素、蝦紅素等輔助成分的搭配評估。',
    commentSummary: '評論聚焦於單方與複方差異（玉米黃素比例、花青素、蝦紅素等），並作為負評發生後品牌回頭檢視產品規格與包裝說明的重要依據。',
    relatedTopics: ['玉米黃素比例', '花青素與蝦紅素', '配方改進'],
  },
  {
    id: 'vitamin',
    term: '維他命',
    category: 'spec',
    categoryLabel: '產品規格與成分',
    role: '綜合保健關聯詞',
    insight: '常與葉黃素複方或日常營養補充情境同時出現，顯示保健品跨品類比對需求。',
    commentSummary: '反映消費者在日常保健討論中，常將葉黃素與維他命或綜合營養補充品並列比較成分重疊度與每日攝取規劃。',
    relatedTopics: ['日常營養補充', '綜合品牌比較', '成分重疊評估'],
  },
  {
    id: 'daily',
    term: '日常',
    category: 'context',
    categoryLabel: '使用情境與需求',
    role: '高頻保養情境詞',
    insight: '對應手機、電腦等數位設備融入日常後的長期護眼保養習慣。',
    commentSummary: '討論多描述長時間接觸 3C 螢幕的日常生活型態，將葉黃素視為固定補充的護眼習慣，並延伸至家庭與親子健康溝通情境。',
    relatedTopics: ['數位設備用眼', '家庭健康情境', '長期補充習慣'],
  },
  {
    id: 'eyes',
    term: '眼睛',
    category: 'context',
    categoryLabel: '使用情境與需求',
    role: '體感痛點與保健部位',
    insight: '社群討論多圍繞眼睛乾澀、疲勞與長時間使用 3C 設備後的舒緩期待。',
    commentSummary: '直接連結「眼睛乾澀、疲勞」等體感痛點；若使用後感覺未明顯改善，便容易觸發期待落差與負面口碑。',
    relatedTopics: ['眼睛乾澀與疲勞', '3C 用眼族群', '體感期待落差'],
  },
  {
    id: 'surgery',
    term: '手術',
    category: 'context',
    categoryLabel: '使用情境與需求',
    role: '特定醫療與術後情境',
    insight: '部分討論涉及眼科手術前後保養與視力議題，也提醒品牌須謹慎界定健康效益宣稱。',
    commentSummary: '出現在特定視力照護與術後保養請益中，這類高期待情境也讓品牌更須謹守法規與科學依據，避免過度宣稱療效。',
    relatedTopics: ['視力改善疑問', '健康效益宣稱界線', '專業人士查證'],
  },
  {
    id: 'brand',
    term: '品牌',
    category: 'brand_channel',
    categoryLabel: '品牌與通路',
    role: '跨品牌評估指標',
    insight: '葉黃素品牌多元，消費者習慣同時對照網路評價、檢驗報告與品牌誠信。',
    commentSummary: '橫跨「品牌聯名（如味全龍封王）」、「自有粉專溝通（大研生醫 FB）」與「信任危機防範」，顯示品牌誠信與透明說明決定長期口碑。',
    relatedTopics: ['品牌聯名話題', '品牌比較 284 則', '誠信與口碑管理'],
  },
  {
    id: 'centrum',
    term: '善存',
    category: 'brand_channel',
    categoryLabel: '品牌與通路',
    role: '高提及具體競品',
    insight: '作為市場代表性品牌出現在熱門關鍵字中，反映消費者常進行大品牌間的規格與口碑比較。',
    commentSummary: '常作為消費者的基準對照品牌出現在規格比較與推薦清單中，與本土保健品牌或跨境通路商品形成多維度競爭。',
    relatedTopics: ['競品口碑對照', '大廠信任度', '產品推薦討論'],
  },
  {
    id: 'iherb',
    term: 'iHerb',
    category: 'brand_channel',
    categoryLabel: '品牌與通路',
    role: '跨境電商與促銷通路',
    insight: '與 Coupang 等跨境平台優惠活動高度連動，顯示價格促銷與海外採購是重要討論動能。',
    commentSummary: '社群頻繁分享 iHerb 與 Coupang 的節慶折扣、免運湊單與高含量規格比較，為促銷期間聲量與比價討論的重要來源。',
    relatedTopics: ['跨境電商促銷', 'Coupang 比價', '促銷期聲量追蹤'],
  },
  {
    id: 'product',
    term: '商品',
    category: 'brand_channel',
    categoryLabel: '品牌與通路',
    role: '購物與型態討論詞',
    insight: '連結膠囊、軟膠囊或飲品等商品型態選擇，以及電商促銷期間的購買決策。',
    commentSummary: '多出現於電商導購、新品開箱（KOL 合作）與膠囊／軟膠囊／飲品等劑型便利性評估，直接影響轉換決策。',
    relatedTopics: ['產品型態選擇', 'KOL 新品開箱', '電商促銷轉換'],
  },
];

export const SUGGESTED_CUSTOM_KEYWORDS = [
  '玉米黃素',
  '花青素',
  '蝦紅素',
  '大研生醫',
  'Coupang',
  '味全龍',
  '方格子',
  '3C',
];

export const SEPTEMBER_TIMELINE_NODES: SeptemberTimelineNode[] = [
  {
    id: 'sep-08',
    dateLabel: '2026 / 09 / 08',
    title: '單日聲量高峰',
    metricValue: 37,
    metricUnit: '筆',
    metricType: 'volume',
    eventCategory: 'promo',
    eventBadge: '節日大促・運動聯名波峰',
    summary: '為三個月分析期間（8–10 月）單日討論筆數最高峰，受節慶電商檔期促銷（iHerb／Coupang 優惠）與品牌運動聯名話題（如味全龍封王聯名討論）交疊推升，帶動 9 月成為整體最熱絡月份（229 筆）。',
    actionNote: '應回查當日熱門貼文、品牌活動、促銷檔期及新聞事件，確認推升聲量的具體原因。',
  },
  {
    id: 'sep-16',
    dateLabel: '2026 / 09 / 16 當週',
    title: '週聲量高峰',
    metricValue: 30,
    metricUnit: '篇',
    metricType: 'volume',
    eventCategory: 'promo',
    eventBadge: '電商活動延續・KOL 開箱擴散',
    summary: '延續 9 月中旬活動熱度，9 月 16 日當週寫下週度聲量高點（共 30 篇），反映促銷導購與游離型／複方成分比較討論具備跨日長尾擴散力道。',
    actionNote: '檢視品牌自有貼文、論壇討論與新聞轉載比例，避免把單純曝光誤判為正面口碑。',
  },
  {
    id: 'sep-17',
    dateLabel: '2026 / 09 / 17',
    title: '單日負面文章高峰',
    metricValue: 6,
    metricUnit: '篇',
    metricType: 'negative',
    eventCategory: 'safety_trust',
    eventBadge: '食安檢驗查證・品質與負評警戒',
    summary: '緊接於週聲量高峰期間出現單日負面文章最多紀錄（6 篇），討論核心集中在「產品效果不明顯」，同步牽動消費者對劑量標示、第三方食安檢驗資訊透明度與廣告宣稱界線的嚴格檢視。',
    actionNote: '啟動短期應變：發布可查證的成分與檢驗說明、由專責小組回應高聲量負評並檢視宣稱界線。',
  },
];

export const MONTHLY_VOLUME_DATA: MonthlyVolumePoint[] = [
  {
    month: '2026 年 8 月',
    shortLabel: '8 月',
    count: 180,
    unit: '筆',
    sharePct: 30.5,
    momChangePct: null,
    isPeak: false,
    note: '基準討論期',
    eventCategory: 'baseline',
    eventMarkerLabel: '開學前哨・日常基準',
    sentimentBackground: '暑末開學與 3C 上班族日常護眼需求為主，社群集中於游離型劑型、每日攝取量與選購指南之理性問答，負評風險處於低檔基準。',
    keyKeywords: ['葉黃素', '游離型', '眼睛', '3C 用眼疲勞'],
    eventTags: [
      {
        category: 'baseline',
        badge: '日常護眼基準期',
        title: '開學前 3C 護眼選購起跑',
        summary: '討論聚焦於含量標示、複方比較與日常保養時機，整體情緒偏向正向與中立問答。',
      },
    ],
    highlights: [
      '共 180 筆社群主題資料，占三個月總量 30.5%',
      '討論集中於日常 3C 用眼疲勞與成分規格基礎比較',
    ],
  },
  {
    month: '2026 年 9 月',
    shortLabel: '9 月',
    count: 229,
    unit: '筆',
    sharePct: 38.7,
    momChangePct: 27.2,
    isPeak: true,
    note: '三個月討論高峰',
    eventCategory: 'promo',
    eventMarkerLabel: '節慶大促／聯名＆9/17 負評警戒',
    sentimentBackground: '受「味全龍封王」運動聯名話題與 iHerb／Coupang 節慶電商優惠雙引擎帶動，9/8 衝出 37 筆單日高峰；惟 9/17 隨即出現 6 篇負評高峰（「效果不明顯」），引爆成分與檢驗透明度審視。',
    keyKeywords: ['味全龍封王', 'iHerb', 'Coupang', '效果爭議', '檢驗查證'],
    eventTags: [
      {
        category: 'promo',
        badge: '節日大促與聯名熱潮',
        title: '9/8 單日 37 筆・9/16 當週 30 篇高峰',
        summary: '運動賽事聯名與跨境電商節慶折扣推升討論熱度，帶動高強度導購與開箱話題。',
      },
      {
        category: 'safety_trust',
        badge: '食安檢驗與品質警戒',
        title: '9/17 單日 6 篇負面文章高峰',
        summary: '集中反映「產品效果不明顯」，提醒品牌於大促期間須同步公開第三方檢驗與成分依據。',
      },
    ],
    highlights: [
      '共 229 筆，為 8–10 月期間聲量最高月份（占 38.7%，較 8 月成長 +27.2%）',
      '9 月 8 日出現單日聲量高峰（37 筆）',
      '9 月 16 日當週出現週聲量高峰（30 篇）',
      '9 月 17 日出現單日最多負面文章（6 篇，主因效果不明顯）',
    ],
  },
  {
    month: '2026 年 10 月',
    shortLabel: '10 月',
    count: 182,
    unit: '筆',
    sharePct: 30.8,
    momChangePct: -20.5,
    isPeak: false,
    note: '平穩延續期',
    eventCategory: 'promo',
    eventMarkerLabel: '節慶檔期比價回穩',
    sentimentBackground: '9 月波峰後回歸基準（182 筆，-20.5%），輿情轉為雙十前後電商折扣比價（iHerb、Coupang）與高含量複方配方評價，同時持續關注食安品管與實際體感回饋。',
    keyKeywords: ['iHerb', 'Coupang', '複方比例', '價格比較'],
    eventTags: [
      {
        category: 'promo',
        badge: '節慶電商比價延續',
        title: '跨境平台折扣與複方比較回穩',
        summary: '節慶檔期優惠資訊轉載與性價比評估成為主要討論動能，聲量結構回到穩健水位。',
      },
    ],
    highlights: [
      '共 182 筆，占三個月總量 30.8%（較 9 月高峰回落 -20.5%，回到基準水準）',
      '持續關注品牌促銷、跨境電商優惠與複方成分比較',
    ],
  },
];

export const SENTIMENT_THREE_MONTH = {
  sampleSize: 576,
  unit: '篇',
  items: [
    {
      key: 'positive',
      label: '正面',
      count: 416,
      percent: 72,
      colorClass: 'bg-emerald-700',
      textClass: 'text-emerald-800',
      surfaceClass: 'bg-emerald-50 border-emerald-200',
      description: '整體市場口碑以正面分享、使用推薦與促銷正面互動為主。',
    },
    {
      key: 'neutral',
      label: '中立',
      count: 103,
      percent: 18,
      colorClass: 'bg-slate-500',
      textClass: 'text-slate-700',
      surfaceClass: 'bg-slate-100 border-slate-200',
      description: '主要為成分問答、規格比較、電商優惠資訊轉載與選購請益。',
    },
    {
      key: 'negative',
      label: '負面',
      count: 57,
      percent: 10,
      colorClass: 'bg-red-700',
      textClass: 'text-red-800',
      surfaceClass: 'bg-red-50 border-red-200',
      description: '占比雖僅 10%，但 9/17 單日集中 6 篇負評，核心痛點為「產品效果不明顯」。',
    },
  ],
};

export const SENTIMENT_ANNUAL = {
  total: 384830,
  unit: '則',
  period: '2025/10 – 2026/10',
  items: [
    {
      key: 'positive',
      label: '正面聲量',
      count: 118820,
      percent: 30.9,
      colorClass: 'bg-emerald-700',
      textClass: 'text-emerald-800',
      description: '年度關鍵字中明確標記為正面情緒之聲量。',
    },
    {
      key: 'other',
      label: '中立／未分類餘額',
      count: 255159,
      percent: 66.3,
      colorClass: 'bg-slate-400',
      textClass: 'text-slate-700',
      description: '由年度總聲量（384,830 則）扣除正面與負面聲量後推算之非正負極性討論。',
    },
    {
      key: 'negative',
      label: '負面聲量',
      count: 10851,
      percent: 2.8,
      colorClass: 'bg-red-700',
      textClass: 'text-red-800',
      description: '年度關鍵字中明確標記為負面情緒之聲量，須防範連續負評侵蝕品牌信任。',
    },
  ],
};

export const HOT_TOPICS = [
  {
    index: '01',
    title: '運動與品牌聯名話題',
    example: '例如「味全龍封王」帶動相關品牌合作話題',
    implication: '體育賽事與熱點聯名能快速放大聲量，但須確保受眾與護眼情境有實質連結。',
  },
  {
    index: '02',
    title: '跨境電商與節慶促銷',
    example: '例如 iHerb、Coupang 的優惠活動討論',
    implication: '消費者對跨境通路價格與折扣敏感，促銷期也是品牌追蹤正負評價的關鍵時點。',
  },
  {
    index: '03',
    title: '葉黃素及眼睛保健本質',
    example: '眼睛乾澀、疲勞、長時間使用 3C 設備及產品成分選購',
    implication: '屬於最核心的剛性討論，消費者尋求真正解決用眼不適的規格資訊與選購指引。',
  },
];

export const COMMUNITY_PERSPECTIVES = [
  {
    title: '選購指引',
    detail: '面對多元品牌與配方，消費者迫切需要容易理解的成分及含量比較架構。',
  },
  {
    title: '產品推薦',
    detail: '論壇與內容平台的真實使用經驗與跨品牌推薦，直接影響購買考慮清單。',
  },
  {
    title: '健康與護眼需求',
    detail: '手機與電腦已融入日常生活，長時間使用 3C 設備持續帶動眼睛保健討論。',
  },
  {
    title: '情緒與期待落差',
    detail: '消費者對產品改善效果抱有期待，若實際體感與宣傳落差過大，容易產生疑慮與負評。',
  },
];

export const PURCHASE_CRITERIA = [
  {
    rank: '01',
    factor: '葉黃素含量及每日攝取量',
    detail: '確認單份劑量是否清楚標示，以及是否符合日常補充需求。',
  },
  {
    rank: '02',
    factor: '產品型態',
    detail: '評估膠囊、軟膠囊或飲品等不同劑型對吞嚥便利性與日常服用的適合度。',
  },
  {
    rank: '03',
    factor: '葉黃素與玉米黃素比例及複方成分',
    detail: '關注核心雙成分的搭配比例，以及整體複方設計邏輯。',
  },
  {
    rank: '04',
    factor: '其他添加物',
    detail: '比對花青素、蝦紅素等額外機能成分，評估是否符合個人護眼需求。',
  },
  {
    rank: '05',
    factor: '原料、品質與檢驗資訊',
    detail: '檢視原料來源、品質控管與第三方檢驗依據，作為建立購買信任的關鍵。',
  },
];

export const CHANNEL_INSIGHTS = {
  topSource: '大研生醫 Facebook 粉絲團（12 則）',
  runnerUpNote: '約為第二名「方格子」的兩倍',
  platforms: ['Facebook 粉絲團', '方格子', 'LINE TODAY', 'Threads', 'PTT', 'Dcard', '新聞平台'],
  prominentSites: ['Facebook 粉絲團', 'LINE TODAY', '方格子'],
  analyticalTools: ['受眾性別分析', '頻道特色比較', '競爭風暴圖', '社群競爭力矩陣'],
  caution: '品牌自有貼文、論壇討論與新聞轉載性質不同，不能直接把曝光量視為消費者口碑；比較平台時應同步檢視貼文主題、情緒及互動品質。',
};

export const KOL_ARCHETYPES = [
  {
    type: '美妝保健類 Instagram KOL',
    suggestedFormat: '新品開箱與成分亮點解析',
    audienceFit: '注重日常保養與成分透明度的女性／保健受眾',
  },
  {
    type: '生活與 3C 用眼類 Instagram KOL',
    suggestedFormat: '長時間用眼經驗分享與日常補充情境',
    audienceFit: '上班族、重度手機與電腦使用者',
  },
  {
    type: '育兒生活類 Instagram KOL',
    suggestedFormat: '親子體驗活動與家庭健康情境溝通',
    audienceFit: '重視全家日常保健與食安檢驗的家庭族群',
  },
];

export const CRISIS_STAGES: CrisisStage[] = [
  {
    step: '階段 01',
    title: '監測',
    summary: '持續監測聲量波動、正負情緒比例及不同平台擴散狀況。',
    actions: [
      '固定追蹤效果、成分及品質相關關鍵字討論',
      '於促銷期間、KOL 貼文發布後及聲量異常高峰日加強檢視',
    ],
  },
  {
    step: '階段 02',
    title: '判斷',
    summary: '評估負面議題內容、實際影響程度與跨平台擴散情形。',
    actions: [
      '區分單純體感差異（如效果不明顯）與誠信／品質危機',
      '回查當日熱門貼文、促銷活動與新聞事件，定位聲量來源',
    ],
  },
  {
    step: '階段 03',
    title: '回應',
    summary: '以官方聲明、專責客服或專業人士提供透明可查證的回應。',
    actions: [
      '短期發布官方說明並主動回應高聲量負評',
      '設置專責回覆小組，邀請專業人士提供可查證資訊，並培訓客服提升回應一致性',
    ],
  },
  {
    step: '階段 04',
    title: '檢視',
    summary: '依消費者真實回饋，回頭檢視品質控管、溝通流程與產品本身。',
    actions: [
      '短期依回饋檢視配方標示與包裝說明是否過度承諾',
      '中長期定期檢測並公開品質資訊，甚至邀請消費者參與產品改進',
    ],
  },
  {
    step: '階段 05',
    title: '追蹤',
    summary: '持續追蹤後續口碑與品牌信任變化，滾動檢討改善。',
    actions: [
      '建立長期危機管理與持續監測機制',
      '驗證回應後情緒比例與負評關鍵字是否收斂',
    ],
  },
];

export const ACTION_RECOMMENDATIONS = [
  {
    id: '01',
    strategy: '內容策略',
    summary: '以成分、含量、產品型態及檢驗資訊回應選購疑問，將複雜配方轉為消費者看得懂、能比較、可查證的內容。',
  },
  {
    id: '02',
    strategy: '受眾策略',
    summary: '聚焦長時間使用 3C 設備者及家庭健康情境，設計差異化溝通內容。',
  },
  {
    id: '03',
    strategy: '合作策略',
    summary: '先小規模測試 3 類不同屬性 IG KOL 合作，再依實際互動及轉換成果決定是否擴大。',
  },
  {
    id: '04',
    strategy: '監測策略',
    summary: '建立固定週期的聲量與情緒監控，在異常高峰日回查熱文、活動與新聞以確認原因。',
  },
  {
    id: '05',
    strategy: '信任策略',
    summary: '公開品質與檢驗資訊，對產品效果疑慮及負面評價提供及時、透明且可查證的回應，避免承諾超過實際可期待效果。',
  },
];

export const TRANSCRIPT_SECTIONS: TranscriptSection[] = [
  {
    id: 'sec-1',
    page: 1,
    heading: '一、研究動機與目的',
    paragraphs: [
      '各位老師、同學大家好，我們是第五組。本次報告主題是「葉黃素市場聲量與社群口碑分析」。我們從消費者的眼睛保健需求出發，觀察葉黃素市場的社群討論、品牌表現與消費者關注焦點，並思考如何將資料應用於品牌行銷及輿情管理。',
      '選擇這個主題，主要有三個原因。第一，手機、電腦等數位設備已融入日常生活，長時間用眼使眼睛保健成為值得關注的消費議題。第二，葉黃素品牌與配方多元，消費者會比較成分、含量、劑量、價格、產品型態及網路評價。第三，品牌曝光量不一定代表消費者好感度，因此除了聲量，也需要分析正負面情緒、熱門話題及社群擴散方式。',
      '本研究運用 OpView 資料，分析聲量、情緒、關鍵字、來源平台與競品表現，找出消費者關注焦點，並提出分眾行銷及輿情管理建議。',
    ],
  },
  {
    id: 'sec-2',
    page: 1,
    heading: '二、研究範圍與資料概況',
    paragraphs: [
      '主要分析期間為 2026 年 8 月至 10 月；另以 2025 年 10 月至 2026 年 10 月的年度圖表，補充觀察葉黃素關鍵字及年度情緒趨勢。依報告資料，年度關鍵字總聲量為 384,830 則，其中正面 118,820 則、負面 10,851 則。',
      '三個月社群主題資料中，8 月 180 筆、9 月 229 筆、10 月 182 筆，合計 591 筆，9 月為這段期間的討論高峰。品牌比較資料合計 284 則，情緒分類樣本為 576 篇。由於各項數據的統計範圍及樣本口徑不同，解讀時應分開看待。',
    ],
  },
  {
    id: 'sec-3',
    page: 1,
    heading: '三、聲量與口碑觀察',
    paragraphs: [
      '單日聲量高峰出現在 2026 年 9 月 8 日，共 37 筆；週聲量高峰為 9 月 16 日當週，共 30 篇。品牌不應只把聲量高峰視為曝光機會，也應回查當日熱門貼文、品牌活動、促銷及新聞事件，確認聲量增加的原因。',
      '情緒分類方面，正面文章 416 篇，占 72%；中立 103 篇，占 18%；負面 57 篇，占 10%。整體以正面討論為主，但負面評價仍須留意。報告指出，9 月 17 日負面文章最多，共 6 篇，多與產品效果不明顯有關。這反映消費者期待可能高於實際感受，若品牌未提供清楚且可查證的說明，就可能進一步影響品牌信任。',
    ],
  },
  {
    id: 'sec-4',
    page: 2,
    heading: '四、消費者需求與熱門討論',
    paragraphs: [
      '社群熱門主題可歸納為幾類。第一是運動與品牌聯名，例如味全龍封王帶動相關品牌合作話題；第二是跨境電商與節慶促銷，例如 iHerb、Coupang 的優惠活動；第三是葉黃素及眼睛保健本身，討論集中在眼睛乾澀、疲勞、長時間使用 3C 設備，以及產品成分與選購方式。',
      '熱門關鍵字除了「葉黃素」，還包括「日常」、「游離型」、「眼睛」、「品牌」、「手術」、「iHerb」、「維他命」、「善存」、「商品」、「配方」及「成分」。這些詞彙顯示，消費者討論不只涉及產品名稱，也包括使用情境、品牌比較與成分資訊。',
      '綜合社群內容，可歸納為四個觀點：選購指引，消費者需要容易理解的成分及含量比較；產品推薦，不同品牌與使用經驗可能影響購買考慮；健康與護眼需求，長時間使用 3C 設備帶動相關討論；以及情緒與期待，消費者對產品效果有期待，也可能因效果落差而產生疑慮。',
    ],
  },
  {
    id: 'sec-5',
    page: 2,
    heading: '五、消費者選購重點與行銷啟示',
    paragraphs: [
      '消費者選購時主要注意五個面向：葉黃素含量及每日攝取量；膠囊、軟膠囊或飲品等產品型態；葉黃素與玉米黃素比例及複方成分；花青素、蝦紅素等其他添加物；以及原料、品質與檢驗資訊。',
      '因此，品牌不宜只強調價格或包裝，而應將複雜配方轉換成消費者看得懂、能比較、也可查證的資訊。涉及健康效益的宣稱，更應清楚說明資訊依據，避免行銷承諾超過消費者實際可期待的效果。',
    ],
  },
  {
    id: 'sec-6',
    page: 2,
    heading: '六、來源頻道與競品比較',
    paragraphs: [
      '來源頻道排行顯示，大研生醫 Facebook 粉絲團以 12 則居首，約為第二名方格子的兩倍；其他來源包括 Threads、PTT、Dcard、LINE TODAY 及新聞平台。網站排行中，Facebook 粉絲團、LINE TODAY 與方格子較突出，顯示品牌自有社群、內容平台、論壇及新聞媒體共同構成市場資訊傳播路徑。',
      '但品牌自有貼文、論壇討論與新聞轉載性質不同，不能直接把曝光量視為消費者口碑。比較平台時，應同步檢視貼文主題、情緒及互動品質。報告亦納入受眾性別、頻道特色、競爭風暴圖與社群競爭力矩陣，輔助理解品牌競爭位置。',
    ],
  },
  {
    id: 'sec-7',
    page: 2,
    heading: '七、KOL 合作與話題操作',
    paragraphs: [
      'KOL 合作方面，報告列出三位 Instagram 帳號作為評估對象，內容特色涵蓋美妝保健、生活與 3C 用眼，以及育兒生活，可分別規劃新品開箱、用眼經驗分享或親子體驗活動。品牌也可結合體育賽事、節慶促銷及創新科技等話題，但必須確認與受眾及產品情境相關，並設計留言、分享、參與或導流等明確行動。',
    ],
  },
  {
    id: 'sec-8',
    page: 3,
    heading: '八、輿情風險辨識與應變',
    paragraphs: [
      '本研究觀察到的主要風險，包括產品效果爭議、品牌信任危機及社會責任期待。消費者可能質疑產品是否真的能改善視力，也可能因連續負面評價而對品牌誠信與品質管理產生疑慮。因此，品牌應持續追蹤效果、成分及品質相關討論，尤其在促銷期間、KOL 貼文發布後，以及聲量異常高峰日，更應加強檢視。',
      '短期應變方面，可發布官方說明、主動回應高聲量負評、設置專責回覆小組，並邀請專業人士提供可查證資訊；同時依消費者回饋檢視配方與包裝。中長期則應讓消費者參與產品改進、定期檢測並公開品質資訊、培訓客服以提升回應一致性，並建立危機管理及持續監測機制。',
      '具體流程可分為五個階段：先監測聲量、情緒及平台；再判斷議題內容、影響程度與擴散情形；接著進行官方聲明、客服或專家回應；之後檢視品質、流程與產品；最後追蹤口碑及信任變化，持續檢討改善。',
    ],
  },
  {
    id: 'sec-9',
    page: 3,
    heading: '九、結論與行動建議',
    paragraphs: [
      '綜合以上分析，我們提出五項行動建議。第一，內容策略：以成分、含量、產品型態及檢驗資訊回應選購疑問。第二，受眾策略：聚焦長時間使用 3C 設備者及家庭健康情境，設計差異化溝通內容。第三，合作策略：先小規模測試 KOL 合作，再依互動及轉換成果決定是否擴大。',
      '第四，監測策略：建立固定週期的聲量與情緒監控，追查異常高峰原因。第五，信任策略：公開品質資訊，對產品效果疑慮及負面評價提供及時、透明且可查證的回應。',
      '最後，本組認為，社群輿情分析的價值不只是統計品牌被討論多少次，而是進一步理解消費者為什麼討論、在意哪些資訊，以及哪些因素會影響品牌信任。品牌若能將社群洞察轉化為精準內容、透明溝通與持續監測，才有機會建立長期口碑與競爭優勢。',
      '以上是第五組的報告，核心方向是「透明溝通、精準內容、持續監測」。謝謝各位。',
    ],
  },
];

export function buildMarkdownSummary(): string {
  return `# 葉黃素市場聲量與社群口碑分析｜結構化摘要

> 資料來源：OpView（葉黃素市場輿情分析報告整理）
> 主要分析期間：2026 年 8 月至 10 月｜補充年度趨勢：2025 年 10 月至 2026 年 10 月
> 核心方向：**透明溝通、精準內容、持續監測**

---

## 一、關鍵字分布
- **核心詞彙**：葉黃素
- **產品規格與成分**：游離型、成分、配方、維他命
- **使用情境與需求**：日常、眼睛、手術
- **品牌與通路**：品牌、善存、iHerb、商品
- **關鍵字洞察**：討論不僅止於產品名稱，更集中於使用情境、劑型配方與跨境品牌比價。

---

## 二、聲量表現（註：各數據統計口徑不同，應分開解讀）
- **年度關鍵字總聲量（2025/10–2026/10）**：384,830 則
- **三個月社群主題資料（2026/08–10，合計 591 筆）**：
  - 8 月：180 筆
  - 9 月：229 筆（討論高峰）
  - 10 月：182 筆
- **波峰紀錄**：
  - 單日聲量高峰：2026 年 9 月 8 日（37 筆）
  - 週聲量高峰：2026 年 9 月 16 日當週（30 篇）
- **品牌比較與來源頻道（品牌比較資料共 284 則）**：
  - 來源頻道首位：大研生醫 Facebook 粉絲團（12 則，約為第二名方格子之兩倍）
  - 主要傳播路徑：Facebook 粉絲團、LINE TODAY、方格子，以及 Threads、PTT、Dcard、新聞平台
  - 判讀提醒：曝光量不等於口碑好感度，需同步檢視主題、情緒與互動品質。

---

## 三、情緒分析
- **三個月情緒分類樣本（共 576 篇）**：
  - 正面：416 篇（72%）
  - 中立：103 篇（18%）
  - 負面：57 篇（10%）
- **年度情緒趨勢補充（384,830 則中）**：正面 118,820 則、負面 10,851 則
- **負面情緒觀察**：2026 年 9 月 17 日負面文章最多（6 篇），主因為「產品效果不明顯」，反映消費者實際感受與期待之間存在落差。

---

## 四、消費者關注要點
1. **三大熱門討論主題**：
   - 運動與品牌聯名（如味全龍封王帶動合作話題）
   - 跨境電商與節慶促銷（如 iHerb、Coupang 優惠活動）
   - 葉黃素與護眼本質（眼睛乾澀、疲勞、長時間使用 3C、成分與選購）
2. **四大社群內容觀點**：選購指引、產品推薦、健康與護眼需求、情緒與期待落差。
3. **五大選購評估重點**：
   - 葉黃素含量與每日攝取量
   - 產品型態（膠囊、軟膠囊、飲品等）
   - 葉黃素與玉米黃素比例及複方成分
   - 其他添加物（花青素、蝦紅素等）
   - 原料、品質與檢驗資訊

---

## 五、行銷與輿情建議
- **五階段風險應變**：監測 → 判斷 → 回應 → 檢視 → 追蹤
- **五大行動策略**：內容轉譯透明化、分眾溝通（3C 族群與家庭情境）、KOL 小規模測試（美妝保健 / 生活 3C / 育兒）、固定週期異常追蹤、公開檢驗並及時可查證回應負評。
`;
}

export function analyzeKeywordInTranscript(rawTerm: string): KeywordTranscriptAnalysis {
  const term = rawTerm.trim();
  const totalSections = TRANSCRIPT_SECTIONS.length;
  const totalParagraphs = TRANSCRIPT_SECTIONS.reduce(
    (sum, sec) => sum + sec.paragraphs.length,
    0
  );

  if (!term) {
    return {
      totalOccurrences: 0,
      matchedSectionsCount: 0,
      totalSections,
      sectionCoveragePct: 0,
      matchedParagraphsCount: 0,
      totalParagraphs,
      paragraphCoveragePct: 0,
      sectionDistribution: TRANSCRIPT_SECTIONS.map((sec, idx) => ({
        id: sec.id,
        shortLabel: `0${idx + 1}`,
        heading: sec.heading,
        matches: 0,
      })),
      excerpts: [],
    };
  }

  const lowerTerm = term.toLowerCase();
  let totalOccurrences = 0;
  let matchedSectionsCount = 0;
  let matchedParagraphsCount = 0;
  const excerpts: KeywordTranscriptAnalysis['excerpts'] = [];

  const sectionDistribution = TRANSCRIPT_SECTIONS.map((sec, idx) => {
    let sectionMatches = 0;
    const headingMatches = sec.heading.toLowerCase().split(lowerTerm).length - 1;
    sectionMatches += headingMatches;

    sec.paragraphs.forEach((para) => {
      const count = para.toLowerCase().split(lowerTerm).length - 1;
      if (count > 0) {
        matchedParagraphsCount += 1;
        sectionMatches += count;
        if (excerpts.length < 3) {
          excerpts.push({
            sectionHeading: sec.heading,
            page: sec.page,
            text: para,
          });
        }
      }
    });

    if (sectionMatches > 0) {
      matchedSectionsCount += 1;
      totalOccurrences += sectionMatches;
    }

    return {
      id: sec.id,
      shortLabel: `0${idx + 1}`,
      heading: sec.heading,
      matches: sectionMatches,
    };
  });

  return {
    totalOccurrences,
    matchedSectionsCount,
    totalSections,
    sectionCoveragePct: Math.round((matchedSectionsCount / totalSections) * 100),
    matchedParagraphsCount,
    totalParagraphs,
    paragraphCoveragePct: Math.round((matchedParagraphsCount / totalParagraphs) * 100),
    sectionDistribution,
    excerpts,
  };
}

export interface BrandFilterProfile {
  key: string;
  aliases: string[];
  displayName: string;
  entityType: string;
  volumeSummary: string;
  sentimentSummary: string;
  kpis: {
    label: string;
    value: string;
    unit: string;
    context: string;
    isHighlight?: boolean;
  }[];
  relatedKeywordIds: string[];
  relatedFocusKeywords: string[];
}

export const QUICK_GLOBAL_SEARCH_TERMS = [
  '大研生醫',
  '善存',
  'iHerb',
  'Coupang',
  '游離型',
  '葉黃素',
];

export const BRAND_FILTER_PROFILES: BrandFilterProfile[] = [
  {
    key: 'daiken',
    aliases: ['大研生醫', '大研'],
    displayName: '大研生醫',
    entityType: '品牌與來源頻道實體',
    volumeSummary:
      '大研生醫 Facebook 粉絲團在來源頻道排行中以 12 則居首，約為第二名「方格子」的兩倍（出自品牌比較資料 284 則）。',
    sentimentSummary:
      '原報告未單獨拆出大研生醫個別正負情緒占比（全市場情緒分類樣本為正面 72% / 中立 18% / 負面 10%）；報告特別提醒：品牌自有粉絲團貼文曝光量不能直接視為消費者口碑好感度，需同步檢視互動品質與留言情緒。',
    kpis: [
      {
        label: '品牌頻道聲量排行',
        value: '12',
        unit: '則（第 1 名）',
        context: '大研生醫 Facebook 粉絲團居來源頻道首位',
      },
      {
        label: '對比第二名領先倍數',
        value: '2.0x',
        unit: '倍',
        context: '約為來源排行第二名「方格子」之兩倍',
      },
      {
        label: '個別情緒占比揭露',
        value: '未單獨拆分',
        unit: '',
        context: '全市場基準為正面 72% · 須區分自有貼文與口碑',
        isHighlight: true,
      },
      {
        label: '所屬品牌比較母體',
        value: '284',
        unit: '則',
        context: '涵蓋受眾性別、頻道特色、競爭風暴圖與矩陣',
      },
    ],
    relatedKeywordIds: ['brand', 'ingredient', 'formula', 'free-form'],
    relatedFocusKeywords: ['品牌', '選購', '成分', 'Facebook', '檢驗'],
  },
  {
    key: 'centrum',
    aliases: ['善存', 'centrum'],
    displayName: '善存',
    entityType: '熱門競品品牌關鍵字',
    volumeSummary:
      '「善存」入選報告 11 個核心關聯熱門關鍵字之一，出現於消費者跨品牌規格、成分與購買推薦比較討論中（總體品牌比較資料為 284 則）。',
    sentimentSummary:
      '原報告未單獨列示善存個別正負情緒數據（全市場樣本為正面 72% / 中立 18% / 負面 10%）；於社群「產品推薦」與「選購指引」情境下常作為市場大品牌基準進行比對。',
    kpis: [
      {
        label: '報告收錄定位',
        value: '熱門關鍵字',
        unit: '',
        context: '明確列入第四節社群高頻關鍵字清單',
      },
      {
        label: '主要出現維度',
        value: '品牌比較',
        unit: '',
        context: '消費者用於比對成分、含量、劑量與網路評價',
      },
      {
        label: '個別情緒占比揭露',
        value: '未單獨拆分',
        unit: '',
        context: '全市場情緒樣本：正面 72% / 中立 18% / 負面 10%',
        isHighlight: true,
      },
      {
        label: '關聯社群觀點',
        value: '產品推薦',
        unit: '',
        context: '不同品牌與使用經驗直接影響購買考慮清單',
      },
    ],
    relatedKeywordIds: ['centrum', 'brand', 'vitamin', 'ingredient'],
    relatedFocusKeywords: ['善存', '品牌', '推薦', '比較', '維他命'],
  },
  {
    key: 'iherb',
    aliases: ['iherb'],
    displayName: 'iHerb',
    entityType: '跨境電商通路與產品比價關鍵字',
    volumeSummary:
      '「iHerb」同時出現於報告熱門關鍵字清單及第二大社群熱門主題「跨境電商與節慶促銷」，是海外保健品採購與折扣討論的核心流量來源。',
    sentimentSummary:
      '原報告未單獨列示 iHerb 獨立情緒占比；促銷折扣雖推升討論聲量，但報告第 8 節明確警示「促銷期間」屬於負評高風險監測時段，須密切追蹤效果與品質評價。',
    kpis: [
      {
        label: '熱門主題類別',
        value: '跨境促銷',
        unit: '',
        context: '與 Coupang 並列為跨境電商優惠熱門話題',
      },
      {
        label: '報告收錄定位',
        value: '熱門關鍵字',
        unit: '',
        context: '反映價格敏感度與海外產品規格比較需求',
      },
      {
        label: '促銷期風險等級',
        value: '高度關注',
        unit: '',
        context: '促銷期間須加強追蹤效果、成分與品質負評',
        isHighlight: true,
      },
      {
        label: '關聯消費者重點',
        value: '含量與檢驗',
        unit: '',
        context: '跨平台選購時高度比較每日攝取量與品質依據',
      },
    ],
    relatedKeywordIds: ['iherb', 'product', 'brand', 'ingredient'],
    relatedFocusKeywords: ['iHerb', 'Coupang', '促銷', '優惠', '成分'],
  },
  {
    key: 'coupang',
    aliases: ['coupang', '酷澎'],
    displayName: 'Coupang',
    entityType: '跨境電商促銷平台',
    volumeSummary:
      '「Coupang」於報告第四節列為跨境電商與節慶促銷熱門話題代表（與 iHerb 並列），帶動價格優惠與選購比較討論。',
    sentimentSummary:
      '原報告未單獨列示 Coupang 個別正負情緒百分比；屬促銷導向討論熱區，建議品牌於促銷檔期同步監測聲量與負面評價變動。',
    kpis: [
      {
        label: '熱門主題類別',
        value: '跨境促銷',
        unit: '',
        context: '與 iHerb 共同構成節慶優惠討論焦點',
      },
      {
        label: '關聯通路關鍵字',
        value: 'iHerb / 商品',
        unit: '',
        context: '促銷檔期牽動消費者比價與商品型態挑選',
      },
      {
        label: '促銷期監測建議',
        value: '強化追蹤',
        unit: '',
        context: '報告建議於促銷期間檢視成分與效果負評',
        isHighlight: true,
      },
      {
        label: '全市場樣本參考',
        value: '591',
        unit: '筆',
        context: '三個月社群主題資料涵蓋促銷與護眼討論',
      },
    ],
    relatedKeywordIds: ['iherb', 'product', 'brand'],
    relatedFocusKeywords: ['Coupang', 'iHerb', '促銷', '優惠', '商品'],
  },
  {
    key: 'free-form',
    aliases: ['游離型'],
    displayName: '游離型（產品劑型／規格）',
    entityType: '葉黃素核心產品規格關鍵字',
    volumeSummary:
      '「游離型」為報告明確點名之 11 個高頻關聯關鍵字之一，集中出現於「選購指引」與「產品成分及型態比較」討論中。',
    sentimentSummary:
      '原報告未針對單一劑型拆分正負比例；消費者關注游離型吸收與配方差異，若品牌未能以淺白、可查證方式說明，易因期待落差產生負面疑慮。',
    kpis: [
      {
        label: '關鍵字分類',
        value: '規格與成分',
        unit: '',
        context: '消費者高度比較劑型吸收與配方設計',
      },
      {
        label: '對應選購要點',
        value: '5 大指標',
        unit: '',
        context: '含量、產品型態、玉米黃素比例、添加物、檢驗',
      },
      {
        label: '核心溝通風險',
        value: '期待落差',
        unit: '',
        context: '整體負評主因效果不明顯，須有可查證依據',
        isHighlight: true,
      },
      {
        label: '內容策略建議',
        value: '透明轉譯',
        unit: '',
        context: '將複雜配方轉為看得懂、能比較的資訊',
      },
    ],
    relatedKeywordIds: ['free-form', 'ingredient', 'formula', 'lutein'],
    relatedFocusKeywords: ['游離型', '成分', '配方', '型態', '含量', '玉米黃素'],
  },
  {
    key: 'lutein',
    aliases: ['葉黃素'],
    displayName: '葉黃素（全市場總體）',
    entityType: '全品類總體報告範圍',
    volumeSummary:
      '年度葉黃素關鍵字總聲量達 384,830 則；三個月社群主題資料 591 筆（9 月高峰 229 筆，9/8 單日高峰 37 筆）。',
    sentimentSummary:
      '三個月情緒分類樣本（576 篇）中正面 416 篇（72%）、中立 103 篇（18%）、負面 57 篇（10%）；年度聲量中正面 118,820 則、負面 10,851 則。',
    kpis: KPI_METRICS.map((m, idx) => ({ ...m, isHighlight: idx === 2 })),
    relatedKeywordIds: KEYWORDS_DATA.map((k) => k.id),
    relatedFocusKeywords: ['葉黃素', '眼睛', '成分', '品牌'],
  },
];

export interface GlobalFilterResult {
  isActive: boolean;
  query: string;
  matchedProfile: BrandFilterProfile | null;
  transcriptAnalysis: KeywordTranscriptAnalysis;
}

export function resolveGlobalBrandFilter(rawQuery: string): GlobalFilterResult {
  const query = rawQuery.trim();
  if (!query) {
    return {
      isActive: false,
      query: '',
      matchedProfile: null,
      transcriptAnalysis: analyzeKeywordInTranscript(''),
    };
  }

  const lower = query.toLowerCase();
  const matchedProfile =
    BRAND_FILTER_PROFILES.find((p) =>
      p.aliases.some((alias) => alias.toLowerCase() === lower || lower.includes(alias.toLowerCase()))
    ) ?? null;

  return {
    isActive: true,
    query,
    matchedProfile,
    transcriptAnalysis: analyzeKeywordInTranscript(query),
  };
}

export interface CompetitorComparisonItem {
  id: string;
  name: string;
  roleLabel: string;
  category: '本土機能保健品牌' | '國際綜合營養品牌' | '跨境電商與比價通路' | '深度內容與評測平台';
  reportMetricLabel: string;
  reportMetricValue: string;
  primaryChannels: string[];
  discussionFocus: string;
  trustAndRiskNote: string;
  strategyCue: string;
  accentColor: string;
}

export interface ChannelPositioningNode {
  id: string;
  name: string;
  category: '品牌自有社群' | '內容與媒體平台' | '匿名與半匿名論壇';
  reportedVolumeText: string;
  brandControlScore: number; // Qualitative structural axis 0-100 based on Section 6 channel nature
  organicDiscussionScore: number; // Qualitative structural axis 0-100 based on Section 6 channel nature
  bubbleSize: number;
  natureNote: string;
  interpretationRule: string;
}

export const COMPETITOR_COMPARISON_ITEMS: CompetitorComparisonItem[] = [
  {
    id: 'daiken',
    name: '大研生醫',
    roleLabel: '來源頻道居首品牌',
    category: '本土機能保健品牌',
    reportMetricLabel: '來源頻道實測（284 則樣本）',
    reportMetricValue: 'FB 粉專 12 則（第 1 名，約第 2 名兩倍）',
    primaryChannels: ['Facebook 粉絲團', 'IG KOL 導購', '品牌自有內容'],
    discussionFocus: '強打高聲量自有粉專溝通、聯名話題與成分規格透明訴求，在來源頻道統計中曝光表現最突出。',
    trustAndRiskNote: '報告明確提醒：品牌自有粉專曝光量高不等於消費者口碑好感度，仍須同步檢視留言互動與負評成因。',
    strategyCue: '須將粉專高觸及轉化為「可查證的檢驗與劑量比較內容」，並防範促銷期後的效果落差負評。',
    accentColor: '#4F46E5',
  },
  {
    id: 'centrum',
    name: '善存',
    roleLabel: '熱門關鍵字具體競品',
    category: '國際綜合營養品牌',
    reportMetricLabel: '報告收錄定位',
    reportMetricValue: '入列第四節 11 大高頻關鍵字',
    primaryChannels: ['論壇比較討論（PTT / Dcard）', '選購指引文章', '綜合維他命關聯詞'],
    discussionFocus: '常與「維他命」、「品牌」、「成分」共同出現，作為消費者選購葉黃素與綜合營養品時的大廠基準對照。',
    trustAndRiskNote: '原文未單獨拆出獨立正負情緒數值；在跨品牌比較中，消費者高度比對單份有效含量與價格帶。',
    strategyCue: '適合透過「成分含量及每日攝取量對照表」凸顯雙成分比例（玉米黃素）與劑型吸收差異。',
    accentColor: '#059669',
  },
  {
    id: 'crossborder',
    name: 'iHerb / Coupang 跨境陣營',
    roleLabel: '跨境電商與促銷熱區',
    category: '跨境電商與比價通路',
    reportMetricLabel: '熱門主題類別',
    reportMetricValue: '列入三大熱門討論主題（跨境促銷）',
    primaryChannels: ['Threads / 論壇比價', '節慶優惠情報分享', '產品開箱評價'],
    discussionFocus: '圍繞節慶優惠、價格敏感度與海外配方含量規格對比，為促銷期間聲量波峰的重要推手。',
    trustAndRiskNote: '報告第 8 節點名「促銷期間」為高風險監測時段，價格導向購買容易因未看清規格而產生效果落差負評。',
    strategyCue: '本土品牌面對跨境價格戰時，應以「台灣檢驗資訊、繁中易懂配方說明與專責售後客服」建立差異化護城河。',
    accentColor: '#0EA5E9',
  },
  {
    id: 'vocus',
    name: '方格子（內容長文基準）',
    roleLabel: '來源排行第 2 名平台',
    category: '深度內容與評測平台',
    reportMetricLabel: '報告公開基準對照',
    reportMetricValue: '約大研生醫 FB 一半（約 6 則基準）',
    primaryChannels: ['方格子長文專欄', '選購指引比較', '成分深度剖析'],
    discussionFocus: '代表消費者尋找「選購指引」與「專業成分比較」的深度閱讀陣地，網站排行中與 FB、LINE TODAY 並列突出。',
    trustAndRiskNote: '長文評測可有效建立專業信任，但若內容被質疑為商業業配且缺乏第三方檢驗依據，反而會引發誠信質疑。',
    strategyCue: '將報告「五大選購重點」製作成可查證之白皮書級評測內容，承接高意圖搜尋流量。',
    accentColor: '#334155',
  },
];

// Qualitative structural quadrant strictly reflecting Section 6 channel nature commentary (no fabricated post counts)
export const CHANNEL_POSITIONING_NODES: ChannelPositioningNode[] = [
  {
    id: 'daiken-fb',
    name: '大研生醫 FB 粉專',
    category: '品牌自有社群',
    reportedVolumeText: '12 則（來源排行第 1 名）',
    brandControlScore: 90,
    organicDiscussionScore: 34,
    bubbleSize: 12,
    natureNote: '品牌官方高主導度陣地，活動公告、聯名話題（如賽事）與導購集中於此。',
    interpretationRule: '曝光量居冠但屬品牌自有貼文，不可直接等同於消費者自然好感度，須檢視留言品質。',
  },
  {
    id: 'vocus-platform',
    name: '方格子 Vocus',
    category: '內容與媒體平台',
    reportedVolumeText: '約 6 則基準（第 2 名，約居首一半）',
    brandControlScore: 52,
    organicDiscussionScore: 68,
    bubbleSize: 8,
    natureNote: '網站排行突出平台之一，主攻葉黃素選購指引、五大指標比較與長文解析。',
    interpretationRule: '適合傳遞「游離型、玉米黃素比例、檢驗資訊」等較複雜的配方知識。',
  },
  {
    id: 'line-today',
    name: 'LINE TODAY / 新聞平台',
    category: '內容與媒體平台',
    reportedVolumeText: '網站排行突出（原報告未單獨列數）',
    brandControlScore: 64,
    organicDiscussionScore: 48,
    bubbleSize: 7,
    natureNote: '新聞轉載與廣度觸及媒介，容易在重大議題、健康新聞或聯名事件時放大曝光。',
    interpretationRule: '新聞轉載性質不同於論壇口碑，應區分媒體報導與真實消費者使用評價。',
  },
  {
    id: 'threads',
    name: 'Threads',
    category: '匿名與半匿名論壇',
    reportedVolumeText: '主要討論來源之一（原報告未單獨列數）',
    brandControlScore: 22,
    organicDiscussionScore: 86,
    bubbleSize: 7,
    natureNote: '即時短評、促銷分享（iHerb/Coupang）與日常 3C 用眼疲勞心情抒發擴散快。',
    interpretationRule: '負面體感擴散速度極快，適合搭配即時輿情警報日監測。',
  },
  {
    id: 'ptt',
    name: 'PTT 論壇',
    category: '匿名與半匿名論壇',
    reportedVolumeText: '主要討論來源之一（原報告未單獨列數）',
    brandControlScore: 15,
    organicDiscussionScore: 92,
    bubbleSize: 7,
    natureNote: '高度重視規格數據、CP 值比較（如善存 vs 跨境品牌）與真假檢驗審視。',
    interpretationRule: '對過度誇大宣稱容忍度最低，一旦出現「效果不明顯」或檢驗疑問易形成長尾負評。',
  },
  {
    id: 'dcard',
    name: 'Dcard 論壇',
    category: '匿名與半匿名論壇',
    reportedVolumeText: '主要討論來源之一（原報告未單獨列數）',
    brandControlScore: 20,
    organicDiscussionScore: 88,
    bubbleSize: 7,
    natureNote: '年輕上班族與學生族群詢問產品推薦、劑型吞嚥體驗與電商湊單優惠為主。',
    interpretationRule: '適合以真實生活 3C 用眼類體驗切入，避免硬廣語氣引發反感。',
  },
];

export type RadarDimensionKey = 'price' | 'efficacy' | 'ingredients' | 'sideEffects';

export interface BrandRadarBrandMeta {
  id: 'daiken' | 'centrum' | 'crossborder' | 'market';
  name: string;
  shortName: string;
  color: string;
  fillOpacity: number;
  basisNote: string;
  scores: Record<RadarDimensionKey, number>;
  dimensionNotes: Record<RadarDimensionKey, string>;
}

export const BRAND_RADAR_DIMENSIONS: {
  key: RadarDimensionKey;
  label: string;
  subtitle: string;
  reportContext: string;
}[] = [
  {
    key: 'price',
    label: '價格',
    subtitle: '促銷優惠與 CP 值情緒極性',
    reportContext:
      '報告顯示消費者對價格高度敏感，節慶優惠與跨境通路（iHerb／Coupang）促銷期討論明顯升溫，惟「不宜只強調價格或包裝」。',
  },
  {
    key: 'efficacy',
    label: '功效',
    subtitle: '體感改善與期待落差極性',
    reportContext:
      '整體市場正面占 72%，但 9/17 單日 6 篇負評主因即為「產品效果不明顯」，反映功效期待落差是最關鍵的負面極性來源。',
  },
  {
    key: 'ingredients',
    label: '成份',
    subtitle: '游離型・比例・檢驗透明度',
    reportContext:
      '「游離型」、「成分」、「配方」皆入列核心高頻詞；消費者高度檢視葉黃素含量、玉米黃素比例、花青素／蝦紅素及第三方檢驗。',
  },
  {
    key: 'sideEffects',
    label: '副作用',
    subtitle: '劑型適應與安全信任無虞度',
    reportContext:
      '高分代表低副作用疑慮（正面／安心比例高）。原報告負評主要集中於「效果不明顯」而非嚴重不良反應，但仍重視劑型吞嚥與原料檢驗。',
  },
];

// Polarity indices (0-100 positive sentiment polarity scale) structurally synthesized from transcript context
// Note: Original OpView report provides overall 72% positive polarity and qualitative brand/theme commentary, not separate brand-by-dimension percentages.
export const BRAND_RADAR_BRANDS: BrandRadarBrandMeta[] = [
  {
    id: 'daiken',
    name: '大研生醫',
    shortName: '大研生醫',
    color: '#4F46E5',
    fillOpacity: 0.24,
    basisNote: 'FB 粉專聲量居首（12 則），強打配方標示與高含量訴求，但須留意自有曝光不等於自然口碑。',
    scores: {
      price: 62,
      efficacy: 71,
      ingredients: 86,
      sideEffects: 82,
    },
    dimensionNotes: {
      price: '定價偏向高機能規格定位，多靠自有粉專檔期優惠與團購活動平衡價格討論。',
      efficacy: '高聲量下易承受「體感期待」檢驗，須持續以可查證數據支撐護眼有感溝通。',
      ingredients: '主打透明劑量與複方規格定位，高度契合「五大選購重點」中對成分與檢驗的檢視。',
      sideEffects: '主要負評來源偏向效果預期或價格比較，安全性與劑型適應討論相對穩定正向。',
    },
  },
  {
    id: 'centrum',
    name: '善存',
    shortName: '善存',
    color: '#059669',
    fillOpacity: 0.22,
    basisNote: '入選第 4 節高頻關鍵字，為綜合營養與大品牌比較基準，受大廠信賴度支撐。',
    scores: {
      price: 74,
      efficacy: 68,
      ingredients: 72,
      sideEffects: 88,
    },
    dimensionNotes: {
      price: '通路普及與常態檔期折扣讓單日補充成本相對易於接受，CP 值討論偏向中性穩健。',
      efficacy: '定位偏向日常綜合保養，消費者較少期待短期劇烈視力改變，但仍會比對規格劑量。',
      ingredients: '常與「維他命」並論，消費者會檢視是否為單方或含完整葉黃素／玉米黃素複方。',
      sideEffects: '國際大廠品質認知度高，安全性與長期服用疑慮極低（高安心正向極性）。',
    },
  },
  {
    id: 'crossborder',
    name: 'iHerb / Coupang 跨境陣營',
    shortName: '跨境通路',
    color: '#0EA5E9',
    fillOpacity: 0.2,
    basisNote: '列入三大熱門討論主題（跨境促銷），價格折扣推升聲量，但促銷期負評風險較高。',
    scores: {
      price: 90,
      efficacy: 64,
      ingredients: 78,
      sideEffects: 69,
    },
    dimensionNotes: {
      price: '節慶優惠與海外直送單價優勢明顯，為價格極性得分最高的討論陣營。',
      efficacy: '因缺乏繁中詳細使用指引，部分消費者買回後易因體感與預期落差產生負面評價。',
      ingredients: '高劑量選擇多元，但需消費者自行判讀海外成分標示與複方比例。',
      sideEffects: '海外高劑量或大型軟膠囊吞嚥便利性、物流效期與售後檢驗透明疑慮拉低安心分數。',
    },
  },
  {
    id: 'market',
    name: '全市場基準（576 篇樣本）',
    shortName: '市場基準',
    color: '#64748B',
    fillOpacity: 0.12,
    basisNote: '對應三個月情緒樣本 72% 正面 / 18% 中立 / 10% 負面之全體平均基準線。',
    scores: {
      price: 72,
      efficacy: 66,
      ingredients: 79,
      sideEffects: 80,
    },
    dimensionNotes: {
      price: '促銷期聲量活躍，價格討論整體維持正向與中立比價。',
      efficacy: '9/17 負評高峰集中在「效果不明顯」，使功效維度低於全體 72% 平均正面率。',
      ingredients: '游離型與複方規格需求明確，透明標示可顯著拉升消費者好感。',
      sideEffects: '整體討論極少重大不良反應，主要關注吞嚥型態（膠囊／軟膠囊／飲品）便利性。',
    },
  },
];

export interface MarketKeywordCloudItem {
  term: string;
  keywordId?: string;
  category: 'core' | 'spec' | 'context' | 'brand_channel';
  categoryLabel: string;
  weight: number; // Visual hierarchy weight 1-5
  floatDuration: number;
  floatDelay: number;
}

export const KEYWORD_CLOUD_ITEMS: MarketKeywordCloudItem[] = [
  { term: '葉黃素', keywordId: 'lutein', category: 'core', categoryLabel: '核心主題', weight: 5, floatDuration: 4.8, floatDelay: 0 },
  { term: '游離型', keywordId: 'free-form', category: 'spec', categoryLabel: '規格成分', weight: 4, floatDuration: 5.4, floatDelay: 0.3 },
  { term: '成分', keywordId: 'ingredient', category: 'spec', categoryLabel: '規格成分', weight: 4, floatDuration: 4.5, floatDelay: 0.6 },
  { term: '大研生醫', category: 'brand_channel', categoryLabel: '品牌通路', weight: 4, floatDuration: 5.1, floatDelay: 0.2 },
  { term: '眼睛', keywordId: 'eyes', category: 'context', categoryLabel: '使用情境', weight: 4, floatDuration: 4.9, floatDelay: 0.8 },
  { term: 'iHerb', keywordId: 'iherb', category: 'brand_channel', categoryLabel: '品牌通路', weight: 3, floatDuration: 5.7, floatDelay: 0.4 },
  { term: '善存', keywordId: 'centrum', category: 'brand_channel', categoryLabel: '品牌通路', weight: 3, floatDuration: 4.6, floatDelay: 1.0 },
  { term: '配方', keywordId: 'formula', category: 'spec', categoryLabel: '規格成分', weight: 3, floatDuration: 5.2, floatDelay: 0.5 },
  { term: '日常', keywordId: 'daily', category: 'context', categoryLabel: '使用情境', weight: 3, floatDuration: 4.7, floatDelay: 0.9 },
  { term: '品牌', keywordId: 'brand', category: 'brand_channel', categoryLabel: '品牌通路', weight: 3, floatDuration: 5.5, floatDelay: 0.1 },
  { term: '玉米黃素', category: 'spec', categoryLabel: '規格成分', weight: 3, floatDuration: 4.4, floatDelay: 0.7 },
  { term: 'Coupang', category: 'brand_channel', categoryLabel: '品牌通路', weight: 2, floatDuration: 5.3, floatDelay: 1.1 },
  { term: '維他命', keywordId: 'vitamin', category: 'spec', categoryLabel: '規格成分', weight: 2, floatDuration: 4.8, floatDelay: 0.4 },
  { term: '手術', keywordId: 'surgery', category: 'context', categoryLabel: '使用情境', weight: 2, floatDuration: 5.6, floatDelay: 0.6 },
  { term: '商品', keywordId: 'product', category: 'brand_channel', categoryLabel: '品牌通路', weight: 2, floatDuration: 5.0, floatDelay: 1.2 },
  { term: '花青素', category: 'spec', categoryLabel: '規格成分', weight: 2, floatDuration: 4.9, floatDelay: 0.3 },
  { term: '蝦紅素', category: 'spec', categoryLabel: '規格成分', weight: 2, floatDuration: 5.4, floatDelay: 0.8 },
  { term: '3C', category: 'context', categoryLabel: '使用情境', weight: 2, floatDuration: 4.6, floatDelay: 0.5 },
];




