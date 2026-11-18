import { AlertTriangle, Calendar, CheckCircle2, Flame, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';

export type RiskLevel = 'low' | 'elevated' | 'high' | 'critical';

export interface DailyRiskRecord {
  dateKey: string; // YYYY-MM-DD
  displayDate: string;
  dayOfMonth: number;
  weekdayIndex: number; // 0 = 週一 ... 6 = 週日
  weekdayLabel: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  totalPosts: number;
  negativePosts: number;
  dominantChannel: string;
  triggerType: string;
  summary: string;
  keywords: string[];
  recommendedStageIndex: number; // 0..4 maps to CRISIS_STAGES
  actionHint: string;
  isReportExact?: boolean;
}

const WEEKDAYS = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

const RISK_META: Record<
  RiskLevel,
  {
    label: string;
    cellClass: string;
    activeRing: string;
    badgeClass: string;
    dotClass: string;
  }
> = {
  low: {
    label: '低風險',
    cellClass: 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80',
    activeRing: 'ring-2 ring-emerald-600 border-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-600',
  },
  elevated: {
    label: '注意觀察',
    cellClass: 'bg-indigo-50/80 border-indigo-200 text-indigo-950 hover:bg-indigo-100/80',
    activeRing: 'ring-2 ring-indigo-600 border-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-600',
  },
  high: {
    label: '高風險',
    cellClass: 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100/80',
    activeRing: 'ring-2 ring-amber-600 border-amber-600',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-600',
  },
  critical: {
    label: '嚴重警戒',
    cellClass: 'bg-red-50 border-red-300 text-red-950 hover:bg-red-100/80',
    activeRing: 'ring-2 ring-red-700 border-red-700',
    badgeClass: 'bg-red-50 text-red-800 border-red-300',
    dotClass: 'bg-red-700',
  },
};

// Window 1: Past 1 month rolling monitor relative to current date (2026-10-19 Monday ~ 2026-11-17 Tuesday, 30 days)
const RECENT_30_DAYS: DailyRiskRecord[] = [
  {
    dateKey: '2026-10-19',
    displayDate: '10/19',
    dayOfMonth: 19,
    weekdayIndex: 0,
    weekdayLabel: '週一',
    riskLevel: 'low',
    riskScore: 18,
    totalPosts: 6,
    negativePosts: 0,
    dominantChannel: '方格子 / 部落格',
    triggerType: '日常選購指南',
    summary: '週初討論集中於 3C 上班族護眼劑型比較與游離型介紹，未出現負評異常。',
    keywords: ['游離型', '3C 用眼', '選購指引'],
    recommendedStageIndex: 0,
    actionHint: '維持例行關鍵字監測，蒐集常見規格疑問作為內容素材。',
  },
  {
    dateKey: '2026-10-20',
    displayDate: '10/20',
    dayOfMonth: 20,
    weekdayIndex: 1,
    weekdayLabel: '週二',
    riskLevel: 'low',
    riskScore: 22,
    totalPosts: 7,
    negativePosts: 1,
    dominantChannel: 'Dcard',
    triggerType: '單一價格比較',
    summary: '出現 1 篇針對通路單價偏高的討論，屬一般性比價反應，未形成擴散。',
    keywords: ['價格比較', '每日攝取量'],
    recommendedStageIndex: 0,
    actionHint: '標記價格敏感貼文，對照電商組合優惠回應。',
  },
  {
    dateKey: '2026-10-21',
    displayDate: '10/21',
    dayOfMonth: 21,
    weekdayIndex: 2,
    weekdayLabel: '週三',
    riskLevel: 'elevated',
    riskScore: 42,
    totalPosts: 9,
    negativePosts: 2,
    dominantChannel: 'PTT / Threads',
    triggerType: '跨境平台折扣討論',
    summary: 'iHerb 與 Coupang 優惠貼文引發本土品牌價差討論，出現 2 則質疑性價比留言。',
    keywords: ['iHerb', 'Coupang', '價差比對'],
    recommendedStageIndex: 1,
    actionHint: '區分價格質疑與品質議題，強調檢驗認證與成分來源優勢。',
  },
  {
    dateKey: '2026-10-22',
    displayDate: '10/22',
    dayOfMonth: 22,
    weekdayIndex: 3,
    weekdayLabel: '週四',
    riskLevel: 'low',
    riskScore: 20,
    totalPosts: 6,
    negativePosts: 0,
    dominantChannel: 'Facebook 粉絲團',
    triggerType: '品牌衛教貼文',
    summary: '品牌官方粉專發布葉黃素與玉米黃素黃金比例圖解，互動偏向正向收藏與分享。',
    keywords: ['玉米黃素', '複方比例', '衛教內容'],
    recommendedStageIndex: 0,
    actionHint: '延續清晰圖表化內容，降低消費者對劑型標示的理解門檻。',
  },
  {
    dateKey: '2026-10-23',
    displayDate: '10/23',
    dayOfMonth: 23,
    weekdayIndex: 4,
    weekdayLabel: '週五',
    riskLevel: 'low',
    riskScore: 25,
    totalPosts: 7,
    negativePosts: 1,
    dominantChannel: 'Threads',
    triggerType: '吞嚥型態討論',
    summary: '少數留言反映膠囊顆粒偏大不易吞嚥，偏向個人體型與產品型態偏好差異。',
    keywords: ['膠囊大小', '產品型態', '軟膠囊'],
    recommendedStageIndex: 3,
    actionHint: '紀錄劑型便利性回饋，作為軟膠囊或飲品線開發與選購指引依據。',
  },
  {
    dateKey: '2026-10-24',
    displayDate: '10/24',
    dayOfMonth: 24,
    weekdayIndex: 5,
    weekdayLabel: '週六',
    riskLevel: 'low',
    riskScore: 15,
    totalPosts: 5,
    negativePosts: 0,
    dominantChannel: 'Instagram',
    triggerType: '週末親子生活分享',
    summary: '育兒家庭保健情境分享帶動溫和正面互動，無負面情緒升溫跡象。',
    keywords: ['育兒保健', '家庭健康'],
    recommendedStageIndex: 0,
    actionHint: '持續追蹤家庭情境貼文之自然留言回饋。',
  },
  {
    dateKey: '2026-10-25',
    displayDate: '10/25',
    dayOfMonth: 25,
    weekdayIndex: 6,
    weekdayLabel: '週日',
    riskLevel: 'low',
    riskScore: 16,
    totalPosts: 5,
    negativePosts: 0,
    dominantChannel: 'LINE TODAY',
    triggerType: '新聞健康專欄轉載',
    summary: '健康專欄轉載用眼休息建議，屬於中性衛教聲量，未伴隨爭議評論。',
    keywords: ['眼睛疲勞', '護眼習慣'],
    recommendedStageIndex: 0,
    actionHint: '保持低度例行追蹤，留意新聞留言區是否有品牌點名。',
  },
  {
    dateKey: '2026-10-26',
    displayDate: '10/26',
    dayOfMonth: 26,
    weekdayIndex: 0,
    weekdayLabel: '週一',
    riskLevel: 'elevated',
    riskScore: 46,
    totalPosts: 10,
    negativePosts: 2,
    dominantChannel: 'PTT',
    triggerType: '複方含量標示疑問',
    summary: '論壇網友比對複方成分表，質疑花青素與蝦紅素實際含量標示不夠直覺。',
    keywords: ['成分標示', '花青素', '蝦紅素'],
    recommendedStageIndex: 2,
    actionHint: '補充公開規格對照表與單位劑量說明，避免規格誤解擴散。',
  },
  {
    dateKey: '2026-10-27',
    displayDate: '10/27',
    dayOfMonth: 27,
    weekdayIndex: 1,
    weekdayLabel: '週二',
    riskLevel: 'high',
    riskScore: 68,
    totalPosts: 13,
    negativePosts: 4,
    dominantChannel: 'Dcard / Threads',
    triggerType: 'KOL 開箱隔日體感質疑',
    summary: '美妝保健 KOL 推薦貼文發布後，留言區出現 4 則質疑「吃兩週仍無感、廣告過於誇大」之討論。',
    keywords: ['KOL 貼文後', '產品效果', '期待落差'],
    recommendedStageIndex: 2,
    actionHint: '啟動第 3 階段官方與專業回應：說明葉黃素需長期穩定補充之機轉，檢視 KOL 宣稱界線。',
  },
  {
    dateKey: '2026-10-28',
    displayDate: '10/28',
    dayOfMonth: 28,
    weekdayIndex: 2,
    weekdayLabel: '週三',
    riskLevel: 'elevated',
    riskScore: 49,
    totalPosts: 11,
    negativePosts: 2,
    dominantChannel: 'Threads',
    triggerType: '效果疑問延續追蹤',
    summary: '官方補充專業營養師說明後負評降溫至 2 則，但仍有消費者追問檢驗報告批號。',
    keywords: ['檢驗資訊', '營養師說明'],
    recommendedStageIndex: 4,
    actionHint: '於限動與商品頁置頂公開逐批檢驗資訊連結並追蹤回應滿意度。',
  },
  {
    dateKey: '2026-10-29',
    displayDate: '10/29',
    dayOfMonth: 29,
    weekdayIndex: 3,
    weekdayLabel: '週四',
    riskLevel: 'low',
    riskScore: 24,
    totalPosts: 7,
    negativePosts: 1,
    dominantChannel: 'Facebook 粉絲團',
    triggerType: '公開檢驗報告回應',
    summary: '品牌公開第三方檢測摘要後討論趨緩，正面肯定透明度之留言回升。',
    keywords: ['第三方檢驗', '透明溝通'],
    recommendedStageIndex: 4,
    actionHint: '確認負評關鍵字收斂狀況，維持客服話術一致性。',
  },
  {
    dateKey: '2026-10-30',
    displayDate: '10/30',
    dayOfMonth: 30,
    weekdayIndex: 4,
    weekdayLabel: '週五',
    riskLevel: 'low',
    riskScore: 21,
    totalPosts: 6,
    negativePosts: 0,
    dominantChannel: '方格子',
    triggerType: '深度評比文章上線',
    summary: '長文評比收錄多家品牌成分數據，語氣客觀中性，無負面情緒波峰。',
    keywords: ['品牌比較', '方格子'],
    recommendedStageIndex: 0,
    actionHint: '檢視評比引用數據是否與最新包裝標示一致。',
  },
  {
    dateKey: '2026-10-31',
    displayDate: '10/31',
    dayOfMonth: 31,
    weekdayIndex: 5,
    weekdayLabel: '週六',
    riskLevel: 'elevated',
    riskScore: 40,
    totalPosts: 9,
    negativePosts: 2,
    dominantChannel: 'PTT / 電商社團',
    triggerType: '雙十一前哨促銷比價',
    summary: '雙十一預熱檔期啟動，社群討論轉向湊單規則複雜與贈品門檻抱怨。',
    keywords: ['節慶促銷', '電商規則'],
    recommendedStageIndex: 1,
    actionHint: '簡化促銷活動說明圖卡，預防客服諮詢與抱怨同步暴增。',
  },
  {
    dateKey: '2026-11-01',
    displayDate: '11/01',
    dayOfMonth: 1,
    weekdayIndex: 6,
    weekdayLabel: '週日',
    riskLevel: 'low',
    riskScore: 26,
    totalPosts: 8,
    negativePosts: 1,
    dominantChannel: 'Instagram / FB',
    triggerType: '檔期開跑首日',
    summary: '活動首日曝光上升，留言多為優惠詢問與團購標記，負面占比低。',
    keywords: ['促銷開跑', '團購'],
    recommendedStageIndex: 0,
    actionHint: '持續追蹤活動首週留言情緒比例與配送回饋。',
  },
  {
    dateKey: '2026-11-02',
    displayDate: '11/02',
    dayOfMonth: 2,
    weekdayIndex: 0,
    weekdayLabel: '週一',
    riskLevel: 'low',
    riskScore: 28,
    totalPosts: 8,
    negativePosts: 1,
    dominantChannel: 'Dcard',
    triggerType: '術後保養請益',
    summary: '近視雷射手術後族群詢問葉黃素補充時機，討論聚焦安全性與成分單純度。',
    keywords: ['手術', '眼睛保養', '成分單純'],
    recommendedStageIndex: 0,
    actionHint: '準備術後／敏感族群專業衛教 Q&A，嚴守非醫療宣稱界線。',
  },
  {
    dateKey: '2026-11-03',
    displayDate: '11/03',
    dayOfMonth: 3,
    weekdayIndex: 1,
    weekdayLabel: '週二',
    riskLevel: 'elevated',
    riskScore: 45,
    totalPosts: 11,
    negativePosts: 2,
    dominantChannel: 'Threads',
    triggerType: '物流與效期詢問',
    summary: '大促前批出貨出現 2 則對有效期限標示與包裝封膜完整度之詢問。',
    keywords: ['品質管理', '包裝封膜'],
    recommendedStageIndex: 3,
    actionHint: '由專責客服即時核對批號並檢視倉儲出貨品檢流程。',
  },
  {
    dateKey: '2026-11-04',
    displayDate: '11/04',
    dayOfMonth: 4,
    weekdayIndex: 2,
    weekdayLabel: '週三',
    riskLevel: 'high',
    riskScore: 66,
    totalPosts: 14,
    negativePosts: 4,
    dominantChannel: 'PTT / Dcard',
    triggerType: '競品比較與效果實測爭議',
    summary: '論壇出現本土大廠與跨境品牌實測對比文，4 則負評指稱「持續吃兩個月仍覺無感」。',
    keywords: ['效果不明顯', '大研生醫', '善存'],
    recommendedStageIndex: 1,
    actionHint: '進入第 2 階段深度判斷：確認負評來自真實消費體驗或競品比較帶風向。',
  },
  {
    dateKey: '2026-11-05',
    displayDate: '11/05',
    dayOfMonth: 5,
    weekdayIndex: 3,
    weekdayLabel: '週四',
    riskLevel: 'elevated',
    riskScore: 48,
    totalPosts: 10,
    negativePosts: 2,
    dominantChannel: 'Dcard',
    triggerType: '配方劑量透明化討論',
    summary: '網友持續討論足量添加標準，品牌社群需強化「專利原料來源與建議攝取量」溝通。',
    keywords: ['專利原料', '每日攝取量'],
    recommendedStageIndex: 2,
    actionHint: '提供一頁式圖解成分來源表並連結外部驗證依據。',
  },
  {
    dateKey: '2026-11-06',
    displayDate: '11/06',
    dayOfMonth: 6,
    weekdayIndex: 4,
    weekdayLabel: '週五',
    riskLevel: 'low',
    riskScore: 22,
    totalPosts: 7,
    negativePosts: 0,
    dominantChannel: 'LINE TODAY',
    triggerType: '週末用眼保健報導',
    summary: '媒體報導長時間使用手機護眼要點，帶動溫和自然討論。',
    keywords: ['3C 用眼', '眼睛乾澀'],
    recommendedStageIndex: 0,
    actionHint: '例行監測即可。',
  },
  {
    dateKey: '2026-11-07',
    displayDate: '11/07',
    dayOfMonth: 7,
    weekdayIndex: 5,
    weekdayLabel: '週六',
    riskLevel: 'low',
    riskScore: 19,
    totalPosts: 6,
    negativePosts: 0,
    dominantChannel: 'Instagram',
    triggerType: '3C 生活創作者開箱',
    summary: '3C 類型 IG KOL 分享日常上班族桌面補充習慣，留言以正面詢問購買連結為主。',
    keywords: ['生活 3C KOL', '日常補充'],
    recommendedStageIndex: 0,
    actionHint: '追蹤發文後 24–48 小時留言情緒變化，防範滯後負評。',
  },
  {
    dateKey: '2026-11-08',
    displayDate: '11/08',
    dayOfMonth: 8,
    weekdayIndex: 6,
    weekdayLabel: '週日',
    riskLevel: 'high',
    riskScore: 71,
    totalPosts: 16,
    negativePosts: 4,
    dominantChannel: 'Threads / PTT',
    triggerType: '促銷週末高曝光伴隨質疑',
    summary: '雙十一前夕活動聲量放大至 16 筆，同步出現 4 則質疑業配過多與實際體感落差之留言。',
    keywords: ['促銷高峰', '業配質疑', '口碑真實性'],
    recommendedStageIndex: 2,
    actionHint: '避免單純以買量推文蓋過負評，應由專責團隊正面回覆體感疑問。',
  },
  {
    dateKey: '2026-11-09',
    displayDate: '11/09',
    dayOfMonth: 9,
    weekdayIndex: 0,
    weekdayLabel: '週一',
    riskLevel: 'elevated',
    riskScore: 52,
    totalPosts: 12,
    negativePosts: 3,
    dominantChannel: 'PTT / Dcard',
    triggerType: '雙十一檔期前夕比價潮',
    summary: '出現「折扣後仍比跨境通路貴」與「添加物是否必要」之比較討論（3 則負面）。',
    keywords: ['iHerb', '添加物', '價格比對'],
    recommendedStageIndex: 1,
    actionHint: '對照複方機能價值與售後檢驗保障，釐清性價比定位。',
  },
  {
    dateKey: '2026-11-10',
    displayDate: '11/10',
    dayOfMonth: 10,
    weekdayIndex: 1,
    weekdayLabel: '週二',
    riskLevel: 'high',
    riskScore: 74,
    totalPosts: 19,
    negativePosts: 4,
    dominantChannel: 'Threads / Facebook',
    triggerType: '雙十一檔期聲量激增',
    summary: '活動促銷推升當日聲量至 19 筆，同時帶出 4 則針對廣告效果宣稱過高的批評。',
    keywords: ['大促檔期', '廣告宣稱界線', '信任危機'],
    recommendedStageIndex: 3,
    actionHint: '即時檢視所有促銷素材與 KOL 文案是否逾越實際可期待效果。',
  },
  {
    dateKey: '2026-11-11',
    displayDate: '11/11',
    dayOfMonth: 11,
    weekdayIndex: 2,
    weekdayLabel: '週三',
    riskLevel: 'critical',
    riskScore: 89,
    totalPosts: 26,
    negativePosts: 5,
    dominantChannel: 'PTT / Dcard / Threads',
    triggerType: '雙十一單日聲量高峰＋負評滯後爆發',
    summary: '大促當日聲量衝上近期高點（26 筆），高曝光觸發 5 篇集中討論「產品效果不明顯」與促銷品檢驗批號查證。',
    keywords: ['雙十一高峰', '效果不明顯', '檢驗查證', '5 篇負評'],
    recommendedStageIndex: 2,
    actionHint: '立即啟動第 3 階段官方聲明與專責小組回覆，同步公開檢驗報告連結止血。',
  },
  {
    dateKey: '2026-11-12',
    displayDate: '11/12',
    dayOfMonth: 12,
    weekdayIndex: 3,
    weekdayLabel: '週四',
    riskLevel: 'high',
    riskScore: 69,
    totalPosts: 15,
    negativePosts: 4,
    dominantChannel: 'Threads / Dcard',
    triggerType: '峰後第 1 日負評長尾檢驗',
    summary: '延續雙十一隔日討論熱度，4 則貼文追蹤品牌客服回應速度與退換貨／檢驗說明完整性。',
    keywords: ['峰後隔日', '客服回應一致性', '品質信任'],
    recommendedStageIndex: 3,
    actionHint: '啟動第 4 階段檢視：確保客服與官方聲明口徑一致，覆盤促銷溝通落差。',
  },
  {
    dateKey: '2026-11-13',
    displayDate: '11/13',
    dayOfMonth: 13,
    weekdayIndex: 4,
    weekdayLabel: '週五',
    riskLevel: 'elevated',
    riskScore: 47,
    totalPosts: 10,
    negativePosts: 2,
    dominantChannel: 'Facebook / 方格子',
    triggerType: '官方回應後情緒收斂',
    summary: '官方與營養師圖卡澄清後負評降至 2 則，社群焦點逐漸轉回成分劑型科普。',
    keywords: ['官方澄清', '情緒收斂'],
    recommendedStageIndex: 4,
    actionHint: '第 5 階段持續追蹤負評關鍵字比例是否恢復至 10% 以下常態。',
  },
  {
    dateKey: '2026-11-14',
    displayDate: '11/14',
    dayOfMonth: 14,
    weekdayIndex: 5,
    weekdayLabel: '週六',
    riskLevel: 'low',
    riskScore: 25,
    totalPosts: 7,
    negativePosts: 1,
    dominantChannel: 'Instagram',
    triggerType: '週末口碑回穩',
    summary: '促銷熱潮過後週末討論降溫，僅 1 則零星抱怨配送延遲。',
    keywords: ['配送回饋', '日常補貨'],
    recommendedStageIndex: 4,
    actionHint: '持續追蹤物流收貨後之開箱評價。',
  },
  {
    dateKey: '2026-11-15',
    displayDate: '11/15',
    dayOfMonth: 15,
    weekdayIndex: 6,
    weekdayLabel: '週日',
    riskLevel: 'low',
    riskScore: 20,
    totalPosts: 6,
    negativePosts: 0,
    dominantChannel: '方格子',
    triggerType: '複方規格整理',
    summary: '週末內容創作者發布葉黃素複方攻略，強調長期穩定攝取與品質檢驗。',
    keywords: ['複方攻略', '品質檢驗'],
    recommendedStageIndex: 0,
    actionHint: '收集正向深度文章作為品牌透明溝通參考案例。',
  },
  {
    dateKey: '2026-11-16',
    displayDate: '11/16',
    dayOfMonth: 16,
    weekdayIndex: 0,
    weekdayLabel: '週一',
    riskLevel: 'elevated',
    riskScore: 41,
    totalPosts: 9,
    negativePosts: 2,
    dominantChannel: 'Dcard / Threads',
    triggerType: '收貨後實測體感回饋',
    summary: '雙十一訂單陸續到貨，出現 2 則針對飲品口感或膠囊氣味的微負面評價。',
    keywords: ['口感體驗', '劑型選擇'],
    recommendedStageIndex: 3,
    actionHint: '彙整新一批收貨口感與劑型回饋，納入產品改進參考。',
  },
  {
    dateKey: '2026-11-17',
    displayDate: '11/17',
    dayOfMonth: 17,
    weekdayIndex: 1,
    weekdayLabel: '週二',
    riskLevel: 'low',
    riskScore: 27,
    totalPosts: 8,
    negativePosts: 1,
    dominantChannel: 'Threads / 論壇',
    triggerType: '今日例行監測基準',
    summary: '今日整體討論維持在 8 筆基準水位，負面評價 1 則（占比 12.5%），整體市場輿情穩定可控。',
    keywords: ['今日監測', '游離型', '成分查證'],
    recommendedStageIndex: 0,
    actionHint: '維持例行 24 小時負面輿情雷達與週期盤點。',
  },
];

// Window 2: Report Peak Month Reference Calendar (2026-09-01 Tuesday ~ 2026-09-30 Wednesday, anchoring exact 9/8, 9/16, 9/17 report peaks)
const SEPTEMBER_PEAK_DAYS: DailyRiskRecord[] = Array.from({ length: 30 }, (_, idx) => {
  const day = idx + 1;
  const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
  const displayDate = `09/${String(day).padStart(2, '0')}`;
  // 2026-09-01 is Tuesday (weekdayIndex = 1)
  const weekdayIndex = (1 + idx) % 7;
  const weekdayLabel = WEEKDAYS[weekdayIndex];

  if (day === 8) {
    return {
      dateKey: dateStr,
      displayDate,
      dayOfMonth: day,
      weekdayIndex,
      weekdayLabel,
      riskLevel: 'high',
      riskScore: 78,
      totalPosts: 37,
      negativePosts: 3,
      dominantChannel: 'Facebook / Threads / 新聞',
      triggerType: '報告實測：單日聲量最高峰（37 筆）',
      summary: 'OpView 報告實測單日討論最高峰（37 筆）。受「味全龍封王」聯名話題與跨境促銷推升，曝光暴增同時亦提高檢視放大效應。',
      keywords: ['9/8 單日高峰 37 筆', '味全龍封王', '曝光非好感'],
      recommendedStageIndex: 0,
      actionHint: '回查當日熱門貼文、品牌活動與新聞事件，區分官方曝光與真實口碑。',
      isReportExact: true,
    };
  }
  if (day === 16) {
    return {
      dateKey: dateStr,
      displayDate,
      dayOfMonth: day,
      weekdayIndex,
      weekdayLabel,
      riskLevel: 'high',
      riskScore: 72,
      totalPosts: 15,
      negativePosts: 3,
      dominantChannel: '論壇 / Facebook',
      triggerType: '報告實測：9/16 當週週聲量高峰（30 篇）',
      summary: 'OpView 報告標註 9/16 當週累計 30 篇寫下週聲量高點，高頻導購與規格比較貼文累積大量消費者期待。',
      keywords: ['9/16 當週 30 篇', '促銷導購', '規格比較'],
      recommendedStageIndex: 1,
      actionHint: '同步檢視貼文留言互動品質，預警高曝光後的期待落差風險。',
      isReportExact: true,
    };
  }
  if (day === 17) {
    return {
      dateKey: dateStr,
      displayDate,
      dayOfMonth: day,
      weekdayIndex,
      weekdayLabel,
      riskLevel: 'critical',
      riskScore: 95,
      totalPosts: 12,
      negativePosts: 6,
      dominantChannel: 'PTT / Dcard / Threads',
      triggerType: '報告實測：單日負面文章最多（6 篇）',
      summary: 'OpView 報告實測單日負面文章最高紀錄（6 篇），集中反映「產品效果不明顯」，揭露消費者實際體驗與品牌宣稱落差，觸發信任危機警戒。',
      keywords: ['9/17 負評 6 篇', '產品效果不明顯', '檢驗查證'],
      recommendedStageIndex: 2,
      actionHint: '發布可查證的成分與檢驗說明、由專責小組回應高聲量負評並檢視宣稱界線。',
      isReportExact: true,
    };
  }
  if (day === 9 || day === 18) {
    return {
      dateKey: dateStr,
      displayDate,
      dayOfMonth: day,
      weekdayIndex,
      weekdayLabel,
      riskLevel: 'elevated',
      riskScore: 48,
      totalPosts: day === 9 ? 11 : 9,
      negativePosts: 2,
      dominantChannel: 'Threads / Dcard',
      triggerType: day === 9 ? '9/8 高峰隔日餘波' : '9/17 負評隔日追蹤',
      summary:
        day === 9
          ? '9/8 單日高峰隔日延續聯名與折扣討論，出現 2 則比較成分標示之疑問留言。'
          : '9/17 負評高峰隔日持續追蹤口碑收斂情形與客服回應態度。',
      keywords: ['峰後延續', '成分透明'],
      recommendedStageIndex: day === 9 ? 1 : 4,
      actionHint: '密切追蹤高波峰後 24–48 小時負面情緒是否擴散。',
    };
  }

  const isElevated = day === 4 || day === 14 || day === 22;
  return {
    dateKey: dateStr,
    displayDate,
    dayOfMonth: day,
    weekdayIndex,
    weekdayLabel,
    riskLevel: isElevated ? 'elevated' : 'low',
    riskScore: isElevated ? 42 : 18 + (day % 9),
    totalPosts: isElevated ? 9 : 5 + (day % 4),
    negativePosts: isElevated ? 2 : day % 3 === 0 ? 1 : 0,
    dominantChannel: day % 2 === 0 ? 'Facebook / 方格子' : 'Dcard / PTT',
    triggerType: isElevated ? 'iHerb / Coupang 促銷比價' : '日常護眼與成分討論',
    summary: isElevated
      ? '跨境電商優惠討論升溫，出現零星針對本土品牌性價比與劑量差異之提問。'
      : '9 月常態性 3C 護眼保養與游離型規格討論，正負情緒比例維持平穩。',
    keywords: isElevated ? ['iHerb', 'Coupang', '比價'] : ['葉黃素', '日常保養'],
    recommendedStageIndex: isElevated ? 1 : 0,
    actionHint: isElevated ? '強化成分透明度與價格價值溝通。' : '維持例行社群聲量監測。',
  };
});

interface RiskHeatmapSectionProps {
  onSelectCrisisStage: (stageIndex: number) => void;
}

export function RiskHeatmapSection({ onSelectCrisisStage }: RiskHeatmapSectionProps) {
  const [calendarWindow, setCalendarWindow] = useState<'recent' | 'sep_peak'>('recent');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high_critical'>('all');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-11-11');

  const daysList = calendarWindow === 'recent' ? RECENT_30_DAYS : SEPTEMBER_PEAK_DAYS;

  const handleWindowSwitch = (win: 'recent' | 'sep_peak') => {
    setCalendarWindow(win);
    setSelectedDateKey(win === 'recent' ? '2026-11-11' : '2026-09-17');
  };

  const selectedDay = useMemo(
    () => daysList.find((d) => d.dateKey === selectedDateKey) ?? daysList[0],
    [daysList, selectedDateKey]
  );

  // Build padded 7-column calendar cells
  const calendarCells = useMemo(() => {
    const leadingBlanks = daysList[0].weekdayIndex;
    const cells: Array<DailyRiskRecord | null> = [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...daysList,
    ];
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [daysList]);

  const stats = useMemo(() => {
    const criticalCount = daysList.filter((d) => d.riskLevel === 'critical').length;
    const highCount = daysList.filter((d) => d.riskLevel === 'high').length;
    const elevatedCount = daysList.filter((d) => d.riskLevel === 'elevated').length;
    const totalNeg = daysList.reduce((acc, d) => acc + d.negativePosts, 0);
    return { criticalCount, highCount, elevatedCount, totalNeg };
  }, [daysList]);

  const selectedMeta = RISK_META[selectedDay.riskLevel];

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>輿情風險熱力圖 · 過去一個月每日週曆監測</span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            每日負評風險等級週曆熱力圖（點擊日期檢視當日詳細摘要）
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            以 7 日週曆視覺化呈現每日負評濃度與風險等級，支援切換「近一個月滾動監測」與「9 月報告實測高峰月」
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => handleWindowSwitch('recent')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                calendarWindow === 'recent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              近 30 日監測 (10/19–11/17)
            </button>
            <button
              type="button"
              onClick={() => handleWindowSwitch('sep_peak')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                calendarWindow === 'sep_peak'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              報告高峰月 (09/01–09/30)
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              setRiskFilter((prev) => (prev === 'all' ? 'high_critical' : 'all'))
            }
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
              riskFilter === 'high_critical'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {riskFilter === 'high_critical' ? '顯示全部風險等級' : '僅高亮高風險／警戒日'}
          </button>
        </div>
      </div>

      {/* Legend & Summary KPI Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {(['low', 'elevated', 'high', 'critical'] as RiskLevel[]).map((lvl) => (
            <span key={lvl} className="inline-flex items-center gap-1.5 text-slate-600">
              <span className={`w-2.5 h-2.5 rounded-xs ${RISK_META[lvl].dotClass}`} />
              <span>{RISK_META[lvl].label}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono-num text-[11px] text-slate-600">
          <span>
            嚴重警戒：<strong className="text-red-700">{stats.criticalCount} 日</strong>
          </span>
          <span>
            高風險：<strong className="text-amber-700">{stats.highCount} 日</strong>
          </span>
          <span>
            注意觀察：<strong className="text-indigo-700">{stats.elevatedCount} 日</strong>
          </span>
          <span>
            30 日累計負評：<strong className="text-slate-900">{stats.totalNeg} 篇</strong>
          </span>
        </div>
      </div>

      {/* Main Layout: Left 7-Column Weekly Heatmap + Right Day Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5 items-stretch">
        {/* Left: Weekly Calendar Grid */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {WEEKDAYS.map((wd) => (
                <div
                  key={wd}
                  className="text-center text-[11px] font-medium text-slate-500 py-1"
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return (
                    <div
                      key={`blank-${idx}`}
                      className="h-[68px] rounded-lg bg-slate-50/50 border border-dashed border-slate-200/60"
                      aria-hidden="true"
                    />
                  );
                }

                const meta = RISK_META[cell.riskLevel];
                const isSelected = cell.dateKey === selectedDay.dateKey;
                const isDimmed =
                  riskFilter === 'high_critical' &&
                  cell.riskLevel !== 'high' &&
                  cell.riskLevel !== 'critical';

                return (
                  <button
                    key={cell.dateKey}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={`h-[68px] p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 ${
                      meta.cellClass
                    } ${isSelected ? meta.activeRing : ''} ${
                      isDimmed ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <span className="text-[11px] font-mono-num font-bold leading-none">
                        {cell.displayDate}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${meta.dotClass}`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="flex items-baseline justify-between gap-1 w-full">
                      <span className="text-[10px] font-medium truncate">
                        {cell.isReportExact ? '報告實測' : meta.label}
                      </span>
                      <span className="text-[10px] font-mono-num font-semibold shrink-0">
                        {cell.negativePosts}負
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            口徑說明：「報告高峰月」精準錨定 OpView 原報告實測（9/8 單日 37 筆、9/16 當週 30 篇、9/17 負評 6 篇）；「近 30 日監測」係依報告月均水準（~5.9 筆/日、負評約 10%）與雙十一檔期推演之日常風險監測視圖。
          </p>
        </div>

        {/* Right: Selected Day Detailed Summary Inspector */}
        <div className="lg:col-span-5 bg-slate-50/80 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Top Status Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500">
                  <span>{selectedDay.dateKey}</span>
                  <span>·</span>
                  <span>{selectedDay.weekdayLabel}</span>
                  {selectedDay.isReportExact && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-semibold">
                      原報告實測節點
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {selectedDay.triggerType}
                </h4>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-semibold shrink-0 ${selectedMeta.badgeClass}`}
              >
                {selectedDay.riskLevel === 'critical' ? (
                  <Flame className="w-3.5 h-3.5" />
                ) : selectedDay.riskLevel === 'high' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : selectedDay.riskLevel === 'elevated' ? (
                  <ShieldAlert className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{selectedMeta.label}</span>
              </span>
            </div>

            {/* Daily Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-500">當日總聲量</span>
                <span className="text-base font-bold font-mono-num text-slate-900">
                  {selectedDay.totalPosts} 筆
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-500">負面文章數</span>
                <span
                  className={`text-base font-bold font-mono-num ${
                    selectedDay.negativePosts >= 4 ? 'text-red-700' : 'text-slate-900'
                  }`}
                >
                  {selectedDay.negativePosts} 篇
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                <span className="block text-[10px] text-slate-500">風險指數</span>
                <span className="text-base font-bold font-mono-num text-indigo-700">
                  {selectedDay.riskScore} / 100
                </span>
              </div>
            </div>

            {/* Detailed Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>主要來源平台</span>
                <span className="font-medium text-slate-800">{selectedDay.dominantChannel}</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-lg p-3">
                {selectedDay.summary}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {selectedDay.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px] font-mono-num"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Recommendation & Sync to 5-Stage Workflow */}
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
            <p className="text-xs leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">當日處置建議：</span>
              {selectedDay.actionHint}
            </p>
            <button
              type="button"
              onClick={() => onSelectCrisisStage(selectedDay.recommendedStageIndex)}
              className="w-full py-2 px-3 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              套用至五階段應變流程（定位至階段 0{selectedDay.recommendedStageIndex + 1}）
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
