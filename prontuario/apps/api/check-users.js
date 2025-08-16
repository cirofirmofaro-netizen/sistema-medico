const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.usuario.findMany();
    console.log('Usuários encontrados:', users.length);
    users.forEach(user => {
      console.log(`- ${user.nome} (${user.email}) - Tipo: ${user.tipo}`);
    });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
