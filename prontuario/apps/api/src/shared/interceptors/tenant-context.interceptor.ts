import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant-context';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    nome: string;
    tipo: string;
  };
}

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const controller = context.getClass();

    // Ignorar rotas de autenticação
    if (controller.name === 'AuthController' || 
        request.url?.startsWith('/auth/') ||
        request.url === '/auth') {
      console.log('🔒 Auth route detected, skipping tenant context');
      return next.handle();
    }

    // Extrair usuarioId do JWT token
    const usuarioId = request.user?.id;

    console.log('🔍 Interceptor - UsuarioId:', usuarioId, 'User:', request.user, 'URL:', request.url);

    if (usuarioId) {
      // Usar AsyncLocalStorage para definir o contexto
      return TenantContext.run(usuarioId, () => {
        console.log('✅ TenantContext set for usuarioId:', usuarioId);
        return next.handle();
      });
    } else {
      console.log('⚠️  No user found in request, skipping tenant context');
      return next.handle();
    }
  }
}
