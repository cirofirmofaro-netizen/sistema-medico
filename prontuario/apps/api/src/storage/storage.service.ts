import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { slugifyFilename } from '../shared/slug';

export interface PresignPutRequest {
  filename: string;
  contentType: string;
  size?: number;
  usuarioId?: string; // Opcional para compatibilidade
}

export interface PresignPutResponse {
  url: string;
  key: string;
  expires: number;
}

export interface PresignGetRequest {
  key: string;
  inline?: boolean;
}

export interface PresignGetResponse {
  url: string;
  expires: number;
}

export interface CopyRequest {
  sourceKey: string;
  destinationKey: string;
  contentType: string;
  sourceBucket?: string;
  destinationBucket?: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly allowedMimeTypes: string[];
  private readonly maxUploadBytes: number;

  constructor() {
    this.s3Client = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.S3_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.allowedMimeTypes = env.MIME_WHITELIST.split(',').map(type => type.trim());
    this.maxUploadBytes = env.MAX_UPLOAD_MB * 1024 * 1024;
  }

  /**
   * Obtém o usuarioId do contexto atual
   */
  private getCurrentUsuarioId(): string | null {
    return (global as any).currentRequest?.usuarioId || null;
  }

  /**
   * Valida arquivo antes do upload
   */
  private validateFile(filename: string, contentType: string, size?: number): void {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Filename é obrigatório e deve ser uma string');
    }
    
    if (!contentType || typeof contentType !== 'string') {
      throw new Error('ContentType é obrigatório e deve ser uma string');
    }

    if (!this.allowedMimeTypes.includes(contentType)) {
      throw new Error(`Tipo de arquivo não permitido: ${contentType}. Permitidos: ${this.allowedMimeTypes.join(', ')}`);
    }

