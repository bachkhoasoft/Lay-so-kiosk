export type TicketStatus = 'waiting' | 'calling' | 'serving' | 'completed' | 'skipped' | 'transferred';

export interface ServiceCategory {
  id: string;
  code: string; // e.g. "A", "B", "C", "D", "E", "F", "P"
  name: string;
  department: string;
  description: string;
  targetCounters: number[]; // Counter IDs that handle this service
  estMinutesPerCitizen: number;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
  };
  requiredDocsHint: string[];
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. "A-102", "P-001"
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  department: string;
  isPriority: boolean;
  priorityReason?: string;
  citizenName?: string;
  citizenCccd?: string;
  citizenPhone?: string;
  issuedAt: number; // timestamp
  calledAt?: number;
  servingStartedAt?: number;
  completedAt?: number;
  status: TicketStatus;
  counterId?: number;
  counterName?: string;
  officerName?: string;
  skippedCount?: number;
  notes?: string;
  rating?: {
    stars: number; // 1 - 5
    attitudeScore: boolean; // Thái độ phục vụ chuẩn mực
    clarityScore: boolean; // Hướng dẫn rõ ràng
    speedScore: boolean; // Thời gian giải quyết nhanh chóng
    comment?: string;
    createdAt: number;
  };
}

export interface Counter {
  id: number;
  name: string; // "Quầy số 01"
  code: string;
  assignedServices: string[]; // List of serviceCategory ids
  officerName: string;
  officerTitle: string;
  officerAvatar?: string;
  status: 'active' | 'busy' | 'break' | 'offline';
  currentTicketId?: string | null;
  servingCountToday: number;
  averageServingMinutes: number;
}

export interface CallAnnouncement {
  id: string;
  ticketNumber: string;
  counterId: number;
  counterName: string;
  serviceName: string;
  citizenName?: string;
  timestamp: number;
  type: 'call' | 'recall';
}

export interface CenterConfig {
  centerName: string;
  subTitle: string;
  address: string;
  hotline: string;
  operatingHours: string;
  soundEnabled: boolean;
  voiceVolume: number; // 0 - 1
  voicePitch: number;
  voiceRate: number; // 0.8 - 1.2
  autoAdvanceSeconds: number;
  announcementTemplate: string; // e.g. "Xin mời số [TICKET] đến [COUNTER]"
}
