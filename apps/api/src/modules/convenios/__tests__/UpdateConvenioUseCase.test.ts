import { AppError } from '@shared/errors/AppError';
import { UpdateConvenioUseCase } from '../useCases/UpdateConvenioUseCase';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';
import type { IConvenio, IContratoExecucao, IPendencia } from '@spd/db';
import { TipoEmpenho } from '@spd/db';

const makeRepository = (): jest.Mocked<ConvenioRepository> => ({
  list: jest.fn(),
  listLite: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const makeConvenio = (overrides: Partial<IConvenio> = {}): IConvenio =>
  ({
    id: 'conv-1',
    codigo: 'CONV-001',
    titulo: 'Convênio Teste',
    objeto: 'Objeto de teste',
    status: 'EM_EXECUCAO',
    valorGlobal: 100000,
    secretariaId: 'sec-1',
    clausulaSuspensiva: false,
    anexos: [],
    etapas: [],
    notasEmpenho: [],
    contratos: [],
    pendencias: [],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides
  }) as IConvenio;

describe('UpdateConvenioUseCase', () => {
  let sut: UpdateConvenioUseCase;
  let repository: jest.Mocked<ConvenioRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new UpdateConvenioUseCase(repository);
  });

  it('deve atualizar um convênio existente com sucesso', async () => {
    const existing = makeConvenio();
    const updated = makeConvenio({ titulo: 'Título Atualizado' });

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await sut.execute('conv-1', { titulo: 'Título Atualizado' });

    expect(repository.findById).toHaveBeenCalledWith('conv-1');
    expect(repository.update).toHaveBeenCalledWith('conv-1', { titulo: 'Título Atualizado' });
    expect(result).toEqual(updated);
  });

  it('deve lançar erro ao tentar atualizar convênio inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      sut.execute('id-invalido', { titulo: 'Novo' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Convênio não encontrado',
      statusCode: 404
    }));

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao tentar concluir com saldo pendente', async () => {
    const convenioComSaldo = makeConvenio({
      notasEmpenho: [
        { id: 'ne-1', numero: 'NE-001', tipo: TipoEmpenho.REPASSE, valor: 50000, dataEmissao: new Date(), convenioId: 'conv-1', criadoEm: new Date(), atualizadoEm: new Date() }
      ],
      contratos: [
        {
          id: 'ct-1',
          convenioId: 'conv-1',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
          medicoes: [
            { id: 'med-1', numeroMedicao: 1, dataMedicao: new Date(), valorMedido: 10000, valorPago: 10000, contratoId: 'ct-1', criadoEm: new Date(), atualizadoEm: new Date() }
          ]
        } as IContratoExecucao
      ],
      pendencias: []
    });

    repository.findById.mockResolvedValue(convenioComSaldo);

    await expect(
      sut.execute('conv-1', { status: 'CONCLUIDO' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Não é possível concluir: saldo financeiro pendente.',
      statusCode: 400
    }));

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao tentar concluir com pendências abertas', async () => {
    const convenioComPendencias = makeConvenio({
      notasEmpenho: [
        { id: 'ne-1', numero: 'NE-001', tipo: TipoEmpenho.REPASSE, valor: 10000, dataEmissao: new Date(), convenioId: 'conv-1', criadoEm: new Date(), atualizadoEm: new Date() }
      ],
      contratos: [
        {
          id: 'ct-1',
          convenioId: 'conv-1',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
          medicoes: [
            { id: 'med-1', numeroMedicao: 1, dataMedicao: new Date(), valorMedido: 10000, valorPago: 10000, contratoId: 'ct-1', criadoEm: new Date(), atualizadoEm: new Date() }
          ]
        } as IContratoExecucao
      ],
      pendencias: [
        { id: 'pend-1', descricao: 'Pendência aberta', status: 'ABERTA', convenioId: 'conv-1', criadoEm: new Date(), atualizadoEm: new Date() } as IPendencia
      ]
    });

    repository.findById.mockResolvedValue(convenioComPendencias);

    await expect(
      sut.execute('conv-1', { status: 'CONCLUIDO' })
    ).rejects.toEqual(expect.objectContaining({
      message: 'Não é possível concluir: existem pendências em aberto.',
      statusCode: 400
    }));

    expect(repository.update).not.toHaveBeenCalled();
  });
});
