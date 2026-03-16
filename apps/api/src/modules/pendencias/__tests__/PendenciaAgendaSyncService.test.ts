const findUnique = jest.fn();
const upsert = jest.fn();
const update = jest.fn();
const remove = jest.fn();

jest.mock('@spd/db', () => ({
  EventoOrigem: {
    PENDENCIA: 'PENDENCIA'
  },
  StatusPendencia: {
    ABERTA: 'ABERTA',
    EM_ANDAMENTO: 'EM_ANDAMENTO',
    RESOLVIDA: 'RESOLVIDA',
    CANCELADA: 'CANCELADA'
  },
  TipoEvento: {
    VENCIMENTO_ETAPA: 'VENCIMENTO_ETAPA'
  },
  prisma: {
    eventoAgenda: {
      findUnique,
      upsert,
      update,
      delete: remove
    }
  }
}));

import { StatusPendencia, type IPendencia } from '@spd/db';
import { PendenciaAgendaSyncService } from '../services/PendenciaAgendaSyncService';

const makePendencia = (overrides: Partial<IPendencia> = {}): IPendencia =>
  ({
    id: 'pend-1',
    descricao: 'Enviar prestação de contas',
    responsavel: 'Equipe SPD',
    prazo: new Date('2026-03-20T10:00:00.000Z'),
    status: StatusPendencia.ABERTA,
    prioridade: 2,
    resolucao: null,
    dataResolucao: null,
    orgaoResponsavel: null,
    convenioId: 'conv-1',
    criadoPorId: 'user-1',
    criadoEm: new Date('2026-03-13T10:00:00.000Z'),
    atualizadoEm: new Date('2026-03-13T10:00:00.000Z'),
    ...overrides
  }) as IPendencia;

describe('PendenciaAgendaSyncService', () => {
  const service = new PendenciaAgendaSyncService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cria evento automático quando a pendência nasce com prazo', async () => {
    await service.syncOnCreate(makePendencia());

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { pendenciaId: 'pend-1' },
        create: expect.objectContaining({
          pendenciaId: 'pend-1',
          convenioId: 'conv-1',
          titulo: 'Pendência: Enviar prestação de contas'
        })
      })
    );
  });

  it('remove evento automático quando a pendência perde o prazo', async () => {
    findUnique.mockResolvedValueOnce({ id: 'evt-1', concluidoEm: null });

    await service.syncOnUpdate(
      makePendencia(),
      makePendencia({ prazo: null })
    );

    expect(remove).toHaveBeenCalledWith({ where: { id: 'evt-1' } });
  });

  it('marca evento como concluído quando a pendência é resolvida', async () => {
    findUnique.mockResolvedValueOnce({ id: 'evt-1', concluidoEm: null });

    await service.syncOnUpdate(
      makePendencia(),
      makePendencia({ status: StatusPendencia.RESOLVIDA })
    );

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-1' },
        data: expect.objectContaining({
          concluidoEm: expect.any(Date)
        })
      })
    );
  });
});
