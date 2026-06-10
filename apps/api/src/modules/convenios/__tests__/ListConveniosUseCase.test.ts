import { ListConveniosUseCase } from '../useCases/ListConveniosUseCase';
import type { ConvenioRepository, ConvenioFilters, PaginatedResult } from '../repositories/ConvenioRepository';
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

const makePaginatedResult = (data: IConvenio[]): PaginatedResult<IConvenio> => ({
  data,
  total: data.length,
  page: 1,
  totalPages: 1
});

describe('ListConveniosUseCase', () => {
  let sut: ListConveniosUseCase;
  let repository: jest.Mocked<ConvenioRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new ListConveniosUseCase(repository);
  });

  it('deve listar convênios com filtros', async () => {
    const convenios = [makeConvenio('1'), makeConvenio('2')];
    repository.list.mockResolvedValue(makePaginatedResult(convenios));

    const filters: ConvenioFilters = { status: 'EM_EXECUCAO', search: 'teste' };
    const result = await sut.execute(filters);

    expect(repository.list).toHaveBeenCalledWith(filters, undefined, undefined);
    expect(result.data).toEqual(convenios);
    expect(result.data).toHaveLength(2);
  });

  it('deve listar convênios sem filtros', async () => {
    const convenios = [makeConvenio('1')];
    repository.list.mockResolvedValue(makePaginatedResult(convenios));

    const result = await sut.execute();

    expect(repository.list).toHaveBeenCalledWith(undefined, undefined, undefined);
    expect(result.data).toEqual(convenios);
  });

  it('deve listar convênios com paginação', async () => {
    const convenios = [makeConvenio('1')];
    repository.list.mockResolvedValue(makePaginatedResult(convenios));

    const result = await sut.execute(undefined, 2, 5);

    expect(repository.list).toHaveBeenCalledWith(undefined, 2, 5);
    expect(result.page).toBe(1);
  });
});
