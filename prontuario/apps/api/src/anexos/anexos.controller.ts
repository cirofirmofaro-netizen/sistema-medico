import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { AnexosService } from './anexos.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PresignTempDto, CommitTempDto } from './dto/upload-review.dto';

export class PresignPutDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}

@ApiTags('anexos')
@ApiBearerAuth()
@Controller('anexos')
@UseGuards(JwtAuthGuard)
export class AnexosController {
  constructor(
    private readonly anexosService: AnexosService,
    private readonly storageService: StorageService,
  ) {}

  // ===== ENDPOINTS DE UPLOAD COM REVISÃO =====

  @UseGuards(JwtAuthGuard)
  @Post('presign-temp')
  @ApiOperation({ summary: 'Gerar URL assinada para upload temporário' })
  @ApiResponse({ status: 200, description: 'URL de upload temporário gerada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async presignTemp(@Body() data: PresignTempDto) {
    return this.storageService.getPresignedPutUrlTemp({
      filename: data.filename,
      contentType: data.contentType,
      size: data.size,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('temp/presign')
  @ApiOperation({ summary: 'Gerar URL assinada para visualização de arquivo temporário' })
  @ApiResponse({ status: 200, description: 'URL de visualização gerada com sucesso' })
  @ApiResponse({ status: 400, description: 'Chave inválida' })
  async presignTempGet(@Query('key') key: string, @Query('inline') inline: string = 'true') {
    if (!key) {
      throw new Error('Parâmetro "key" é obrigatório');
    }
    return this.storageService.getPresignedGetUrlTemp(key, inline === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('temp/:key')
  @ApiOperation({ summary: 'Deletar arquivo temporário' })
  @ApiResponse({ status: 204, description: 'Arquivo temporário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async deleteTemp(@Param('key') key: string) {
    await this.storageService.deleteTemp(key);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('commit')
  @ApiOperation({ summary: 'Confirmar upload temporário e mover para definitivo' })
  @ApiResponse({ status: 200, description: 'Upload confirmado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Arquivo temporário não encontrado' })
  async commitTemp(@Body() data: CommitTempDto) {
    return this.anexosService.commitTemp(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-proxy')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload proxy para contornar CORS' })
  @ApiResponse({ status: 200, description: 'Upload realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async uploadProxy(
    @UploadedFile() file: any,
    @Body('url') url: string,
  ) {
    try {
      console.log('Upload proxy - Received request');
      console.log('Upload proxy - File:', file ? 'present' : 'missing');
      console.log('Upload proxy - URL:', url);
      
      if (!file || !url) {
        throw new Error('Arquivo e URL são obrigatórios');
      }
      
      console.log('Upload proxy - File details:', {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      });
      
      // Fazer upload para a URL assinada usando fetch
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.mimetype,
        },
        body: file.buffer,
      });

      console.log('Upload proxy - Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Upload proxy error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-proxy-test')
  @ApiOperation({ summary: 'Teste do upload proxy' })
  @ApiResponse({ status: 200, description: 'Teste realizado com sucesso' })
  async uploadProxyTest(@Body() data: any) {
    try {
      console.log('Upload proxy test - Received data:', data);
      return { success: true, message: 'Test endpoint working' };
    } catch (error) {
      console.error('Upload proxy test error:', error);
      throw error;
    }
  }

  // ===== ENDPOINTS LEGADOS =====

  @UseGuards(JwtAuthGuard)
  @Post('presign')
  @ApiOperation({ summary: 'Gerar URL assinada para upload de arquivo' })
  @ApiResponse({ status: 200, description: 'URL de upload gerada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async presign(@Body() data: PresignPutDto) {
    return this.storageService.getPresignedPutUrl({
      filename: data.filename,
      contentType: data.contentType,
      size: data.size,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('presign')
  @ApiOperation({ summary: 'Gerar URL assinada para download de arquivo' })
  @ApiResponse({ status: 200, description: 'URL de download gerada com sucesso' })
  @ApiResponse({ status: 400, description: 'Chave inválida' })
  async presignDownload(@Query('key') key: string) {
    if (!key) {
      throw new Error('Parâmetro "key" é obrigatório');
    }
    return this.storageService.getPresignedGetUrl({ key });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':key')
  @ApiOperation({ summary: 'Deletar arquivo do storage' })
  @ApiResponse({ status: 204, description: 'Arquivo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Arquivo não encontrado' })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteObject(key);
    return { success: true };
  }

  // Endpoints legados para compatibilidade
  @UseGuards(JwtAuthGuard)
  @Post('presign/:atendimentoId')
  @ApiOperation({ summary: 'Gerar URL assinada para upload (legado)' })
  async presignLegacy(
    @Param('atendimentoId') atendimentoId: string,
    @Body() data: { filename: string; mimeType: string; size: number }
  ) {
    return this.storageService.getPresignedPutUrl({
      filename: data.filename,
      contentType: data.mimeType,
      size: data.size,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalize/:atendimentoId')
  @ApiOperation({ summary: 'Finalizar upload (legado)' })
  async finalizeLegacy(
    @Param('atendimentoId') atendimentoId: string,
    @Body() data: { filename: string; mimeType: string; size: number; storageKey: string; urlPublica?: string; titulo?: string; tipoDocumento?: string }
  ) {
    return this.anexosService.finalize(atendimentoId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('por-atendimento/:atendimentoId')
  @ApiOperation({ summary: 'Listar anexos por atendimento' })
  async listByAtendimento(@Param('atendimentoId') atendimentoId: string) {
    return this.anexosService.listByAtendimento(atendimentoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('download/:anexoId')
  @ApiOperation({ summary: 'Gerar URL de download por ID (legado)' })
  async presignDownloadLegacy(@Param('anexoId') anexoId: string) {
    return this.anexosService.presignDownload(anexoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':anexoId')
  @ApiOperation({ summary: 'Obter anexo por ID' })
  async get(@Param('anexoId') anexoId: string) {
    return this.anexosService.get(anexoId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('anexo/:anexoId')
  @ApiOperation({ summary: 'Deletar anexo por ID (legado)' })
  async deleteLegacy(@Param('anexoId') anexoId: string) {
    return this.anexosService.delete(anexoId);
  }
}
