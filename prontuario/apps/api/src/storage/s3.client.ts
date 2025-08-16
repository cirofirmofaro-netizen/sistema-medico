import { S3Client } from '@aws-sdk/client-s3';
import { env } from '../config/env';

export function createS3Client(): S3Client {
  const config: any = {
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  };

  if (env.S3_ENDPOINT) {
    config.endpoint = env.S3_ENDPOINT;
  }

  return new S3Client(config);
}

export const s3Client = createS3Client();

export const bucketConfig = {
  bucket: env.S3_BUCKET,
  region: env.AWS_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
};
