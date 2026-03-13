import { api } from "@/modules/shared/lib/api";
import type { EventoAgenda } from "@/modules/shared/types";

export type CreateEventoPayload = {
  titulo: string;
  descricao?: string | null;
  tipo?: EventoAgenda["tipo"];
  dataInicio: string;
  dataFim?: string | null;
  local?: string | null;
  responsavel?: string | null;
  convenioId?: string | null;
};

export type UpdateEventoPayload = Partial<CreateEventoPayload> & {
  descricaoComplementar?: string | null;
};

export const agendaService = {
  async listEventos(): Promise<EventoAgenda[]> {
    const { data } = await api.get<EventoAgenda[]>("/agenda/eventos");
    return data;
  },

  async createEvento(payload: CreateEventoPayload): Promise<EventoAgenda> {
    const { data } = await api.post<EventoAgenda>("/agenda/eventos", payload);
    return data;
  },

  async updateEvento(
    id: string,
    payload: UpdateEventoPayload
  ): Promise<EventoAgenda> {
    const { data } = await api.put<EventoAgenda>(`/agenda/eventos/${id}`, payload);
    return data;
  },

  async removeEvento(id: string): Promise<void> {
    await api.delete(`/agenda/eventos/${id}`);
  }
};
