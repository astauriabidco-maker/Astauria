import api from './api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  source: string;
  status: 'NEW' | 'DISCOVERY' | 'POC' | 'CLOSED_WON' | 'CLOSED_LOST';
  notes?: string;
  createdAt: string;
}

export const leadsService = {
  getAll: async () => {
    const { data } = await api.get<Lead[]>('/leads');
    return data;
  },

  getMetrics: async () => {
    const { data } = await api.get('/leads/metrics');
    return data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch<Lead>(`/leads/${id}/status`, { status });
    return data;
  },

  updateNotes: async (id: string, notes: string) => {
    const { data } = await api.patch<Lead>(`/leads/${id}/notes`, { notes });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/leads/${id}`);
    return data;
  }
};
