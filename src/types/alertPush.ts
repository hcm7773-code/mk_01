export type PushAlertSeverity = 'high' | 'medium' | 'info';

export interface AlertPushNotification {
  id: string;
  severity: PushAlertSeverity;
  channel: string;
  title: string;
  message: string;
  metricBadge: string;
  timestamp: string;
  targetSectionId?: string;
}
