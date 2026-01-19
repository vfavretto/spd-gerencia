import { api } from '../lib/api';
import type { DashboardOverview, DashboardResumo } from '../types';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>('/dashboard/overview');
    return data;
  },

  async getResumo(): Promise<DashboardResumo> {
    const { data } = await api.get<DashboardResumo>('/dashboard/resumo');
    return data;
  }
};
