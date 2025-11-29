import { DynamicModule, Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MeilisearchService } from './services';
import { MeilisearchModuleOptions } from './config';

/**
 * Meilisearch Module
 * 
 * Shared library cho Meilisearch integration trong NestJS microservices
 * 
 * @example
 * // Sync configuration
 * MeilisearchModule.forRoot({
 *   host: 'http://localhost:7700',
 *   apiKey: 'master-key',
 * })
 * 
 * @example
 * // Async configuration with ConfigModule
 * MeilisearchModule.forRootAsync({
 *   imports: [ConfigModule],
 *   useFactory: (configService: ConfigService) => ({
 *     host: configService.get('MEILISEARCH_HOST'),
 *     apiKey: configService.get('MEILISEARCH_MASTER_KEY'),
 *   }),
 *   inject: [ConfigService],
 * })
 */
@Module({})
export class MeilisearchModule {
  /**
   * Register module with synchronous configuration
   */
  static forRoot(options: MeilisearchModuleOptions): DynamicModule {
    return {
      module: MeilisearchModule,
      providers: [
        {
          provide: MeilisearchService,
          useFactory: () => {
            return new MeilisearchService(
              options.host,
              options.apiKey,
              options.timeout,
              options.maxRetries,
            );
          },
        },
      ],
      exports: [MeilisearchService],
      global: true, // Make available globally
    };
  }

  /**
   * Register module with asynchronous configuration
   */
  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<MeilisearchModuleOptions> | MeilisearchModuleOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: MeilisearchModule,
      imports: options.imports || [],
      providers: [
        {
          provide: MeilisearchService,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return new MeilisearchService(
              config.host,
              config.apiKey,
              config.timeout,
              config.maxRetries,
            );
          },
          inject: options.inject || [],
        },
      ],
      exports: [MeilisearchService],
      global: true, // Make available globally
    };
  }
}

