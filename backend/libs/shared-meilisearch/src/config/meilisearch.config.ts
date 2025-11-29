import { registerAs } from '@nestjs/config';

/**
 * Meilisearch Configuration Factory
 * 
 * Sử dụng với ConfigModule:
 * 
 * @example
 * ConfigModule.forRoot({
 *   load: [meilisearchConfig],
 * })
 */
export default registerAs('meilisearch', () => ({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY || '',
  timeout: Number(process.env.MEILISEARCH_TIMEOUT) || 5000,
  maxRetries: Number(process.env.MEILISEARCH_MAX_RETRIES) || 3,
}));

/**
 * Meilisearch Module Options
 */
export interface MeilisearchModuleOptions {
  host: string;
  apiKey?: string;
  timeout?: number;
  maxRetries?: number;
}

