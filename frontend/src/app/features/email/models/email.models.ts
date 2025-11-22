export interface EmailAccount {
  id: string;
  domain: string;
  status: string;
  totalEmails: number;
  deliveryRate: number;
}

export interface FlowChartData {
  flow: EmailFlowItem[];
}

export interface EmailFlowItem {
  label: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface TopRecipient {
  email: string;
  received: number;
}

export interface TopSender {
  email: string;
  sent: number;
}

export interface ServerMetrics {
  server: string;
  totalProcessed: number;
  deliveryRate: number;
  queueSize: number;
  load: number;
  status: string;
}
