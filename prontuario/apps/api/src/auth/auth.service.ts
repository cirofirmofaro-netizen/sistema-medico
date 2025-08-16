import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, senha: string): Promise<any> {
    const usuario = await this.usuariosService.findByEmail(email);
    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
      const { senha, ...result } = usuario;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.validateUser(loginDto.email, loginDto.senha);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { 
      email: usuario.email, 
      sub: usuario.id, 
      tipo: usuario.tipo,
      nome: usuario.nome 
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const usuario = await this.usuariosService.create(registerDto);
    
    const payload = { 
      email: usuario.email, 
      sub: usuario.id, 
      tipo: usuario.tipo,
      nome: usuario.nome 
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    };
  }
}
