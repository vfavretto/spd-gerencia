import { api } from '../lib/api';
import type { DashboardOverview } from '../types';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>('/dashboard/overview');
    return data;
  }
};
