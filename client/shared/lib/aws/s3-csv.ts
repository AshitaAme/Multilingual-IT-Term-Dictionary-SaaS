import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { stringify } from 'csv-stringify/sync';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

interface S3CsvConfig {
  bucket: string;
  client: S3Client;
}

function createS3CsvConfig(): S3CsvConfig {
  return {
    bucket: getRequiredEnv('AWS_S3_BUCKET_NAME'),
    client: new S3Client({ region: getRequiredEnv('AWS_REGION') }),
  };
}

let config: S3CsvConfig | null = null;
function getConfig(): S3CsvConfig {
  config ??= createS3CsvConfig();
  return config;
}

export async function uploadCsvToS3<T extends object>(
  key: string,
  rows: T[],
): Promise<void> {
  if (!key) throw new Error('S3 key must not be empty');
  if (rows.length === 0) throw new Error(`No rows to upload for key: ${key}`);

  const { bucket, client } = getConfig();

  const csv = stringify(rows, {
    header: true,
    cast: {
      boolean: String,
      object: (value) => (value == null ? '' : JSON.stringify(value)),
    },
  });

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: csv,
        ContentType: 'text/csv',
      }),
    );
  } catch (err) {
    throw new Error(`Failed to upload CSV to s3://${bucket}/${key}`, {
      cause: err,
    });
  }
}

export async function deleteCsvFromS3(key: string): Promise<void> {
  if (!key) throw new Error('S3 key must not be empty');

  const { bucket, client } = getConfig();

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    throw new Error(`Failed to delete CSV from s3://${bucket}/${key}`, {
      cause: err,
    });
  }
}
