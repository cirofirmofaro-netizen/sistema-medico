import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração de CORS mais segura
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:8081',
    'exp://localhost:8081',
    'http://192.168.15.14:3000',
    'http://192.168.15.14:8081'
  ];
  
  app.enableCors({ 
    origin: true, // Permitir todas as origens temporariamente
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Captura rawBody para verificação de webhook HMAC (robusto)
  app.use(urlencoded({ 
    extended: true, 
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(json({ 
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    }
  }));
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Prontuário Particular – API')
    .setDescription('Endpoints do MVP: Pacientes, Plantões, Episódios e Evoluções')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(3000, '0.0.0.0');
  console.log('API:', await app.getUrl(), 'Docs:', (await app.getUrl()) + '/docs');
}
bootstrap();
