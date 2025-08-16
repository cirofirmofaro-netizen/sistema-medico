import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usuariosService: UsuariosService,
  ) {
    // Fallback para desenvolvimento
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'sua-chave-secreta-super-segura-aqui';
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const usuario = await this.usuariosService.findById(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    // Converter o tipo string para o enum UserRole
    let role: 'ADMIN' | 'MEDICO' | 'ENFERMEIRO' | 'RECEPCIONISTA';
    switch (usuario.tipo) {
      case 'admin':
        role = 'ADMIN';
        break;
      case 'medico':
        role = 'MEDICO';
        break;
      case 'enfermeiro':
        role = 'ENFERMEIRO';
        break;
      case 'recepcionista':
        role = 'RECEPCIONISTA';
        break;
      default:
        role = 'MEDICO'; // fallback
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      role: role,
      nome: payload.nome,
    };
  }
}
