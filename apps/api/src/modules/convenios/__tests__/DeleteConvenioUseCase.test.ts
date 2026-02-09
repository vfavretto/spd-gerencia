import { AppError } from '@shared/errors/AppError';
import { DeleteConvenioUseCase } from '../useCases/DeleteConvenioUseCase';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';
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

describe('DeleteConvenioUseCase', () => {
  let sut: DeleteConvenioUseCase;
  let repository: jest.Mocked<ConvenioRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new DeleteConvenioUseCase(repository);
  });

  it('deve excluir um convênio existente com sucesso', async () => {
    repository.findById.mockResolvedValue(makeConvenio());
    repository.delete.mockResolvedValue();

    await sut.execute('conv-1');

    expect(repository.findById).toHaveBeenCalledWith('conv-1');
    expect(repository.delete).toHaveBeenCalledWith('conv-1');
  });

  it('deve lançar erro ao tentar excluir convênio inexistente', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      sut.execute('id-invalido')
    ).rejects.toEqual(expect.objectContaining({
      message: 'Convênio não encontrado',
      statusCode: 404
    }));

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
