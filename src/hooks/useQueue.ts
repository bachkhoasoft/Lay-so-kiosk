import { useState, useEffect } from 'react';
import { queueStore } from '../services/queueStore';
import { Ticket, Counter, ServiceCategory, CenterConfig, CallAnnouncement } from '../types';

export function useQueue() {
  const [tickets, setTickets] = useState<Ticket[]>(() => queueStore.getTickets());
  const [counters, setCounters] = useState<Counter[]>(() => queueStore.getCounters());
  const [services, setServices] = useState<ServiceCategory[]>(() => queueStore.getServices());
  const [config, setConfig] = useState<CenterConfig>(() => queueStore.getConfig());
  const [lastCall, setLastCall] = useState<CallAnnouncement | null>(() => queueStore.getLastCall());

  useEffect(() => {
    const unsubscribe = queueStore.subscribe(() => {
      setTickets(queueStore.getTickets());
      setCounters(queueStore.getCounters());
      setServices(queueStore.getServices());
      setConfig(queueStore.getConfig());
      setLastCall(queueStore.getLastCall());
    });
    return unsubscribe;
  }, []);

  return {
    tickets,
    counters,
    services,
    config,
    lastCall,
    // Operations
    issueTicket: queueStore.issueTicket.bind(queueStore),
    callNext: queueStore.callNext.bind(queueStore),
    recall: queueStore.recall.bind(queueStore),
    startServing: queueStore.startServing.bind(queueStore),
    completeServing: queueStore.completeServing.bind(queueStore),
    skipTicket: queueStore.skipTicket.bind(queueStore),
    transferTicket: queueStore.transferTicket.bind(queueStore),
    rateTicket: queueStore.rateTicket.bind(queueStore),
    updateConfig: queueStore.updateConfig.bind(queueStore),
    updateCounterStatus: queueStore.updateCounterStatus.bind(queueStore),
    getWaitingTicketsForCounter: queueStore.getWaitingTicketsForCounter.bind(queueStore),
    getServingTicketForCounter: queueStore.getServingTicketForCounter.bind(queueStore),
    getWaitingCount: queueStore.getWaitingCount.bind(queueStore),
    resetDay: queueStore.resetDay.bind(queueStore),
    seedSampleData: queueStore.seedSampleData.bind(queueStore),
  };
}
