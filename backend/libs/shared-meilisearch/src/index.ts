/**
 * Meilisearch Shared Library
 * 
 * Shared library cho Meilisearch integration trong NestJS microservices
 * 
 * @example
 * // Import module
 * import { MeilisearchModule } from '@app/shared-meilisearch';
 * 
 * // Import service
 * import { MeilisearchService } from '@app/shared-meilisearch';
 * 
 * // Import interfaces
 * import { IMeilisearchSearchOptions } from '@app/shared-meilisearch';
 * 
 * // Import exceptions
 * import { MeilisearchException } from '@app/shared-meilisearch';
 */

// Module
export * from './meilisearch.module';

// Service
export * from './services';

// Interfaces
export * from './interfaces';

// Config
export * from './config';

// Exceptions
export * from './exceptions';

