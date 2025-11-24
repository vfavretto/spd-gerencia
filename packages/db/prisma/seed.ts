import { PrismaClient, UsuarioRole, ConvenioStatus, TipoComunicado, TipoEvento } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaPadrao = await bcrypt.hash('prefeitura2024', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@votorantim.sp.gov.br' },
    update: {},
    create: {
      nome: 'Administrador Geral',
      email: 'admin@votorantim.sp.gov.br',
      senha: senhaPadrao,
      role: UsuarioRole.ADMINISTRADOR
    }
  });

  await prisma.secretaria.createMany({
    data: [
      { nome: 'Secretaria de Planejamento e Desenvolvimento', sigla: 'SPD', responsavel: 'Ana Souza' },
      { nome: 'Secretaria de Finanças', sigla: 'SEFIN', responsavel: 'Carlos Lima' }
    ],
    skipDuplicates: true
  });

  await prisma.orgaoConcedente.createMany({
    data: [
      { nome: 'Governo do Estado de São Paulo', esfera: 'Estadual', contato: 'contato@sp.gov.br' },
      { nome: 'Ministério do Desenvolvimento Regional', esfera: 'Federal', contato: 'mdr@gov.br' }
    ],
    skipDuplicates: true
  });

  await prisma.programa.createMany({
    data: [
      { nome: 'Programa Cidades Sustentáveis', codigo: 'PCS-001', descricao: 'Ações de infraestrutura urbana' },
      { nome: 'Desenvolve Votorantim', codigo: 'DV-2024', descricao: 'Projetos estratégicos municipais' }
    ],
    skipDuplicates: true
  });

  await prisma.fonteRecurso.createMany({
    data: [
      { nome: 'Tesouro Municipal', tipo: 'Própria' },
      { nome: 'Repasse Estadual', tipo: 'Transferência' }
    ],
    skipDuplicates: true
  });

  const secretariaPrincipal = await prisma.secretaria.findFirst({ where: { sigla: 'SPD' } });
  const orgaoEstado = await prisma.orgaoConcedente.findFirst({ where: { nome: 'Governo do Estado de São Paulo' } });
  const programaCidades = await prisma.programa.findFirst({ where: { codigo: 'PCS-001' } });
  const fonteMunicipal = await prisma.fonteRecurso.findFirst({ where: { nome: 'Tesouro Municipal' } });

  if (!secretariaPrincipal || !orgaoEstado || !programaCidades || !fonteMunicipal) {
    throw new Error('Falha ao preparar dados básicos para convênios');
  }

  const convenio = await prisma.convenio.upsert({
    where: { codigo: 'CONV-001/2024' },
    update: {},
    create: {
      codigo: 'CONV-001/2024',
      titulo: 'Requalificação do Distrito Industrial',
      objeto: 'Modernização de vias e iluminação',
      descricao: 'Melhorias estruturais prioritárias',
      status: ConvenioStatus.EM_EXECUCAO,
      valorGlobal: 5000000,
      valorRepasse: 3500000,
      valorContrapartida: 1500000,
      dataAssinatura: new Date('2024-02-10'),
      dataInicioVigencia: new Date('2024-03-01'),
      dataFimVigencia: new Date('2026-03-01'),
      secretariaId: secretariaPrincipal.id,
      orgaoId: orgaoEstado.id,
      programaId: programaCidades.id,
      fonteId: fonteMunicipal.id,
      etapas: {
        create: [
          {
            titulo: 'Projeto Executivo',
            descricao: 'Detalhamento técnico',
            dataPrevista: new Date('2024-05-01')
          },
          {
            titulo: 'Licitação',
            descricao: 'Processo licitatório',
            dataPrevista: new Date('2024-08-15')
          }
        ]
      }
    }
  });

  if (!convenio) {
    throw new Error('Convênio base não localizado após criação');
  }

  await prisma.comunicado.upsert({
    where: { protocolo: 'COM-001/2024' },
    update: {},
    create: {
      protocolo: 'COM-001/2024',
      assunto: 'Envio de documentação complementar',
      tipo: TipoComunicado.ENTRADA,
      status: 'PENDENTE',
      origem: 'Governo Estadual',
      destino: 'SPD',
      responsavel: 'Equipe Técnica',
      convenioId: convenio.id
    }
  });

  await prisma.comunicado.upsert({
    where: { protocolo: 'COM-002/2024' },
    update: {},
    create: {
      protocolo: 'COM-002/2024',
      assunto: 'Saída de comunicado interno',
      tipo: TipoComunicado.SAIDA,
      status: 'ENVIADO',
      origem: 'SPD',
      destino: 'SEFIN',
      responsavel: 'Coordenador Financeiro',
      convenioId: convenio.id
    }
  });

  const eventoExistente = await prisma.eventoAgenda.findFirst({
    where: { titulo: 'Entrega da Prestação de Contas Parcial' }
  });

  if (!eventoExistente) {
    await prisma.eventoAgenda.create({
      data: {
        titulo: 'Entrega da Prestação de Contas Parcial',
        descricao: 'Preparar documentos e anexos',
        tipo: TipoEvento.PRESTACAO_CONTAS,
        dataInicio: new Date('2024-12-01T09:00:00'),
        dataFim: new Date('2024-12-01T11:00:00'),
        local: 'Sala de Reuniões SPD',
        responsavel: 'Ana Souza',
        convenioId: convenio.id
      }
    });
  }

  console.log('Seed do banco executado com sucesso');
}

main()
  .catch((err) => {
    console.error('Erro ao executar seed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
