import type { IComunicado } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';
import { DeleteComunicadoUseCase } from '../useCases/DeleteComunicadoUseCase';

const makeRepository = (): jest.Mocked<ComunicadoRepository> => ({
  list: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const makeComunicado = (): IComunicado =>
  ({
    id: 'com-1',
    protocolo: 'PROT-001',
    assunto: 'Comunicado original',
    conteudo: 'Conteudo original',
    tipo: 'ENTRADA',
    dataRegistro: new Date(),
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  }) as IComunicado;

describe('DeleteComunicadoUseCase', () => {
  let sut: DeleteComunicadoUseCase;
  let repository: jest.Mocked<ComunicadoRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new DeleteComunicadoUseCase(repository);
  });

  it('deve excluir um comunicado existente', async () => {
    const existing = makeComunicado();
    repository.findById.mockResolvedValue(existing);

    await sut.execute(existing.id);

    expect(repository.findById).toHaveBeenCalledWith(existing.id);
    expect(repository.delete).toHaveBeenCalledWith(existing.id);
  });

  it('deve lançar erro quando o comunicado não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(sut.execute('com-inexistente')).rejects.toEqual(
      expect.objectContaining({
        message: 'Comunicado não encontrado',
        statusCode: 404,
      }),
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
