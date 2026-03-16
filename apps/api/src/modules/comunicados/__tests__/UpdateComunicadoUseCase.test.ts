import type { IComunicado } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateComunicadoDTO } from '../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';
import { UpdateComunicadoUseCase } from '../useCases/UpdateComunicadoUseCase';

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
    origem: 'Secretaria de Obras',
    destino: null,
    responsavel: 'Maria Souza',
    dataRegistro: new Date(),
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  }) as IComunicado;

describe('UpdateComunicadoUseCase', () => {
  let sut: UpdateComunicadoUseCase;
  let repository: jest.Mocked<ComunicadoRepository>;

  beforeEach(() => {
    repository = makeRepository();
    sut = new UpdateComunicadoUseCase(repository);
  });

  it('deve atualizar um comunicado existente', async () => {
    const existing = makeComunicado();
    const dto: UpdateComunicadoDTO = {
      assunto: 'Comunicado atualizado',
      tipo: 'SAIDA',
      destino: 'Orgao concedente',
    };
    const updated = {
      ...existing,
      ...dto,
      origem: null,
    } as IComunicado;

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await sut.execute(existing.id, dto);

    expect(repository.findById).toHaveBeenCalledWith(existing.id);
    expect(repository.update).toHaveBeenCalledWith(existing.id, dto);
    expect(result).toEqual(updated);
  });

  it('deve lançar erro quando o comunicado não existir', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(sut.execute('com-inexistente', { assunto: 'Novo assunto' })).rejects.toEqual(
      expect.objectContaining({
        message: 'Comunicado não encontrado',
        statusCode: 404,
      }),
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
