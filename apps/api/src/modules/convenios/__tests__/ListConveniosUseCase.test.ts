import { ListConveniosUseCase } from '../useCases/ListConveniosUseCase';
import type { ConvenioRepository, ConvenioFilters } from '../repositories/ConvenioRepository';
import type { IConvenio } from '@spd/db';

const makeRepository = (): jest.Mocked<ConvenioRepository> => ({
  list: jest.fn(),
  listLite: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const makeConvenio = (id: string): IConvenio =>
  ({
    id,
    codigo: `CONV-${id}`,
    titulo: `Convênio ${id}`,
    objeto: 'Objeto de teste',
    status: 'EM_EXECUCAO',
    valorGlobal: 100000,
    secretariaId: 'sec-1',
    clausulaSuspensiva: false,
    anexos: [],
    etapas: [],
    criadoEm: new Date(),
    atualizadoEm: new Date()
  }) as IConvenio;

describe('ListConveniosUseCase', () => {
  let sut: ListConveniosUseCase;
  let repository: jest.Mocked<ConvenioRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new ListConveniosUseCase(repository);
  });

  it('deve listar convênios com filtros', async () => {
    const convenios = [makeConvenio('1'), makeConvenio('2')];
    repository.list.mockResolvedValue(convenios);

    const filters: ConvenioFilters = { status: 'EM_EXECUCAO', search: 'teste' };
    const result = await sut.execute(filters);

    expect(repository.list).toHaveBeenCalledWith(filters);
    expect(result).toEqual(convenios);
    expect(result).toHaveLength(2);
  });

  it('deve listar convênios sem filtros', async () => {
    const convenios = [makeConvenio('1')];
    repository.list.mockResolvedValue(convenios);

    const result = await sut.execute();

    expect(repository.list).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(convenios);
  });
});
