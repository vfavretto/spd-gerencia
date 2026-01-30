import { api } from "@/modules/shared/lib/api";
import type { DashboardOverview, DashboardResumo } from "@/modules/shared/types";

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get<DashboardOverview>("/dashboard/overview");
    return data;
  },

  async getResumo(): Promise<DashboardResumo> {
    const { data } = await api.get<DashboardResumo>("/dashboard/resumo");
    return data;
  }
};
