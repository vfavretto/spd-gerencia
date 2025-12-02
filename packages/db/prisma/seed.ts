import {
  PrismaClient,
  UsuarioRole,
  ConvenioStatus,
  TipoComunicado,
  TipoEvento,
  ModalidadeRepasse,
  EsferaGoverno,
  ModalidadeLicitacao,
  StatusPendencia,
  TipoAditivo
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ==================== USUÁRIOS ====================
  const senhaPadrao = await bcrypt.hash('prefeitura2024', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@votorantim.sp.gov.br' },
    update: {},
    create: {
      nome: 'Administrador Geral',
      email: 'admin@votorantim.sp.gov.br',
      senha: senhaPadrao,
      role: UsuarioRole.ADMINISTRADOR
    }
  });

  await prisma.usuario.upsert({
    where: { email: 'analista@votorantim.sp.gov.br' },
    update: {},
    create: {
      nome: 'Maria Silva',
      email: 'analista@votorantim.sp.gov.br',
      senha: senhaPadrao,
      role: UsuarioRole.ANALISTA
    }
  });

  console.log('✅ Usuários criados');

  // ==================== CATÁLOGOS ====================
  await prisma.secretaria.createMany({
    data: [
      { nome: 'Secretaria de Planejamento e Desenvolvimento', sigla: 'SPD', responsavel: 'Ana Souza' },
      { nome: 'Secretaria de Finanças', sigla: 'SEFIN', responsavel: 'Carlos Lima' },
      { nome: 'Secretaria de Obras', sigla: 'SEOB', responsavel: 'Roberto Mendes' },
      { nome: 'Secretaria de Saúde', sigla: 'SMS', responsavel: 'Dra. Juliana Costa' }
    ],
    skipDuplicates: true
  });

  await prisma.orgaoConcedente.createMany({
    data: [
      { nome: 'Governo do Estado de São Paulo', esfera: 'Estadual', contato: 'contato@sp.gov.br' },
      { nome: 'Ministério do Desenvolvimento Regional', esfera: 'Federal', contato: 'mdr@gov.br' },
      { nome: 'Ministério das Cidades', esfera: 'Federal', contato: 'mcidades@gov.br' },
      { nome: 'Caixa Econômica Federal', esfera: 'Federal', contato: 'caixa@gov.br' }
    ],
    skipDuplicates: true
  });

  await prisma.programa.createMany({
    data: [
      { nome: 'Programa Cidades Sustentáveis', codigo: 'PCS-001', descricao: 'Ações de infraestrutura urbana' },
      { nome: 'Desenvolve Votorantim', codigo: 'DV-2024', descricao: 'Projetos estratégicos municipais' },
      { nome: 'PAC - Saneamento', codigo: 'PAC-SAN', descricao: 'Programa de Aceleração do Crescimento - Saneamento' },
      { nome: 'Minha Casa Minha Vida', codigo: 'MCMV', descricao: 'Programa habitacional federal' }
    ],
    skipDuplicates: true
  });

  await prisma.fonteRecurso.createMany({
    data: [
      { nome: 'Tesouro Municipal', tipo: 'Própria' },
      { nome: 'Repasse Estadual', tipo: 'Transferência' },
      { nome: 'Repasse Federal', tipo: 'Transferência' },
      { nome: 'Emenda Parlamentar', tipo: 'Transferência' }
    ],
    skipDuplicates: true
  });

  console.log('✅ Catálogos criados');

  // ==================== BUSCAR REFERÊNCIAS ====================
  const secretariaSPD = await prisma.secretaria.findFirst({ where: { sigla: 'SPD' } });
  const secretariaSEOB = await prisma.secretaria.findFirst({ where: { sigla: 'SEOB' } });
  const orgaoEstado = await prisma.orgaoConcedente.findFirst({ where: { nome: 'Governo do Estado de São Paulo' } });
  const orgaoMDR = await prisma.orgaoConcedente.findFirst({ where: { esfera: 'Federal' } });
  const programaCidades = await prisma.programa.findFirst({ where: { codigo: 'PCS-001' } });
  const programaPAC = await prisma.programa.findFirst({ where: { codigo: 'PAC-SAN' } });
  const fonteMunicipal = await prisma.fonteRecurso.findFirst({ where: { nome: 'Tesouro Municipal' } });
  const fonteEmenda = await prisma.fonteRecurso.findFirst({ where: { nome: 'Emenda Parlamentar' } });

  if (!secretariaSPD || !orgaoEstado || !programaCidades || !fonteMunicipal) {
    throw new Error('Falha ao preparar dados básicos para convênios');
  }

  // ==================== CONVÊNIO 1 - EM EXECUÇÃO (completo) ====================
  const convenio1 = await prisma.convenio.upsert({
    where: { codigo: 'CONV-001/2024' },
    update: {},
    create: {
      codigo: 'CONV-001/2024',
      titulo: 'Requalificação do Distrito Industrial',
      objeto: 'Modernização de vias e iluminação pública no distrito industrial',
      descricao: 'Projeto de melhorias estruturais prioritárias para desenvolvimento econômico',
      status: ConvenioStatus.EM_EXECUCAO,
      numeroProposta: 'PROP-2024-001',
      numeroTermo: 'TC 001/2024',
      modalidadeRepasse: ModalidadeRepasse.CONVENIO,
      esfera: EsferaGoverno.ESTADUAL,
      valorGlobal: 5000000,
      valorRepasse: 3500000,
      valorContrapartida: 1500000,
      dataAssinatura: new Date('2024-02-10'),
      dataInicioVigencia: new Date('2024-03-01'),
      dataFimVigencia: new Date('2026-03-01'),
      secretariaId: secretariaSPD.id,
      orgaoId: orgaoEstado.id,
      programaId: programaCidades.id,
      fonteId: fonteMunicipal.id
    }
  });

  // Financeiro do Convênio 1
  await prisma.financeiroContas.upsert({
    where: { convenioId: convenio1.id },
    update: {},
    create: {
      banco: 'Caixa Econômica Federal',
      agencia: '0123',
      contaBancaria: '00012345-6',
      valorLiberadoTotal: 2000000,
      saldoRendimentos: 15000,
      fichasOrcamentarias: 'Ficha 123 - Obras\nFicha 456 - Serviços',
      convenioId: convenio1.id
    }
  });

  // Emenda Parlamentar do Convênio 1
  await prisma.emendaParlamentar.createMany({
    data: [
      {
        nomeParlamentar: 'Dep. João Silva',
        partido: 'PSD',
        codigoEmenda: 'EMD-2024-001',
        funcao: 'Urbanismo',
        subfuncao: 'Infraestrutura Urbana',
        programa: 'Cidades Sustentáveis',
        valorIndicado: 1000000,
        anoEmenda: 2024,
        convenioId: convenio1.id
      }
    ],
    skipDuplicates: true
  });

  // Contrato de Execução do Convênio 1
  const contrato1 = await prisma.contratoExecucao.upsert({
    where: { id: 1 },
    update: {},
    create: {
      numProcessoLicitatorio: 'PL 015/2024',
      modalidadeLicitacao: ModalidadeLicitacao.CONCORRENCIA,
      numeroContrato: 'CT 001/2024',
      contratadaCnpj: '12.345.678/0001-90',
      contratadaNome: 'Construtora ABC Ltda',
      dataAssinatura: new Date('2024-04-15'),
      dataVigenciaInicio: new Date('2024-05-01'),
      dataVigenciaFim: new Date('2025-12-31'),
      dataOIS: new Date('2024-05-15'),
      valorContrato: 3200000,
      engenheiroResponsavel: 'Eng. Pedro Almeida',
      creaEngenheiro: 'SP-123456',
      artRrt: 'ART-2024-00123',
      situacao: 'Em Execução',
      convenioId: convenio1.id
    }
  });

  // Medições do Contrato 1
  await prisma.medicao.createMany({
    data: [
      {
        numeroMedicao: 1,
        dataMedicao: new Date('2024-06-15'),
        percentualFisico: 15,
        valorMedido: 480000,
        dataPagamento: new Date('2024-07-01'),
        valorPago: 480000,
        situacao: 'aprovada',
        contratoId: contrato1.id
      },
      {
        numeroMedicao: 2,
        dataMedicao: new Date('2024-08-15'),
        percentualFisico: 35,
        valorMedido: 640000,
        dataPagamento: new Date('2024-09-01'),
        valorPago: 640000,
        situacao: 'aprovada',
        contratoId: contrato1.id
      },
      {
        numeroMedicao: 3,
        dataMedicao: new Date('2024-10-15'),
        percentualFisico: 55,
        valorMedido: 640000,
        situacao: 'em análise',
        contratoId: contrato1.id
      }
    ],
    skipDuplicates: true
  });

  // Pendências do Convênio 1
  await prisma.pendencia.createMany({
    data: [
      {
        descricao: 'Aguardando aprovação da 3ª medição pelo órgão concedente',
        responsavel: 'Equipe Técnica SPD',
        prazo: new Date('2024-11-30'),
        status: StatusPendencia.EM_ANDAMENTO,
        prioridade: 1,
        convenioId: convenio1.id,
        criadoPorId: admin.id
      },
      {
        descricao: 'Documentação de regularidade fiscal da contratada vencendo',
        responsavel: 'Fiscal do Contrato',
        prazo: new Date('2024-12-15'),
        status: StatusPendencia.ABERTA,
        prioridade: 2,
        convenioId: convenio1.id,
        criadoPorId: admin.id
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Convênio 1 criado com dados completos');

  // ==================== CONVÊNIO 2 - APROVADO (aguardando contrato) ====================
  const convenio2 = await prisma.convenio.upsert({
    where: { codigo: 'CONV-002/2024' },
    update: {},
    create: {
      codigo: 'CONV-002/2024',
      titulo: 'Construção de UBS no Bairro Jardim das Flores',
      objeto: 'Construção de Unidade Básica de Saúde com 800m²',
      descricao: 'Nova unidade de saúde para atender região sul do município',
      status: ConvenioStatus.APROVADO,
      numeroProposta: 'PROP-2024-002',
      numeroTermo: 'TC 002/2024',
      modalidadeRepasse: ModalidadeRepasse.CONTRATO_REPASSE,
      esfera: EsferaGoverno.FEDERAL,
      valorGlobal: 2500000,
      valorRepasse: 2000000,
      valorContrapartida: 500000,
      dataAssinatura: new Date('2024-08-20'),
      dataInicioVigencia: new Date('2024-09-01'),
      dataFimVigencia: new Date('2026-09-01'),
      secretariaId: secretariaSEOB?.id || secretariaSPD.id,
      orgaoId: orgaoMDR?.id || orgaoEstado.id,
      programaId: programaPAC?.id || programaCidades.id,
      fonteId: fonteEmenda?.id || fonteMunicipal.id
    }
  });

  console.log('✅ Convênio 2 criado');

  // ==================== CONVÊNIO 3 - RASCUNHO ====================
  await prisma.convenio.upsert({
    where: { codigo: 'CONV-003/2024' },
    update: {},
    create: {
      codigo: 'CONV-003/2024',
      titulo: 'Revitalização da Praça Central',
      objeto: 'Reforma e modernização da praça central do município',
      status: ConvenioStatus.RASCUNHO,
      valorGlobal: 800000,
      secretariaId: secretariaSPD.id
    }
  });

  console.log('✅ Convênio 3 criado');

  // ==================== COMUNICADOS ====================
  await prisma.comunicado.upsert({
    where: { protocolo: 'COM-001/2024' },
    update: {},
    create: {
      protocolo: 'COM-001/2024',
      assunto: 'Envio de documentação complementar',
      conteudo: 'Segue em anexo a documentação solicitada referente à prestação de contas parcial.',
      tipo: TipoComunicado.ENTRADA,
      status: 'PENDENTE',
      origem: 'Governo Estadual',
      destino: 'SPD',
      responsavel: 'Equipe Técnica',
      convenioId: convenio1.id
    }
  });

  await prisma.comunicado.upsert({
    where: { protocolo: 'COM-002/2024' },
    update: {},
    create: {
      protocolo: 'COM-002/2024',
      assunto: 'Solicitação de prorrogação de prazo',
      conteudo: 'Solicitamos prorrogação do prazo de vigência conforme justificativa técnica anexa.',
      tipo: TipoComunicado.SAIDA,
      status: 'ENVIADO',
      origem: 'SPD',
      destino: 'Governo Estadual',
      responsavel: 'Coordenador de Convênios',
      convenioId: convenio1.id
    }
  });

  console.log('✅ Comunicados criados');

  // ==================== EVENTOS ====================
  await prisma.eventoAgenda.upsert({
    where: { id: 1 },
    update: {},
    create: {
      titulo: 'Entrega da Prestação de Contas Parcial',
      descricao: 'Preparar documentos e anexos para prestação de contas',
      tipo: TipoEvento.PRESTACAO_CONTAS,
      dataInicio: new Date('2024-12-01T09:00:00'),
      dataFim: new Date('2024-12-01T11:00:00'),
      local: 'Sala de Reuniões SPD',
      responsavel: 'Ana Souza',
      convenioId: convenio1.id
    }
  });

  await prisma.eventoAgenda.upsert({
    where: { id: 2 },
    update: {},
    create: {
      titulo: 'Reunião com órgão concedente',
      descricao: 'Alinhamento sobre cronograma de execução',
      tipo: TipoEvento.REUNIAO,
      dataInicio: new Date('2024-12-10T14:00:00'),
      dataFim: new Date('2024-12-10T16:00:00'),
      local: 'Videoconferência',
      responsavel: 'Coordenador SPD',
      convenioId: convenio1.id
    }
  });

  console.log('✅ Eventos criados');

  console.log('\n🎉 Seed do banco executado com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Email: admin@votorantim.sp.gov.br');
  console.log('   Senha: prefeitura2024');
}

main()
  .catch((err) => {
    console.error('❌ Erro ao executar seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