    if (size && (size <= 0 || size > this.maxUploadBytes)) {
      throw new Error(`Tamanho inválido. Máximo permitido: ${env.MAX_UPLOAD_MB}MB`);
    }
  }

  /**
   * Gera chave única para storage com prefixo de usuário
   */
  private generateStorageKey(filename: string, prefix: string = 'anexos', usuarioId?: string): string {
    const currentUsuarioId = usuarioId || this.getCurrentUsuarioId();
    
    if (!currentUsuarioId) {
      throw new Error('UsuarioId é obrigatório para gerar chave de storage');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const slug = slugifyFilename(filename);
    
    return `user/${currentUsuarioId}/${prefix}/${year}/${month}/${day}/${uuid}-${slug}`;
  }

  /**
   * Gera chave específica para diferentes tipos de documento
   */
  private generateSpecificKey(filename: string, tipo: string, usuarioId?: string): string {
    const currentUsuarioId = usuarioId || this.getCurrentUsuarioId();
    
    if (!currentUsuarioId) {
      throw new Error('UsuarioId é obrigatório para gerar chave de storage');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const slug = slugifyFilename(filename);
    
    switch (tipo) {
      case 'ir':
        return `user/${currentUsuarioId}/ir/${year}/${uuid}.pdf`;
      case 'nf':
        return `user/${currentUsuarioId}/nfs/${year}/${month}/${uuid}.pdf`;
      case 'documento':
        return `user/${currentUsuarioId}/documentos/${year}/${month}/${uuid}-${slug}`;
      case 'temp':
        return `user/${currentUsuarioId}/temp/${uuid}-${slug}`;
      default:
        return this.generateStorageKey(filename, tipo, currentUsuarioId);
    }
  }

  /**
   * Gera URL assinada para PUT (upload)
   */
  async getPresignedPutUrl(request: PresignPutRequest, bucket?: string): Promise<PresignPutResponse> {
    const { filename, contentType, size, usuarioId } = request;

    this.validateFile(filename, contentType, size);

    const targetBucket = bucket || env.S3_BUCKET;
    const key = this.generateStorageKey(filename, 'anexos', usuarioId);

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url,
      key,
      expires: Date.now() + 3600 * 1000,
    };
  }

  /**
   * Gera URL assinada para PUT com tipo específico
   */
  async getPresignedPutUrlForType(
    request: PresignPutRequest & { tipo: string }, 
    bucket?: string
  ): Promise<PresignPutResponse> {
    const { filename, contentType, size, tipo, usuarioId } = request;

    this.validateFile(filename, contentType, size);

    const targetBucket = bucket || env.S3_BUCKET;
    const key = this.generateSpecificKey(filename, tipo, usuarioId);

    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

    return {
      url,
      key,
      expires: Date.now() + 3600 * 1000,
    };
  }

  /**
   * Gera URL assinada para GET (download/visualização)
   */
  async getPresignedGetUrl(request: PresignGetRequest, bucket?: string): Promise<PresignGetResponse> {
    const { key, inline = false } = request;
    const targetBucket = bucket || env.S3_BUCKET;
    const expiresIn = bucket === env.UPLOAD_TEMP_BUCKET ? env.PRESIGN_EXPIRES_SECONDS_TEMP : env.PRESIGN_EXPIRES_SECONDS;

    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ...(inline && { ResponseContentDisposition: 'inline' }),
    });

    const url = await getSignedUrl(this.s3Client, getCommand, {
      expiresIn,
    });

    return {
      url,
      expires: expiresIn,
    };
  }

  /**
   * Copia objeto de bucket temporário para definitivo
   */
  async copyFromTempToFinal(request: CopyRequest): Promise<void> {
    const { sourceKey, destinationKey, contentType, sourceBucket = env.UPLOAD_TEMP_BUCKET, destinationBucket = env.S3_BUCKET } = request;

    const copyCommand = new CopyObjectCommand({
      Bucket: destinationBucket,
      Key: destinationKey,
      CopySource: `${sourceBucket}/${sourceKey}`,
      ContentType: contentType,
      ContentDisposition: 'inline',
      MetadataDirective: 'REPLACE',
    });

    await this.s3Client.send(copyCommand);
    this.logger.log(`Objeto copiado: ${sourceBucket}/${sourceKey} → ${destinationBucket}/${destinationKey}`);
  }

  /**
   * Deleta objeto do storage
   */
  async deleteObject(key: string, bucket?: string): Promise<void> {
    const targetBucket = bucket || env.S3_BUCKET;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    await this.s3Client.send(deleteCommand);
    this.logger.log(`Objeto deletado: ${targetBucket}/${key}`);
  }

  /**
   * Verifica se objeto existe
   */
  async objectExists(key: string, bucket?: string): Promise<boolean> {
    const targetBucket = bucket || env.S3_BUCKET;

    try {
      const headCommand = new GetObjectCommand({
        Bucket: targetBucket,
        Key: key,
      });

      await this.s3Client.send(headCommand);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Gera URL assinada para PUT temporário
   */
  async getPresignedPutUrlTemp(request: PresignPutRequest): Promise<PresignPutResponse> {
    return this.getPresignedPutUrl(request, env.UPLOAD_TEMP_BUCKET);
  }

  /**
   * Gera URL assinada para GET temporário
   */
  async getPresignedGetUrlTemp(key: string, inline: boolean = true): Promise<PresignGetResponse> {
    return this.getPresignedGetUrl({ key, inline }, env.UPLOAD_TEMP_BUCKET);
  }

  /**
   * Deleta objeto temporário
   */
  async deleteTemp(key: string): Promise<void> {
    return this.deleteObject(key, env.UPLOAD_TEMP_BUCKET);
  }

  /**
   * Copia do temporário para definitivo
   */
  async copyFromTempToFinalSimple(keyTemp: string, contentType: string): Promise<string> {
    const destinationKey = this.generateStorageKey(`committed-${Date.now()}.tmp`);
    
    await this.copyFromTempToFinal({
      sourceKey: keyTemp,
      destinationKey,
      contentType,
    });

    return destinationKey;
  }

  /**
   * Obtém arquivo como Buffer
   */
  async getFile(key: string, bucket?: string): Promise<Buffer> {
    const targetBucket = bucket || env.S3_BUCKET;

    const getCommand = new GetObjectCommand({
      Bucket: targetBucket,
      Key: key,
    });

    const response = await this.s3Client.send(getCommand);
    
    if (!response.Body) {
      throw new Error(`Arquivo não encontrado: ${targetBucket}/${key}`);
    }

    // Converter stream para buffer
    const chunks: Uint8Array[] = [];
    const stream = response.Body as any;
    
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
