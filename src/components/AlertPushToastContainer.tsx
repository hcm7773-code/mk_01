import { ArrowUpRight, BellRing, ShieldAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AlertPushNotification } from '../types/alertPush';

interface AlertPushToastContainerProps {
  notifications: AlertPushNotification[];
  onDismiss: (id: string) => void;
  onActionJump: (sectionId: string, toastId: string) => void;
}

export function AlertPushToastContainer({
  notifications,
  onDismiss,
  onActionJump,
}: AlertPushToastContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      aria-label="即時輿情警報推播通知"
      className="no-print fixed bottom-5 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm space-y-2.5 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {notifications.map((item) => {
          const isHigh = item.severity === 'high';
          const isMedium = item.severity === 'medium';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-auto rounded-xl bg-[#13153D] text-white border border-indigo-400/35 shadow-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-md inline-flex items-center justify-center shrink-0 ${
                      isHigh
                        ? 'bg-red-600 text-white'
                        : isMedium
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {isHigh ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : (
                      <BellRing className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono-num">
                      <span
                        className={
                          isHigh
                            ? 'text-red-300 font-semibold'
                            : isMedium
                              ? 'text-indigo-200 font-semibold'
                              : 'text-emerald-300 font-semibold'
                        }
                      >
                        輿情警報推播 · {item.channel}
                      </span>
                      <span className="text-indigo-300/70">· {item.timestamp}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(item.id)}
                  aria-label="關閉此推播通知"
                  className="p-1 text-indigo-200/70 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-indigo-100/85 leading-relaxed mt-2">{item.message}</p>

              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded bg-[#063632]/90 border border-emerald-400/35 text-[11px] font-mono-num text-emerald-300">
                  {item.metricBadge}
                </span>

                <div className="flex items-center gap-2">
                  {item.targetSectionId && (
                    <button
                      type="button"
                      onClick={() => onActionJump(item.targetSectionId!, item.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>查看處置</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
