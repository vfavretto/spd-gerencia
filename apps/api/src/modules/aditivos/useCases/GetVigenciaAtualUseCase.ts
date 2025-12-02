import type { AditivoRepository } from '../repositories/AditivoRepository';

export type VigenciaInfo = {
  vigenciaAtual: Date | null;
  vigenciaExpirada: boolean;
  diasRestantes: number | null;
};

export class GetVigenciaAtualUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(convenioId: number): Promise<VigenciaInfo> {
    const vigenciaAtual = await this.repository.getUltimaVigencia(convenioId);
    
    if (!vigenciaAtual) {
      return {
        vigenciaAtual: null,
        vigenciaExpirada: false,
        diasRestantes: null
      };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const vigencia = new Date(vigenciaAtual);
    vigencia.setHours(0, 0, 0, 0);

    const diffTime = vigencia.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      vigenciaAtual,
      vigenciaExpirada: diasRestantes < 0,
      diasRestantes
    };
  }
}

