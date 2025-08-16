import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Limpando dados...');
  await prisma.pagamento.deleteMany();
  await prisma.plantao.deleteMany();
  await prisma.modeloPlantao.deleteMany();
  await prisma.fontePagadora.deleteMany();
  await prisma.evolucao.deleteMany().catch(()=>{});
  await prisma.episodio.deleteMany().catch(()=>{});
  await prisma.consulta?.deleteMany?.().catch(()=>{});
  await prisma.paciente.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('>> Criando usuários de teste...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Usuário 1 - Dr. João Silva
  const usuario1 = await prisma.usuario.create({
    data: {
      nome: 'Dr. João Silva',
      email: 'joao@exemplo.com',
      senha: hashedPassword,
      tipo: 'medico',
    },
  });

  // Usuário 2 - Dra. Maria Santos
  const usuario2 = await prisma.usuario.create({
    data: {
      nome: 'Dra. Maria Santos',
      email: 'maria@exemplo.com',
      senha: hashedPassword,
      tipo: 'medico',
    },
  });

  console.log('>> Criando pacientes do Dr. João...');
  const ana = await prisma.paciente.create({
    data: {
      usuarioId: usuario1.id,
      nome: 'Ana Silva',
      dtNasc: new Date('1990-05-20'),
      telefone: '11999999999',
      email: 'ana@ex.com',
    },
  });
  const bruno = await prisma.paciente.create({
    data: {
      usuarioId: usuario1.id,
      nome: 'Bruno Costa',
      dtNasc: new Date('1985-09-12'),
      telefone: '21988887777',
      email: 'bruno@ex.com',
    },
  });

  console.log('>> Criando pacientes da Dra. Maria...');
  const carlos = await prisma.paciente.create({
    data: {
      usuarioId: usuario2.id,
      nome: 'Carlos Oliveira',
      dtNasc: new Date('1978-03-15'),
      telefone: '31977776666',
      email: 'carlos@ex.com',
    },
  });
  const daniela = await prisma.paciente.create({
    data: {
      usuarioId: usuario2.id,
      nome: 'Daniela Lima',
      dtNasc: new Date('1992-11-08'),
      telefone: '41966665555',
      email: 'daniela@ex.com',
    },
  });

  console.log('>> Criando fontes pagadoras do Dr. João...');
  const fonte1 = await prisma.fontePagadora.create({
    data: {
      usuarioId: usuario1.id,
      nome: 'Hospital Alfa',
      cnpj: '12.345.678/0001-90',
      tipoVinculo: 'CLT',
      contatoEmail: 'rh@hospitalalfa.com',
      contatoFone: '11999999999',
    },
  });

  const fonte2 = await prisma.fontePagadora.create({
    data: {
      usuarioId: usuario1.id,
      nome: 'Coop Médica',
      cnpj: '98.765.432/0001-10',
      tipoVinculo: 'COOPERATIVA',
      contatoEmail: 'admin@coopmedica.com',
      contatoFone: '21988887777',
    },
  });

  console.log('>> Criando fontes pagadoras da Dra. Maria...');
  const fonte3 = await prisma.fontePagadora.create({
    data: {
      usuarioId: usuario2.id,
      nome: 'Hospital Beta',
      cnpj: '11.222.333/0001-44',
      tipoVinculo: 'PJ',
      contatoEmail: 'rh@hospitalbeta.com',
      contatoFone: '31977776666',
    },
  });

  console.log('>> Criando modelos de plantão do Dr. João...');
  const modelo1 = await prisma.modeloPlantao.create({
    data: {
      usuarioId: usuario1.id,
      fontePagadoraId: fonte1.id,
      local: 'UTI - Hospital Alfa',
      descricao: 'Plantão de UTI',
      inicioPadrao: '19:00',
      fimPadrao: '07:00',
      duracaoMin: 720,
      valorPrevisto: 1800,
      tipoVinculo: 'CLT',
      pagador: 'HOSPITAL',
      fixo: true,
      recorrencia: {
        freq: 'WEEKLY',
        byWeekday: [1, 3, 5], // Segunda, quarta, sexta
        interval: 1,
      },
    },
  });

  console.log('>> Criando modelos de plantão da Dra. Maria...');
  const modelo2 = await prisma.modeloPlantao.create({
    data: {
      usuarioId: usuario2.id,
      fontePagadoraId: fonte3.id,
      local: 'Emergência - Hospital Beta',
      descricao: 'Plantão de Emergência',
      inicioPadrao: '08:00',
      fimPadrao: '18:00',
      duracaoMin: 600,
      valorPrevisto: 1500,
      tipoVinculo: 'PJ',
      pagador: 'HOSPITAL',
      fixo: false,
      recorrencia: {
        freq: 'WEEKLY',
        byWeekday: [0, 6], // Domingo e sábado
        interval: 1,
      },
    },
  });

  console.log('>> Criando plantões do Dr. João...');
  const p1 = await prisma.plantao.create({
    data: {
      usuarioId: usuario1.id,
      modeloId: modelo1.id,
      fontePagadoraId: fonte1.id,
      data: new Date('2025-08-15'),
      inicio: new Date('2025-08-15T19:00:00Z'),
      fim: new Date('2025-08-16T07:00:00Z'),
      local: 'UTI - Hospital Alfa',
      cnpj: fonte1.cnpj,
      valorPrevisto: 1800,
      tipoVinculo: 'CLT',
      status: 'REALIZADO',
    },
  });

  const p2 = await prisma.plantao.create({
    data: {
      usuarioId: usuario1.id,
      modeloId: modelo1.id,
      fontePagadoraId: fonte1.id,
      data: new Date('2025-08-17'),
      inicio: new Date('2025-08-17T19:00:00Z'),
      fim: new Date('2025-08-18T07:00:00Z'),
      local: 'UTI - Hospital Alfa',
      cnpj: fonte1.cnpj,
      valorPrevisto: 1800,
      tipoVinculo: 'CLT',
      status: 'AGENDADO',
    },
  });

  console.log('>> Criando plantões da Dra. Maria...');
  const p3 = await prisma.plantao.create({
    data: {
      usuarioId: usuario2.id,
      modeloId: modelo2.id,
      fontePagadoraId: fonte3.id,
      data: new Date('2025-08-16'),
      inicio: new Date('2025-08-16T08:00:00Z'),
      fim: new Date('2025-08-16T18:00:00Z'),
      local: 'Emergência - Hospital Beta',
      cnpj: fonte3.cnpj,
      valorPrevisto: 1500,
      tipoVinculo: 'PJ',
      status: 'REALIZADO',
    },
  });

  console.log('>> Criando pagamentos do Dr. João...');
  await prisma.pagamento.create({
    data: {
      usuarioId: usuario1.id,
      plantaoId: p1.id,
      fontePagadoraId: fonte1.id,
      competencia: '2025-08',
      valorPrevisto: 1800,
      valorPago: 1800,
      dataPagamento: new Date('2025-08-20'),
      status: 'PAGO',
      meio: 'HOSPITAL',
    },
  });

  console.log('>> Criando pagamentos da Dra. Maria...');
  await prisma.pagamento.create({
    data: {
      usuarioId: usuario2.id,
      plantaoId: p3.id,
      fontePagadoraId: fonte3.id,
      competencia: '2025-08',
      valorPrevisto: 1500,
      valorPago: 1500,
      dataPagamento: new Date('2025-08-18'),
      status: 'PAGO',
      meio: 'HOSPITAL',
    },
  });

  console.log('>> Criando informes de rendimento...');
  await prisma.informeRendimento.create({
    data: {
      usuarioId: usuario1.id,
      anoRef: 2024,
      fontePagadoraId: fonte1.id,
      status: 'PENDENTE',
    },
  });

  await prisma.informeRendimento.create({
    data: {
      usuarioId: usuario2.id,
      anoRef: 2024,
      fontePagadoraId: fonte3.id,
      status: 'PENDENTE',
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Credenciais de teste:');
  console.log('👨‍⚕️ Dr. João Silva: joao@exemplo.com / 123456');
  console.log('👩‍⚕️ Dra. Maria Santos: maria@exemplo.com / 123456');
  console.log('');
  console.log('🔒 Cada usuário tem seus próprios dados isolados:');
  console.log('   - Pacientes');
  console.log('   - Fontes pagadoras');
  console.log('   - Modelos de plantão');
  console.log('   - Plantões');
  console.log('   - Pagamentos');
  console.log('   - Informes de rendimento');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
