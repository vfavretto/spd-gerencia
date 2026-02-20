import path from 'node:path';
import dotenv from 'dotenv';
import { prisma } from '../src/connection';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ─── Helpers ──────────────────────────────────────────────────

function d(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00.000Z');
}

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// ─── Seed principal ───────────────────────────────────────────

export async function seedConvenios(): Promise<void> {
  console.log('🌱 Iniciando seed de demonstração...\n');

  // ─── 1. Secretarias ─────────────────────────────────────────

  console.log('📁 Criando secretarias...');
  const secInfra = await prisma.secretaria.upsert({
    where: { id: 'sec-infra' },
    update: {},
    create: { id: 'sec-infra', nome: 'Secretaria de Infraestrutura e Obras', sigla: 'SOURB', responsavel: 'Carlos Eduardo Mendes' },
  });

  const secEducacao = await prisma.secretaria.upsert({
    where: { id: 'sec-edu' },
    update: {},
    create: { id: 'sec-edu', nome: 'Secretaria de Educação', sigla: 'SEED', responsavel: 'Maria Clara Oliveira' },
  });

  const secSaude = await prisma.secretaria.upsert({
    where: { id: 'sec-saude' },
    update: {},
    create: { id: 'sec-saude', nome: 'Secretaria de Saúde', sigla: 'SESAU', responsavel: 'Dr. Roberto Amaral' },
  });

  const secEsporte = await prisma.secretaria.upsert({
    where: { id: 'sec-esp' },
    update: {},
    create: { id: 'sec-esp', nome: 'Secretaria de Esporte e Lazer', sigla: 'SESEL', responsavel: 'Ana Paula dos Santos' },
  });

  const secCultura = await prisma.secretaria.upsert({
    where: { id: 'sec-cult' },
    update: {},
    create: { id: 'sec-cult', nome: 'Secretaria de Cultura e Turismo', sigla: 'SECULT', responsavel: 'Fernando Ribeiro' },
  });

  const secMeio = await prisma.secretaria.upsert({
    where: { id: 'sec-meio' },
    update: {},
    create: { id: 'sec-meio', nome: 'Secretaria de Meio Ambiente', sigla: 'SEMA', responsavel: 'Juliana Campos' },
  });

  // ─── 2. Órgãos Concedentes ──────────────────────────────────

  console.log('🏛️  Criando órgãos concedentes...');
  const orgaoCidades = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-cidades' },
    update: {},
    create: { id: 'org-cidades', nome: 'Ministério das Cidades', esfera: 'Federal', contato: 'convenios@cidades.gov.br' },
  });

  const orgaoFNDE = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-fnde' },
    update: {},
    create: { id: 'org-fnde', nome: 'FNDE - Fundo Nacional de Desenvolvimento da Educação', esfera: 'Federal', contato: 'fnde@mec.gov.br' },
  });

  const orgaoEsporte = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-esporte' },
    update: {},
    create: { id: 'org-esporte', nome: 'Ministério do Esporte', esfera: 'Federal', contato: 'contato@esporte.gov.br' },
  });

  const orgaoSGRI = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-sgri' },
    update: {},
    create: { id: 'org-sgri', nome: 'SGRI - Secretaria de Governo e Relações Institucionais', esfera: 'Estadual', contato: 'sgri@sp.gov.br' },
  });

  const orgaoTurismo = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-turismo' },
    update: {},
    create: { id: 'org-turismo', nome: 'Ministério do Turismo', esfera: 'Federal', contato: 'mtur@turismo.gov.br' },
  });

  const orgaoSaude = await prisma.orgaoConcedente.upsert({
    where: { id: 'org-saude' },
    update: {},
    create: { id: 'org-saude', nome: 'Ministério da Saúde', esfera: 'Federal', contato: 'fns@saude.gov.br' },
  });

  // ─── 3. Programas ───────────────────────────────────────────

  console.log('📋 Criando programas...');
  const progInfra = await prisma.programa.upsert({
    where: { id: 'prog-infra' },
    update: {},
    create: { id: 'prog-infra', nome: 'Infraestrutura Urbana', codigo: '674', descricao: 'Melhoria da infraestrutura urbana municipal' },
  });

  const progCreche = await prisma.programa.upsert({
    where: { id: 'prog-creche' },
    update: {},
    create: { id: 'prog-creche', nome: 'Novo PAC - Creches e Escolas', codigo: '2629', descricao: 'Construção de creches e escolas de educação infantil' },
  });

  const progEsporte = await prisma.programa.upsert({
    where: { id: 'prog-esporte' },
    update: {},
    create: { id: 'prog-esporte', nome: 'Obras Esportivas', codigo: '5100', descricao: 'Implantação e modernização de infraestrutura esportiva' },
  });

  const progTurismo = await prisma.programa.upsert({
    where: { id: 'prog-turismo' },
    update: {},
    create: { id: 'prog-turismo', nome: 'MIT - Município de Interesse Turístico', codigo: '584', descricao: 'Infraestrutura turística municipal' },
  });

  const progUBS = await prisma.programa.upsert({
    where: { id: 'prog-ubs' },
    update: {},
    create: { id: 'prog-ubs', nome: 'Novo PAC - Unidades Básicas de Saúde', codigo: '3600', descricao: 'Construção e reforma de UBS' },
  });

  // ─── 4. Fontes de Recurso ──────────────────────────────────

  console.log('💰 Criando fontes de recurso...');
  const fonteEmenda = await prisma.fonteRecurso.upsert({
    where: { id: 'fonte-emenda' },
    update: {},
    create: { id: 'fonte-emenda', nome: 'Emenda Parlamentar Individual', tipo: 'RP6' },
  });

  const fonteVoluntaria = await prisma.fonteRecurso.upsert({
    where: { id: 'fonte-vol' },
    update: {},
    create: { id: 'fonte-vol', nome: 'Transferência Voluntária', tipo: 'RP0' },
  });

  const fontePAC = await prisma.fonteRecurso.upsert({
    where: { id: 'fonte-pac' },
    update: {},
    create: { id: 'fonte-pac', nome: 'Novo PAC', tipo: 'Programa Federal' },
  });

  // ════════════════════════════════════════════════════════════
  //
  //   C O N V Ê N I O S
  //
  // ════════════════════════════════════════════════════════════

  // ──────────────────────────────────────────────────────────
  // 1. RASCUNHO — Recém-cadastrado, sem assinatura
  // ──────────────────────────────────────────────────────────
  console.log('\n📝 [RASCUNHO] Convênios recém-cadastrados...');

  await prisma.convenio.upsert({
    where: { codigo: 'CV-2025-001' },
    update: {},
    create: {
      codigo: 'CV-2025-001',
      titulo: 'Reforma da Praça Central do Bairro Itapeva',
      objeto: 'Reforma e revitalização da praça central do Bairro Itapeva, incluindo playground, academia ao ar livre e paisagismo.',
      status: 'RASCUNHO',
      descricao: 'Proposta ainda em fase de elaboração do plano de trabalho.',
      numeroProposta: '098765/2025',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 350000,
      valorRepasse: 300000,
      valorContrapartida: 50000,
      processoSPD: '1234/2025',
      area: 'INFRAESTRUTURA',
      secretariaId: secInfra.id,
      orgaoId: orgaoSGRI.id,
      programaId: progInfra.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  await prisma.convenio.upsert({
    where: { codigo: 'CV-2025-002' },
    update: {},
    create: {
      codigo: 'CV-2025-002',
      titulo: 'Aquisição de Equipamentos para Clínica Veterinária Municipal',
      objeto: 'Aquisição de equipamentos de diagnóstico e material permanente para a Clínica Veterinária Municipal.',
      status: 'RASCUNHO',
      descricao: 'Aguardando definição do plano de trabalho e aprovação interna.',
      numeroProposta: '045321/2025',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      valorGlobal: 190000,
      valorRepasse: 180000,
      valorContrapartida: 10000,
      processoSPD: '2678/2025',
      area: 'MEIO AMBIENTE',
      secretariaId: secMeio.id,
      orgaoId: orgaoCidades.id,
      fonteId: fonteEmenda.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 2. EM_ANALISE — Submetido, aguardando aprovação
  // ──────────────────────────────────────────────────────────
  console.log('🔍 [EM_ANALISE] Convênios em análise...');

  await prisma.convenio.upsert({
    where: { codigo: 'CV-2024-015' },
    update: {},
    create: {
      codigo: 'CV-2024-015',
      titulo: 'Construção de Quadra Poliesportiva no Jardim das Flores',
      objeto: 'Construção de quadra poliesportiva coberta com vestiários e iluminação no Jardim das Flores.',
      status: 'EM_ANALISE',
      descricao: 'Plano de trabalho submetido ao concedente. Aguardando parecer técnico.',
      numeroProposta: '067891/2024',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 480000,
      valorRepasse: 400000,
      valorContrapartida: 80000,
      dataInicioProcesso: d('2024-06-15'),
      processoSPD: '4521/2024',
      area: 'ESPORTE',
      secretariaId: secEsporte.id,
      orgaoId: orgaoEsporte.id,
      programaId: progEsporte.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  await prisma.convenio.upsert({
    where: { codigo: 'CV-2024-018' },
    update: {},
    create: {
      codigo: 'CV-2024-018',
      titulo: 'Implantação de Sistema de Monitoramento Ambiental',
      objeto: 'Implantação de sistema de monitoramento da qualidade do ar e recursos hídricos no município.',
      status: 'EM_ANALISE',
      descricao: 'Em diligência — solicitada documentação complementar pela CETESB.',
      numeroProposta: '089432/2024',
      modalidadeRepasse: 'TERMO_FOMENTO',
      esfera: 'ESTADUAL',
      valorGlobal: 220000,
      valorRepasse: 200000,
      valorContrapartida: 20000,
      dataInicioProcesso: d('2024-09-01'),
      processoSPD: '6789/2024',
      area: 'MEIO AMBIENTE',
      secretariaId: secMeio.id,
      orgaoId: orgaoSGRI.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 3. APROVADO — Assinado, mas sem contrato ainda
  // ──────────────────────────────────────────────────────────
  console.log('✅ [APROVADO] Convênios aprovados e assinados...');

  const convAprovado1 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2024-010' },
    update: {},
    create: {
      codigo: 'CV-2024-010',
      titulo: 'Troca de Iluminação por LED no Bairro da Chave',
      objeto: 'Substituição de iluminação convencional por tecnologia LED no Bairro da Chave e Jardim Europa.',
      status: 'APROVADO',
      numeroProposta: '062292/2024',
      numeroTermo: 'TC 142/2024',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 629674.90,
      valorRepasse: 500000,
      valorContrapartida: 129674.90,
      dataAssinatura: d('2024-05-20'),
      dataInicioVigencia: d('2024-05-20'),
      dataFimVigencia: d('2026-05-20'),
      processoSPD: '7096/2023',
      processoCreditoAdicional: '489/2024',
      area: 'INFRAESTRUTURA',
      secretariaId: secInfra.id,
      orgaoId: orgaoSGRI.id,
      programaId: progInfra.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  // Emendas para o convênio aprovado
  await prisma.emendaParlamentar.upsert({
    where: { id: 'emenda-aprov-1' },
    update: {},
    create: {
      id: 'emenda-aprov-1',
      nomeParlamentar: 'Dep. Professora Bebel',
      partido: 'PT',
      codigoEmenda: '2023.073.50755',
      funcao: '15 - Urbanismo',
      subfuncao: '451 - Infraestrutura Urbana',
      valorIndicado: 500000,
      anoEmenda: 2023,
      convenioId: convAprovado1.id,
    },
  });

  const convAprovado2 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2024-012' },
    update: {},
    create: {
      codigo: 'CV-2024-012',
      titulo: 'Construção do Centro de Atendimento ao Turista',
      objeto: 'Construção de centro de atendimento ao turista com espaço para exposições e informações turísticas.',
      status: 'APROVADO',
      numeroProposta: '063953/2024',
      numeroTermo: 'TC 175/2024',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 592414.28,
      valorRepasse: 571081.63,
      valorContrapartida: 21332.65,
      dataAssinatura: d('2024-01-15'),
      dataInicioVigencia: d('2024-01-15'),
      dataFimVigencia: d('2027-01-15'),
      processoSPD: '9059/2023',
      area: 'TURISMO',
      secretariaId: secCultura.id,
      orgaoId: orgaoTurismo.id,
      programaId: progTurismo.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 4. EM_EXECUCAO — Com contratos, medições e pendências
  // ──────────────────────────────────────────────────────────
  console.log('🔨 [EM_EXECUCAO] Convênios em execução...');

  // 4a. Revitalização do Museu (60% executado, com medições)
  const convExec1 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2021-003' },
    update: {},
    create: {
      codigo: 'CV-2021-003',
      titulo: 'Revitalização do Prédio da Biblioteca para Museu',
      objeto: 'Revitalização do prédio histórico da Biblioteca Municipal para instalação do Museu Municipal.',
      status: 'EM_EXECUCAO',
      numeroProposta: '017413/2021',
      numeroTermo: 'TC 128/2021',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 649749.83,
      valorRepasse: 615073.96,
      valorContrapartida: 34675.87,
      dataAssinatura: d('2021-12-28'),
      dataInicioVigencia: d('2021-12-28'),
      dataFimVigencia: d('2026-12-28'),
      processoSPD: '5912/2021',
      processoCreditoAdicional: '9771/2022',
      area: 'CULTURA',
      secretariaId: secCultura.id,
      orgaoId: orgaoTurismo.id,
      programaId: progTurismo.id,
      fonteId: fonteVoluntaria.id,
    },
  });

  // Emendas
  await prisma.emendaParlamentar.upsert({
    where: { id: 'emenda-exec1' },
    update: {},
    create: {
      id: 'emenda-exec1',
      nomeParlamentar: 'Dep. Vitor Lippi',
      partido: 'PSDB',
      codigoEmenda: '2021.035.40120',
      valorIndicado: 615073.96,
      anoEmenda: 2021,
      convenioId: convExec1.id,
    },
  });

  // Financeiro
  await prisma.financeiroContas.upsert({
    where: { convenioId: convExec1.id },
    update: {},
    create: {
      banco: 'Caixa Econômica Federal',
      agencia: '0296',
      contaBancaria: '31122-7',
      valorLiberadoTotal: 307536.98,
      saldoRendimentos: 1523.45,
      codigoReceita: '1.7.1.8.01.1.1.00.00.00',
      dataDeposito: d('2022-12-15'),
      convenioId: convExec1.id,
    },
  });

  // Contrato de execução
  const contratoExec1 = await prisma.contratoExecucao.upsert({
    where: { id: 'cont-exec1' },
    update: {},
    create: {
      id: 'cont-exec1',
      numProcessoLicitatorio: '9776/2021',
      modalidadeLicitacao: 'TOMADA_PRECOS',
      numeroContrato: '071/2022',
      contratadaCnpj: '12.345.678/0001-90',
      contratadaNome: 'DCA Engenharia e Construções Eireli',
      dataAssinatura: d('2022-07-15'),
      dataVigenciaInicio: d('2022-07-15'),
      dataVigenciaFim: d('2024-03-15'),
      valorContrato: 675296.76,
      valorExecutado: 405178.06,
      engenheiroResponsavel: 'Eng. Fábio Mendonça',
      creaEngenheiro: 'CREA-SP 5012345678',
      cno: '90.013.14269/76',
      situacao: 'Em execução',
      prazoExecucaoDias: 180,
      convenioId: convExec1.id,
    },
  });

  // Medições do contrato
  await prisma.medicao.createMany({
    skipDuplicates: true,
    data: [
      { id: 'med-1a', numeroMedicao: 1, dataMedicao: d('2023-02-10'), percentualFisico: 15.5, valorMedido: 101319.51, dataPagamento: d('2023-03-01'), valorPago: 101319.51, situacao: 'Paga', processoMedicao: '7939/2022', contratoId: contratoExec1.id },
      { id: 'med-1b', numeroMedicao: 2, dataMedicao: d('2023-06-20'), percentualFisico: 35.0, valorMedido: 131624.72, dataPagamento: d('2023-07-15'), valorPago: 131624.72, situacao: 'Paga', processoMedicao: '2145/2023', contratoId: contratoExec1.id },
      { id: 'med-1c', numeroMedicao: 3, dataMedicao: d('2024-01-10'), percentualFisico: 60.0, valorMedido: 172233.83, valorPago: 73749.90, situacao: 'Parcialmente paga', processoMedicao: '8821/2023', contratoId: contratoExec1.id },
    ],
  });

  // Aditivo de prazo
  await prisma.aditivo.upsert({
    where: { id: 'adit-exec1' },
    update: {},
    create: {
      id: 'adit-exec1',
      numeroAditivo: 1,
      tipoAditivo: 'PRAZO',
      dataAssinatura: d('2023-07-01'),
      novaVigencia: d('2024-03-15'),
      motivo: 'Atraso por condições climáticas adversas',
      justificativa: 'Chuvas intensas impediram a execução da etapa de coberturas.',
      convenioId: convExec1.id,
      contratoId: contratoExec1.id,
    },
  });

  // Pendências
  await prisma.pendencia.upsert({
    where: { id: 'pend-exec1a' },
    update: {},
    create: {
      id: 'pend-exec1a',
      descricao: 'Aguardando vistoria do órgão concedente para liberação da 2ª parcela.',
      responsavel: 'Eng. Fábio Mendonça',
      prazo: daysFromNow(15),
      status: 'EM_ANDAMENTO',
      prioridade: 2,
      orgaoResponsavel: 'SECULT / DADETUR',
      convenioId: convExec1.id,
    },
  });

  await prisma.pendencia.upsert({
    where: { id: 'pend-exec1b' },
    update: {},
    create: {
      id: 'pend-exec1b',
      descricao: 'Parecer jurídico sobre aditivo de valor pendente.',
      responsavel: 'Assessoria Jurídica',
      prazo: daysFromNow(-5), // atrasada!
      status: 'ABERTA',
      prioridade: 1,
      orgaoResponsavel: 'SENJ',
      convenioId: convExec1.id,
    },
  });

  // Fichas orçamentárias
  await prisma.fichaOrcamentaria.upsert({
    where: { id: 'ficha-exec1-rp' },
    update: {},
    create: {
      id: 'ficha-exec1-rp',
      numero: '1823',
      tipo: 'REPASSE',
      descricao: 'Ficha de repasse estadual - Museu',
      valor: 456206.10,
      convenioId: convExec1.id,
    },
  });

  // Notas de empenho
  await prisma.notaEmpenho.createMany({
    skipDuplicates: true,
    data: [
      { id: 'ne-exec1-1', numero: 'NE 3456/2022', tipo: 'REPASSE', valor: 307536.98, dataEmissao: d('2022-12-10'), convenioId: convExec1.id },
      { id: 'ne-exec1-2', numero: 'NE 1234/2023', tipo: 'CONTRAPARTIDA', valor: 34675.87, dataEmissao: d('2023-01-15'), convenioId: convExec1.id },
    ],
  });

  // 4b. Reforma do Campo de Futebol (17% executado, em início)
  const convExec2 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2023-008' },
    update: {},
    create: {
      codigo: 'CV-2023-008',
      titulo: 'Reforma do Campo de Futebol do CERMAG',
      objeto: 'Reforma do campo de futebol do Centro Esportivo Municipal, incluindo gramado, alambrado e arquibancada.',
      status: 'EM_EXECUCAO',
      numeroProposta: '010870/2023',
      numeroTermo: 'TC 941152/2023',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      clausulaSuspensiva: true,
      valorGlobal: 550322.80,
      valorRepasse: 544562.97,
      valorContrapartida: 5759.83,
      dataAssinatura: d('2023-06-01'),
      dataInicioVigencia: d('2023-06-01'),
      dataFimVigencia: d('2026-07-01'),
      processoSPD: '3410/2023',
      area: 'ESPORTE',
      secretariaId: secEsporte.id,
      orgaoId: orgaoEsporte.id,
      programaId: progEsporte.id,
      fonteId: fonteEmenda.id,
    },
  });

  // Emenda do campo
  await prisma.emendaParlamentar.upsert({
    where: { id: 'emenda-exec2' },
    update: {},
    create: {
      id: 'emenda-exec2',
      nomeParlamentar: 'Dep. Jefferson Campos',
      partido: 'PL',
      codigoEmenda: '202315810009',
      funcao: '27 - Desporto e lazer',
      subfuncao: '812 - Desporto comunitário',
      valorIndicado: 544562.97,
      anoEmenda: 2023,
      convenioId: convExec2.id,
    },
  });

  // Contrato do campo
  const contratoExec2 = await prisma.contratoExecucao.upsert({
    where: { id: 'cont-exec2' },
    update: {},
    create: {
      id: 'cont-exec2',
      numProcessoLicitatorio: '790/2024',
      modalidadeLicitacao: 'CONCORRENCIA',
      numeroContrato: '010/2025',
      contratadaCnpj: '98.765.432/0001-10',
      contratadaNome: 'DCA Engenharia e Construções Eireli',
      dataAssinatura: d('2025-02-01'),
      dataVigenciaInicio: d('2025-02-01'),
      dataVigenciaFim: d('2026-02-01'),
      valorContrato: 753948.26,
      engenheiroResponsavel: 'Eng. Adilson Pereira',
      creaEngenheiro: 'CREA-SP 5098765432',
      cno: '90.025.22966/73',
      situacao: 'Em execução',
      prazoExecucaoDias: 90,
      convenioId: convExec2.id,
    },
  });

  await prisma.medicao.upsert({
    where: { id: 'med-2a' },
    update: {},
    create: {
      id: 'med-2a',
      numeroMedicao: 1,
      dataMedicao: d('2025-01-20'),
      percentualFisico: 16.86,
      valorMedido: 127115.67,
      situacao: 'Em análise',
      processoMedicao: '213/2025',
      contratoId: contratoExec2.id,
    },
  });

  await prisma.pendencia.upsert({
    where: { id: 'pend-exec2' },
    update: {},
    create: {
      id: 'pend-exec2',
      descricao: 'Aguardando autorização do ordenador de despesa para pagamento.',
      responsavel: 'Secretaria de Finanças',
      prazo: daysFromNow(7),
      status: 'ABERTA',
      prioridade: 1,
      orgaoResponsavel: 'SEF',
      convenioId: convExec2.id,
    },
  });

  // 4c. Construção da Creche (recém iniciado, valor alto)
  const convExec3 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2023-012' },
    update: {},
    create: {
      codigo: 'CV-2023-012',
      titulo: 'Construção de Creche no Parque Santa Márcia',
      objeto: 'Construção de creche e escola de educação infantil no Parque Santa Márcia com capacidade para 200 alunos.',
      status: 'EM_EXECUCAO',
      numeroProposta: '26298009394/2023',
      numeroTermo: 'TC 962647/2024',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      clausulaSuspensiva: true,
      valorGlobal: 5795840.60,
      valorRepasse: 5737882.19,
      valorContrapartida: 57958.41,
      dataAssinatura: d('2024-08-15'),
      dataInicioVigencia: d('2024-08-15'),
      dataFimVigencia: d('2028-08-15'),
      processoSPD: '9558/2023',
      processoCreditoAdicional: '1064/2024',
      area: 'EDUCAÇÃO',
      secretariaId: secEducacao.id,
      orgaoId: orgaoFNDE.id,
      programaId: progCreche.id,
      fonteId: fontePAC.id,
    },
  });

  await prisma.contratoExecucao.upsert({
    where: { id: 'cont-exec3' },
    update: {},
    create: {
      id: 'cont-exec3',
      numProcessoLicitatorio: '1604/2023',
      modalidadeLicitacao: 'CONCORRENCIA',
      numeroContrato: '087/2025',
      contratadaNome: 'Hype Construtora Ltda.',
      contratadaCnpj: '55.123.456/0001-78',
      valorContrato: 5026580.90,
      situacao: 'Aguardando OIS',
      prazoExecucaoDias: 360,
      convenioId: convExec3.id,
    },
  });

  await prisma.pendencia.createMany({
    skipDuplicates: true,
    data: [
      { id: 'pend-exec3a', descricao: 'Aguardando VRPL pela GIGOV/FNDE.', responsavel: 'GIGOV', prazo: daysFromNow(30), status: 'ABERTA', prioridade: 1, orgaoResponsavel: 'GIGOV', convenioId: convExec3.id },
      { id: 'pend-exec3b', descricao: 'Regularização da propriedade da área.', responsavel: 'Procuradoria', prazo: daysFromNow(60), status: 'ABERTA', prioridade: 2, orgaoResponsavel: 'SENJ/SEED', convenioId: convExec3.id },
      { id: 'pend-exec3c', descricao: 'Projeto de infraestrutura do entorno.', responsavel: 'Eng. Aline', prazo: daysFromNow(45), status: 'EM_ANDAMENTO', prioridade: 3, orgaoResponsavel: 'SOURB/SEMA', convenioId: convExec3.id },
    ],
  });

  // 4d. Construção da UBS (em fase inicial)
  await prisma.convenio.upsert({
    where: { codigo: 'CV-2023-015' },
    update: {},
    create: {
      codigo: 'CV-2023-015',
      titulo: 'Construção de UBS no Bairro Vossoroca',
      objeto: 'Construção de Unidade Básica de Saúde no Bairro Vossoroca conforme projeto padrão do Ministério da Saúde.',
      status: 'EM_EXECUCAO',
      numeroProposta: '36000008434/2023',
      numeroTermo: 'INV-11209.4720001/24-002',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      valorGlobal: 2435976.95,
      valorRepasse: 2435976.95,
      valorContrapartida: 0,
      dataAssinatura: d('2025-01-10'),
      dataInicioVigencia: d('2025-01-10'),
      dataFimVigencia: d('2027-01-10'),
      area: 'SAÚDE',
      secretariaId: secSaude.id,
      orgaoId: orgaoSaude.id,
      programaId: progUBS.id,
      fonteId: fontePAC.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 5. CONCLUIDO — Sem saldo, sem pendências
  // ──────────────────────────────────────────────────────────
  console.log('🏁 [CONCLUIDO] Convênios concluídos...');

  const convConcluido = await prisma.convenio.upsert({
    where: { codigo: 'CV-2021-001' },
    update: {},
    create: {
      codigo: 'CV-2021-001',
      titulo: 'Recapeamento da Rua Victório Zanchetta',
      objeto: 'Recapeamento asfáltico da Rua Victório Zanchetta e Rua Cezina de Almeida, incluindo sinalização viária.',
      status: 'CONCLUIDO',
      numeroProposta: '031513/2021',
      numeroTermo: 'TC 916433/2021',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      valorGlobal: 249412.89,
      valorRepasse: 238856,
      valorContrapartida: 10556.89,
      dataAssinatura: d('2021-09-15'),
      dataInicioVigencia: d('2021-09-15'),
      dataFimVigencia: d('2024-12-31'),
      dataPrestacaoContas: d('2024-11-20'),
      processoSPD: '3909/2021',
      area: 'INFRAESTRUTURA',
      secretariaId: secInfra.id,
      orgaoId: orgaoCidades.id,
      programaId: progInfra.id,
      fonteId: fonteEmenda.id,
    },
  });

  await prisma.emendaParlamentar.upsert({
    where: { id: 'emenda-concl' },
    update: {},
    create: {
      id: 'emenda-concl',
      nomeParlamentar: 'Dep. Eduardo Bolsonaro / Dep. Vitor Lippi',
      partido: 'PL / PSDB',
      codigoEmenda: '202181000740',
      funcao: '15 - Urbanismo',
      subfuncao: '451 - Infra-Estrutura Urbana',
      valorIndicado: 238856,
      anoEmenda: 2021,
      convenioId: convConcluido.id,
    },
  });

  await prisma.financeiroContas.upsert({
    where: { convenioId: convConcluido.id },
    update: {},
    create: {
      banco: 'Caixa Econômica Federal',
      agencia: '0296',
      contaBancaria: '006.006647054-0',
      valorLiberadoTotal: 230338.43,
      saldoRendimentos: 0,
      dataDeposito: d('2024-07-01'),
      convenioId: convConcluido.id,
    },
  });

  const contratoConcl = await prisma.contratoExecucao.upsert({
    where: { id: 'cont-concl' },
    update: {},
    create: {
      id: 'cont-concl',
      numProcessoLicitatorio: '8528/2023',
      modalidadeLicitacao: 'CONCORRENCIA',
      numeroContrato: '032/2024',
      contratadaCnpj: '11.222.333/0001-44',
      contratadaNome: 'Nogueira Construções e Serviços Ltda',
      dataAssinatura: d('2024-04-15'),
      dataVigenciaInicio: d('2024-04-15'),
      dataVigenciaFim: d('2024-12-15'),
      dataOIS: d('2024-05-01'),
      valorContrato: 230338.43,
      valorExecutado: 230338.43,
      engenheiroResponsavel: 'Eng. Adilson Pereira',
      creaEngenheiro: 'CREA-SP 5012345679',
      situacao: 'Concluído',
      prazoExecucaoDias: 60,
      dataTerminoExecucao: d('2024-07-01'),
      convenioId: convConcluido.id,
    },
  });

  await prisma.medicao.createMany({
    skipDuplicates: true,
    data: [
      { id: 'med-c1', numeroMedicao: 1, dataMedicao: d('2024-06-01'), percentualFisico: 50, valorMedido: 115169.22, dataPagamento: d('2024-06-15'), valorPago: 115169.22, situacao: 'Paga', contratoId: contratoConcl.id },
      { id: 'med-c2', numeroMedicao: 2, dataMedicao: d('2024-07-01'), percentualFisico: 100, valorMedido: 115169.21, dataPagamento: d('2024-07-20'), valorPago: 115169.21, situacao: 'Paga', contratoId: contratoConcl.id },
    ],
  });

  await prisma.notaEmpenho.createMany({
    skipDuplicates: true,
    data: [
      { id: 'ne-concl-1', numero: 'NE 5678/2024', tipo: 'REPASSE', valor: 230338.43, dataEmissao: d('2024-04-10'), convenioId: convConcluido.id },
      { id: 'ne-concl-2', numero: 'NE 5679/2024', tipo: 'CONTRAPARTIDA', valor: 10556.89, dataEmissao: d('2024-04-10'), convenioId: convConcluido.id },
    ],
  });

  // Segundo convênio concluído
  const convConcluido2 = await prisma.convenio.upsert({
    where: { codigo: 'CV-2023-005' },
    update: {},
    create: {
      codigo: 'CV-2023-005',
      titulo: 'Pista de Caminhada na Praça do Jardim São Lucas',
      objeto: 'Construção de pista de caminhada e academia ao ar livre na praça do Jardim São Lucas.',
      status: 'CONCLUIDO',
      numeroProposta: '062307/2023',
      numeroTermo: 'TC 103279/2023',
      modalidadeRepasse: 'CONVENIO',
      esfera: 'ESTADUAL',
      valorGlobal: 117239.08,
      valorRepasse: 100000,
      valorContrapartida: 17239.08,
      dataAssinatura: d('2023-12-10'),
      dataInicioVigencia: d('2023-12-10'),
      dataFimVigencia: d('2025-12-10'),
      dataPrestacaoContas: d('2025-09-15'),
      processoSPD: '7095/2023',
      area: 'ESPORTE',
      secretariaId: secEsporte.id,
      orgaoId: orgaoSGRI.id,
      programaId: progEsporte.id,
      fonteId: fonteEmenda.id,
    },
  });

  await prisma.emendaParlamentar.upsert({
    where: { id: 'emenda-concl2' },
    update: {},
    create: {
      id: 'emenda-concl2',
      nomeParlamentar: 'Dep. Vitão do Cachorrão',
      partido: 'REPUBLICANOS',
      codigoEmenda: '2023.289.50909',
      funcao: '27 - Desporto e Lazer',
      valorIndicado: 100000,
      anoEmenda: 2023,
      convenioId: convConcluido2.id,
    },
  });

  const contratoConcl2 = await prisma.contratoExecucao.upsert({
    where: { id: 'cont-concl2' },
    update: {},
    create: {
      id: 'cont-concl2',
      numProcessoLicitatorio: '02/2024',
      modalidadeLicitacao: 'CONCORRENCIA',
      numeroContrato: '009/2025',
      contratadaNome: 'DCA Engenharia e Construções Eireli',
      dataAssinatura: d('2025-02-01'),
      dataVigenciaInicio: d('2025-02-01'),
      dataVigenciaFim: d('2026-02-01'),
      dataOIS: d('2025-02-10'),
      valorContrato: 116000,
      valorExecutado: 116000,
      engenheiroResponsavel: 'Eng. Fábio Mendonça',
      situacao: 'Concluído',
      prazoExecucaoDias: 90,
      dataTerminoExecucao: d('2025-05-10'),
      convenioId: convConcluido2.id,
    },
  });

  await prisma.medicao.upsert({
    where: { id: 'med-c2-1' },
    update: {},
    create: {
      id: 'med-c2-1',
      numeroMedicao: 1,
      dataMedicao: d('2025-05-10'),
      percentualFisico: 100,
      valorMedido: 116000,
      dataPagamento: d('2025-05-25'),
      valorPago: 116000,
      situacao: 'Paga',
      contratoId: contratoConcl2.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 6. CANCELADO
  // ──────────────────────────────────────────────────────────
  console.log('❌ [CANCELADO] Convênios cancelados...');

  await prisma.convenio.upsert({
    where: { codigo: 'CV-2022-007' },
    update: {},
    create: {
      codigo: 'CV-2022-007',
      titulo: 'Construção de Centro de Convivência do Idoso',
      objeto: 'Construção de centro de convivência para idosos no Bairro Nova Votorantim, com salas de atividades e refeitório.',
      status: 'CANCELADO',
      numeroProposta: '045678/2022',
      modalidadeRepasse: 'CONTRATO_REPASSE',
      esfera: 'FEDERAL',
      valorGlobal: 850000,
      valorRepasse: 800000,
      valorContrapartida: 50000,
      observacoes: 'Cancelado por não cumprimento da cláusula suspensiva dentro do prazo. A área destinada apresentou irregularidades registrais.',
      processoSPD: '8901/2022',
      area: 'ASSISTÊNCIA SOCIAL',
      secretariaId: secInfra.id,
      orgaoId: orgaoCidades.id,
      fonteId: fonteEmenda.id,
    },
  });

  // ──────────────────────────────────────────────────────────
  // 7. Eventos de Agenda
  // ──────────────────────────────────────────────────────────
  console.log('📅 Criando eventos de agenda...');

  await prisma.eventoAgenda.createMany({
    skipDuplicates: true,
    data: [
      { id: 'ev-1', titulo: 'Reunião com GIGOV sobre Creche', descricao: 'Discussão sobre andamento da Creche Parque Santa Márcia', tipo: 'REUNIAO', dataInicio: daysFromNow(3), local: 'Sala de Reuniões SPD', responsavel: 'Eng. Aline', convenioId: convExec3.id },
      { id: 'ev-2', titulo: 'Vencimento da vigência - LED Bairro da Chave', descricao: 'Verificar necessidade de aditivo de prazo', tipo: 'VENCIMENTO_ETAPA', dataInicio: d('2026-05-20'), responsavel: 'Eng. Roberto', convenioId: convAprovado1.id },
      { id: 'ev-3', titulo: 'Prestação de contas parcial - Museu', descricao: 'Prestação de contas parcial referente à 3ª medição', tipo: 'PRESTACAO_CONTAS', dataInicio: daysFromNow(20), responsavel: 'Eng. Fábio', convenioId: convExec1.id },
      { id: 'ev-4', titulo: 'Entrega de documentos - Centro Turismo', descricao: 'Entrega de projeto executivo ao órgão concedente', tipo: 'ENTREGA_DOCUMENTOS', dataInicio: daysFromNow(10), responsavel: 'Fernando', convenioId: convAprovado2.id },
    ],
  });

  // ──────────────────────────────────────────────────────────
  // 8. Comunicados
  // ──────────────────────────────────────────────────────────
  console.log('📨 Criando comunicados...');

  await prisma.comunicado.createMany({
    skipDuplicates: true,
    data: [
      { id: 'com-1', protocolo: 'OF-SPD-2025/001', assunto: 'Solicitação de prorrogação de vigência - Museu', conteudo: 'Solicitamos a prorrogação da vigência do Convênio TC 128/2021 por mais 12 meses.', tipo: 'SAIDA', origem: 'SPD', destino: 'Secretaria de Turismo', responsavel: 'Fernando Ribeiro' },
      { id: 'com-2', protocolo: 'OF-FNDE-2025/045', assunto: 'Aprovação do VRPL - Creche Santa Márcia', conteudo: 'Informamos a aprovação do Valor de Referência do Processo Licitatório da Creche do Parque Santa Márcia.', tipo: 'ENTRADA', origem: 'FNDE', destino: 'SPD', responsavel: 'Maria Clara Oliveira' },
      { id: 'com-3', protocolo: 'OF-SPD-2025/012', assunto: 'Encaminhamento de documentação - Campo CERMAG', conteudo: 'Encaminhamos a documentação solicitada para desbloqueio da cláusula suspensiva.', tipo: 'SAIDA', origem: 'SPD', destino: 'Caixa Econômica Federal', responsavel: 'Ana Paula dos Santos' },
    ],
  });

  // ──────────────────────────────────────────────────────────

  console.log('\n════════════════════════════════════════════');
  console.log('✅ Seed de demonstração finalizado!');
  console.log('════════════════════════════════════════════');
  console.log('📊 Resumo:');
  console.log('   • 6 Secretarias');
  console.log('   • 6 Órgãos Concedentes');
  console.log('   • 5 Programas');
  console.log('   • 3 Fontes de Recurso');
  console.log('   • 13 Convênios:');
  console.log('       - 2 RASCUNHO');
  console.log('       - 2 EM_ANALISE');
  console.log('       - 2 APROVADO');
  console.log('       - 4 EM_EXECUCAO');
  console.log('       - 2 CONCLUIDO');
  console.log('       - 1 CANCELADO');
  console.log('   • 5 Emendas Parlamentares');
  console.log('   • 4 Contratos de Execução');
  console.log('   • 6 Medições');
  console.log('   • 5 Pendências');
  console.log('   • 4 Notas de Empenho');
  console.log('   • 2 Financeiro (contas)');
  console.log('   • 4 Eventos de Agenda');
  console.log('   • 3 Comunicados');
  console.log('   • 1 Aditivo');
  console.log('   • 1 Ficha Orçamentária');
  console.log('════════════════════════════════════════════\n');
}

if (require.main === module) {
  seedConvenios()
    .catch((e: unknown) => {
      console.error('❌ Erro no seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
