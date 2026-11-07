import { Ticket, Counter, ServiceCategory, CenterConfig, CallAnnouncement } from '../types';
import { DEFAULT_CONFIG, DEFAULT_SERVICES, DEFAULT_COUNTERS, INITIAL_TICKETS } from '../data/defaultData';
import { soundService } from './soundService';

const STORAGE_KEYS = {
  TICKETS: 'hcc_tickets_v1',
  COUNTERS: 'hcc_counters_v1',
  SERVICES: 'hcc_services_v1',
  CONFIG: 'hcc_config_v1',
  LAST_CALL: 'hcc_last_call_v1',
};

class QueueStore {
  private tickets: Ticket[] = [];
  private counters: Counter[] = [];
  private services: ServiceCategory[] = [];
  private config: CenterConfig = DEFAULT_CONFIG;
  private lastCall: CallAnnouncement | null = null;
  private listeners: Set<() => void> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.init();
  }

  private init() {
    this.loadFromStorage();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('hcc_queue_sync_channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC') {
          this.loadFromStorage(false);
          this.notify();
        } else if (event.data?.type === 'ANNOUNCEMENT') {
          this.lastCall = event.data.payload;
          if (this.config.soundEnabled) {
            soundService.announce(
              this.lastCall!.ticketNumber,
              this.lastCall!.counterName,
              { volume: this.config.voiceVolume, rate: this.config.voiceRate }
            );
          }
          this.notify();
        }
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key || '')) {
          this.loadFromStorage(false);
          this.notify();
        }
      });
    }
  }

  private loadFromStorage(seedIfEmpty = true) {
    try {
      const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const storedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);
      const storedCounters = localStorage.getItem(STORAGE_KEYS.COUNTERS);
      const storedTickets = localStorage.getItem(STORAGE_KEYS.TICKETS);
      const storedLastCall = localStorage.getItem(STORAGE_KEYS.LAST_CALL);

      this.config = storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
      this.services = storedServices ? JSON.parse(storedServices) : DEFAULT_SERVICES;
      this.counters = storedCounters ? JSON.parse(storedCounters) : DEFAULT_COUNTERS;
      this.tickets = storedTickets ? JSON.parse(storedTickets) : (seedIfEmpty ? INITIAL_TICKETS : []);
      this.lastCall = storedLastCall ? JSON.parse(storedLastCall) : null;

      if (!storedTickets && seedIfEmpty) {
        this.saveAll();
      }
    } catch (e) {
      console.warn('QueueStore loadFromStorage fallback:', e);
      this.config = DEFAULT_CONFIG;
      this.services = DEFAULT_SERVICES;
      this.counters = DEFAULT_COUNTERS;
      this.tickets = INITIAL_TICKETS;
    }
  }

  private saveAll() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(this.services));
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(this.counters));
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(this.tickets));
      if (this.lastCall) {
        localStorage.setItem(STORAGE_KEYS.LAST_CALL, JSON.stringify(this.lastCall));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private broadcast(payloadType: 'SYNC' | 'ANNOUNCEMENT', payload?: unknown) {
    this.saveAll();
    this.notify();
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: payloadType, payload });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Getters
  public getTickets(): Ticket[] {
    return [...this.tickets];
  }

  public getCounters(): Counter[] {
    return [...this.counters];
  }

  public getServices(): ServiceCategory[] {
    return [...this.services];
  }

  public getConfig(): CenterConfig {
    return { ...this.config };
  }

  public getLastCall(): CallAnnouncement | null {
    return this.lastCall;
  }

  public getWaitingTicketsForCounter(counterId: number): Ticket[] {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter) return [];

    return this.tickets.filter((t) => {
      if (t.status !== 'waiting') return false;
      // If priority, can be served by any counter handling priority
      if (t.isPriority && counter.assignedServices.includes('priority')) {
        return true;
      }
      return counter.assignedServices.includes(t.serviceId);
    }).sort((a, b) => {
      // Priority first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return a.issuedAt - b.issuedAt;
    });
  }

  public getWaitingCount(serviceId?: string): number {
    return this.tickets.filter((t) => {
      if (t.status !== 'waiting') return false;
      if (!serviceId) return true;
      return t.serviceId === serviceId;
    }).length;
  }

  public getServingTicketForCounter(counterId: number): Ticket | null {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return null;
    return this.tickets.find((t) => t.id === counter.currentTicketId) || null;
  }

  // Actions
  public issueTicket(params: {
    serviceId: string;
    isPriority?: boolean;
    priorityReason?: string;
    citizenName?: string;
    citizenCccd?: string;
    citizenPhone?: string;
  }): Ticket {
    const service = this.services.find((s) => s.id === params.serviceId) || this.services[0];
    const isPriority = !!params.isPriority || service.id === 'priority';

    const prefix = isPriority ? 'P' : service.code;

    // Generate sequence number for today for this prefix
    const existingForPrefix = this.tickets.filter((t) =>
      t.ticketNumber.startsWith(`${prefix}-`)
    );

    let nextSeq = 1;
    if (existingForPrefix.length > 0) {
      const numbers = existingForPrefix.map((t) => {
        const parts = t.ticketNumber.split('-');
        const n = parseInt(parts[1], 10);
        return isNaN(n) ? 0 : n;
      });
      nextSeq = Math.max(...numbers, 0) + 1;
    }

    const paddedNumber = nextSeq < 10 ? `00${nextSeq}` : nextSeq < 100 ? `0${nextSeq}` : `${nextSeq}`;
    const ticketNumber = `${prefix}-${paddedNumber}`;

    const newTicket: Ticket = {
      id: `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketNumber,
      serviceId: service.id,
      serviceCode: service.code,
      serviceName: service.name,
      department: service.department,
      isPriority,
      priorityReason: params.priorityReason,
      citizenName: params.citizenName?.trim() || undefined,
      citizenCccd: params.citizenCccd?.trim() || undefined,
      citizenPhone: params.citizenPhone?.trim() || undefined,
      issuedAt: Date.now(),
      status: 'waiting',
      notes: '',
    };

    this.tickets.unshift(newTicket);
    this.broadcast('SYNC');

    return newTicket;
  }

  public callNext(counterId: number): Ticket | null {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter) return null;

    // Finish current ticket if still serving
    if (counter.currentTicketId) {
      const current = this.tickets.find((t) => t.id === counter.currentTicketId);
      if (current && (current.status === 'calling' || current.status === 'serving')) {
        current.status = 'completed';
        current.completedAt = Date.now();
      }
    }

    const waiting = this.getWaitingTicketsForCounter(counterId);
    if (waiting.length === 0) {
      counter.currentTicketId = null;
      counter.status = 'active';
      this.broadcast('SYNC');
      return null;
    }

    const nextTicket = waiting[0];
    nextTicket.status = 'calling';
    nextTicket.calledAt = Date.now();
    nextTicket.counterId = counter.id;
    nextTicket.counterName = counter.name;
    nextTicket.officerName = counter.officerName;

    counter.currentTicketId = nextTicket.id;
    counter.status = 'busy';

    const announcement: CallAnnouncement = {
      id: `CALL-${Date.now()}`,
      ticketNumber: nextTicket.ticketNumber,
      counterId: counter.id,
      counterName: counter.name,
      serviceName: nextTicket.serviceName,
      citizenName: nextTicket.citizenName,
      timestamp: Date.now(),
      type: 'call',
    };

    this.lastCall = announcement;
    localStorage.setItem(STORAGE_KEYS.LAST_CALL, JSON.stringify(announcement));

    if (this.config.soundEnabled) {
      soundService.announce(
        nextTicket.ticketNumber,
        counter.name,
        { volume: this.config.voiceVolume, rate: this.config.voiceRate }
      );
    }

    this.broadcast('ANNOUNCEMENT', announcement);
    return nextTicket;
  }

  public recall(counterId: number): boolean {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return false;

    const ticket = this.tickets.find((t) => t.id === counter.currentTicketId);
    if (!ticket) return false;

    ticket.status = 'calling';

    const announcement: CallAnnouncement = {
      id: `RECALL-${Date.now()}`,
      ticketNumber: ticket.ticketNumber,
      counterId: counter.id,
      counterName: counter.name,
      serviceName: ticket.serviceName,
      citizenName: ticket.citizenName,
      timestamp: Date.now(),
      type: 'recall',
    };

    this.lastCall = announcement;
    localStorage.setItem(STORAGE_KEYS.LAST_CALL, JSON.stringify(announcement));

    if (this.config.soundEnabled) {
      soundService.announce(
        ticket.ticketNumber,
        counter.name,
        { volume: this.config.voiceVolume, rate: this.config.voiceRate }
      );
    }

    this.broadcast('ANNOUNCEMENT', announcement);
    return true;
  }

  public startServing(counterId: number): boolean {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return false;

    const ticket = this.tickets.find((t) => t.id === counter.currentTicketId);
    if (!ticket) return false;

    ticket.status = 'serving';
    ticket.servingStartedAt = Date.now();
    counter.status = 'busy';

    this.broadcast('SYNC');
    return true;
  }

  public completeServing(counterId: number, notes?: string): boolean {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return false;

    const ticket = this.tickets.find((t) => t.id === counter.currentTicketId);
    if (!ticket) return false;

    ticket.status = 'completed';
    ticket.completedAt = Date.now();
    if (notes) {
      ticket.notes = notes;
    }

    counter.servingCountToday += 1;
    counter.currentTicketId = null;
    counter.status = 'active';

    this.broadcast('SYNC');
    return true;
  }

  public skipTicket(counterId: number, reason: string = 'Công dân vắng mặt sau 3 lần gọi'): boolean {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || !counter.currentTicketId) return false;

    const ticket = this.tickets.find((t) => t.id === counter.currentTicketId);
    if (!ticket) return false;

    ticket.status = 'skipped';
    ticket.notes = (ticket.notes ? ticket.notes + ' | ' : '') + reason;
    ticket.skippedCount = (ticket.skippedCount || 0) + 1;

    counter.currentTicketId = null;
    counter.status = 'active';

    this.broadcast('SYNC');
    return true;
  }

  public transferTicket(ticketId: string, targetCounterId: number, reason?: string): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    const targetCounter = this.counters.find((c) => c.id === targetCounterId);
    if (!ticket || !targetCounter) return false;

    // Free up old counter if it was currently assigned
    if (ticket.counterId) {
      const oldCounter = this.counters.find((c) => c.id === ticket.counterId);
      if (oldCounter && oldCounter.currentTicketId === ticket.id) {
        oldCounter.currentTicketId = null;
        oldCounter.status = 'active';
      }
    }

    ticket.status = 'waiting';
    ticket.counterId = undefined;
    ticket.counterName = undefined;
    ticket.notes = (ticket.notes ? ticket.notes + ' | ' : '') + `Chuyển sang ${targetCounter.name}: ${reason || 'Thực hiện bước tiếp theo'}`;

    this.broadcast('SYNC');
    return true;
  }

  public rateTicket(ticketId: string, rating: {
    stars: number;
    attitudeScore: boolean;
    clarityScore: boolean;
    speedScore: boolean;
    comment?: string;
  }): boolean {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) return false;

    ticket.rating = {
      ...rating,
      createdAt: Date.now(),
    };

    this.broadcast('SYNC');
    return true;
  }

  public updateConfig(newConfig: Partial<CenterConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.broadcast('SYNC');
  }

  public updateCounterStatus(counterId: number, status: 'active' | 'busy' | 'break' | 'offline') {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter) return;
    counter.status = status;
    this.broadcast('SYNC');
  }

  public resetDay() {
    this.tickets = [];
    this.counters.forEach((c) => {
      c.currentTicketId = null;
      c.servingCountToday = 0;
      c.status = 'active';
    });
    this.lastCall = null;
    localStorage.removeItem(STORAGE_KEYS.LAST_CALL);
    this.broadcast('SYNC');
  }

  public seedSampleData() {
    this.tickets = [...INITIAL_TICKETS];
    this.counters = [...DEFAULT_COUNTERS];
    this.broadcast('SYNC');
  }
}

export const queueStore = new QueueStore();
