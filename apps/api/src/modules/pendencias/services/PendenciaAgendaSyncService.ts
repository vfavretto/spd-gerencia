import { EventoOrigem, StatusPendencia, TipoEvento, prisma, type IPendencia } from '@spd/db';

const buildTitulo = (pendencia: IPendencia) => `Pendência: ${pendencia.descricao}`;

export class PendenciaAgendaSyncService {
  private async findEventoByPendencia(pendenciaId: string) {
    return prisma.eventoAgenda.findUnique({
      where: { pendenciaId }
    });
  }

  async syncOnCreate(pendencia: IPendencia): Promise<void> {
    if (!pendencia.prazo || pendencia.status === StatusPendencia.CANCELADA) {
      return;
    }

    await prisma.eventoAgenda.upsert({
      where: { pendenciaId: pendencia.id },
      update: {
        titulo: buildTitulo(pendencia),
        descricao: pendencia.descricao,
        tipo: TipoEvento.VENCIMENTO_ETAPA,
        dataInicio: pendencia.prazo,
        dataFim: pendencia.prazo,
        responsavel: pendencia.responsavel,
        convenioId: pendencia.convenioId,
        concluidoEm:
          pendencia.status === StatusPendencia.RESOLVIDA ? new Date() : null
      },
      create: {
        titulo: buildTitulo(pendencia),
        descricao: pendencia.descricao,
        tipo: TipoEvento.VENCIMENTO_ETAPA,
        origem: EventoOrigem.PENDENCIA,
        dataInicio: pendencia.prazo,
        dataFim: pendencia.prazo,
        responsavel: pendencia.responsavel,
        convenioId: pendencia.convenioId,
        pendenciaId: pendencia.id,
        concluidoEm:
          pendencia.status === StatusPendencia.RESOLVIDA ? new Date() : null
      }
    });
  }

  async syncOnUpdate(previous: IPendencia, pendencia: IPendencia): Promise<void> {
    const evento = await this.findEventoByPendencia(pendencia.id);

    if (
      !pendencia.prazo ||
      pendencia.status === StatusPendencia.CANCELADA
    ) {
      if (evento) {
        await prisma.eventoAgenda.delete({ where: { id: evento.id } });
      }
      return;
    }

    const concluidoEm =
      pendencia.status === StatusPendencia.RESOLVIDA
        ? evento?.concluidoEm ?? new Date()
        : null;

    if (!evento) {
      await this.syncOnCreate(pendencia);
      return;
    }

    const shouldRefreshCompletion =
      previous.status !== pendencia.status ||
      Boolean(evento.concluidoEm) !== Boolean(concluidoEm);

    await prisma.eventoAgenda.update({
      where: { id: evento.id },
      data: {
        titulo: buildTitulo(pendencia),
        descricao: pendencia.descricao,
        dataInicio: pendencia.prazo,
        dataFim: pendencia.prazo,
        responsavel: pendencia.responsavel,
        convenioId: pendencia.convenioId,
        ...(shouldRefreshCompletion ? { concluidoEm } : {})
      }
    });
  }

  async syncOnDelete(pendencia: IPendencia): Promise<void> {
    const evento = await this.findEventoByPendencia(pendencia.id);
    if (!evento) return;

    await prisma.eventoAgenda.delete({ where: { id: evento.id } });
  }
}
