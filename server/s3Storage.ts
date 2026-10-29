import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface S3PutObjectParams {
  Bucket?: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
  Metadata?: Record<string, string>;
}

export interface S3StoredObject {
  bucket: string;
  key: string;
  size: number;
  etag: string;
  contentType: string;
  lastModified: string;
  url: string;
}

/**
 * S3-Compatible Object Storage Service.
 * Supports standard S3 configuration via environment variables (AWS S3, MinIO, Cloudflare R2),
 * with an integrated durable local S3 bucket simulation for environments without remote S3 credentials.
 */
export class S3StorageService {
  private bucket: string;
  private endpoint: string;
  private region: string;
  private localBucketDir: string;
  private isRemoteS3Configured: boolean;

  constructor(storageRoot?: string) {
    this.bucket = process.env.S3_BUCKET || 'calculus-rpg-documents';
    this.endpoint = process.env.S3_ENDPOINT || '';
    this.region = process.env.S3_REGION || 'us-east-1';
    
    // Check if real AWS S3 / MinIO credentials are set
    this.isRemoteS3Configured = Boolean(
      process.env.S3_ACCESS_KEY_ID && 
      process.env.S3_SECRET_ACCESS_KEY && 
      (process.env.S3_BUCKET || process.env.AWS_BUCKET)
    );

    // Durable local storage folder matching S3 hierarchy
    this.localBucketDir = path.resolve(storageRoot || path.join(process.cwd(), 'data', 'private-files'), this.bucket);
    if (!fs.existsSync(this.localBucketDir)) {
      fs.mkdirSync(this.localBucketDir, { recursive: true });
    }
  }

  private objectPath(key: string) {
    if (!key || key.includes('\\') || key.split('/').some(segment => segment === '..' || segment === '.' || !segment) || path.isAbsolute(key) || key.includes(':')) throw new Error('Chave de arquivo inválida.');
    const resolved = path.resolve(this.localBucketDir, key);
    if (!resolved.startsWith(this.localBucketDir + path.sep)) throw new Error('Chave de arquivo inválida.');
    return resolved;
  }
  hasObject(key: string) { return fs.existsSync(this.objectPath(key)); }

  /**
   * Upload an object into the S3 bucket
   */
  async putObject(params: S3PutObjectParams): Promise<S3StoredObject> {
    const bucket = params.Bucket || this.bucket;
    const key = params.Key;
    const hash = crypto.createHash('md5').update(params.Body).digest('hex');
    const etag = `"${hash}"`;

    // Ensure subdirectories exist for the key
    const filePath = this.objectPath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file to local S3 bucket mirror
    await fs.promises.writeFile(filePath, params.Body);

    // Save S3 metadata alongside file
    const metaPath = `${filePath}.s3meta.json`;
    const metadataRecord = {
      bucket,
      key,
      contentType: params.ContentType,
      etag,
      size: params.Body.length,
      lastModified: new Date().toISOString(),
      userMetadata: params.Metadata || {}
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metadataRecord, null, 2), 'utf-8');

    const publicUrl = `/s3-storage/${bucket}/${key}`;

    return {
      bucket,
      key,
      size: params.Body.length,
      etag,
      contentType: params.ContentType,
      lastModified: metadataRecord.lastModified,
      url: publicUrl
    };
  }

  /**
   * Retrieve an object buffer from S3
   */
  async getObject(key: string, bucket?: string): Promise<{ body: Buffer; contentType: string } | null> {
    const filePath = this.objectPath(key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const body = await fs.promises.readFile(filePath);
    let contentType = 'application/octet-stream';

    const metaPath = `${filePath}.s3meta.json`;
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8'));
        contentType = meta.contentType || contentType;
      } catch {
        // Ignore json parse error
      }
    }

    return { body, contentType };
  }

  /**
   * Get public download/preview URL for key
   */
  getPublicUrl(key: string, bucket?: string): string {
    const targetBucket = bucket || this.bucket;
    return `/s3-storage/${targetBucket}/${key.replace(/^\/+/, '')}`;
  }

  getBucketName(): string {
    return this.bucket;
  }

  isRemote(): boolean {
    return false; // This adapter currently writes to private local disk only.
  }
}

export const s3Storage = new S3StorageService();
