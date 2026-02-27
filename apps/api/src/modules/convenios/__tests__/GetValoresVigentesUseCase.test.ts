import type { IConvenio } from '@spd/db';
import { GetValoresVigentesUseCase } from '../useCases/GetValoresVigentesUseCase';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

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
    titulo: 'Convenio Teste',
    objeto: 'Objeto',
    status: 'EM_EXECUCAO',
    valorGlobal: 120,
    valorRepasse: 100,
    valorContrapartida: 20,
    secretariaId: 'sec-1',
    clausulaSuspensiva: false,
    anexos: [],
    etapas: [],
    aditivos: [],
    contratos: [],
    pendencias: [],
    notasEmpenho: [],
    criadoEm: new Date(),
    atualizadoEm: new Date(),
    ...overrides
  }) as IConvenio;

describe('GetValoresVigentesUseCase', () => {
  it('deve considerar apenas aditivos de convenio e aplicar ajustes manuais', async () => {
    const repository = makeRepository();

    repository.findById.mockResolvedValue(
      makeConvenio({
        aditivos: [
          {
            id: 'adit-geral',
            numeroAditivo: 1,
            tipoAditivo: 'ACRESCIMO',
            valorAcrescimo: 10,
            convenioId: 'conv-1',
            criadoEm: new Date(),
            atualizadoEm: new Date()
          },
          {
            id: 'adit-contrato',
            numeroAditivo: 1,
            tipoAditivo: 'ACRESCIMO',
            valorAcrescimo: 50,
            convenioId: 'conv-1',
            contratoId: 'ctr-1',
            criadoEm: new Date(),
            atualizadoEm: new Date()
          }
        ],
        financeiroContas: {
          id: 'fin-1',
          convenioId: 'conv-1',
          ajusteRepasseVigente: 5,
          ajusteContrapartidaVigente: -2,
          criadoEm: new Date(),
          atualizadoEm: new Date()
        } as unknown as IConvenio['financeiroContas']
      })
    );

    const sut = new GetValoresVigentesUseCase(repository);
    const result = await sut.execute('conv-1');

    expect(result.totalAcrescimos).toBe(10);
    expect(result.valorRepasseVigente).toBe(115);
    expect(result.valorContrapartidaVigente).toBe(18);
    expect(result.valorGlobalVigente).toBe(133);
  });
});
