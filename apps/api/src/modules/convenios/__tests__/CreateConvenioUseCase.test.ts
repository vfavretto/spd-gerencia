import { CreateConvenioUseCase } from '../useCases/CreateConvenioUseCase';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';
import type { CreateConvenioDTO } from '../dto/ConvenioDTO';
import type { IConvenio } from '@spd/db';

const makeRepository = (): jest.Mocked<ConvenioRepository> => ({
  list: jest.fn(),
  listLite: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
});

const makeConvenio = (): IConvenio =>
  ({
    id: 'conv-1',
    codigo: 'CONV-001',
    titulo: 'Convênio Teste',
    objeto: 'Objeto de teste',
    status: 'RASCUNHO',
    valorGlobal: 100000,
    secretariaId: 'sec-1',
    clausulaSuspensiva: false,
    anexos: [],
    etapas: [],
    criadoEm: new Date(),
    atualizadoEm: new Date()
  }) as IConvenio;

describe('CreateConvenioUseCase', () => {
  let sut: CreateConvenioUseCase;
  let repository: jest.Mocked<ConvenioRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new CreateConvenioUseCase(repository);
  });

  it('deve delegar a criação ao repositório e retornar o resultado', async () => {
    const dto: CreateConvenioDTO = {
      codigo: 'CONV-001',
      titulo: 'Convênio Teste',
      objeto: 'Objeto de teste',
      valorGlobal: 100000,
      secretariaId: 'sec-1'
    };

    const expectedConvenio = makeConvenio();
    repository.create.mockResolvedValue(expectedConvenio);

    const result = await sut.execute(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedConvenio);
  });
});
