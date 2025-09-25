import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { MeilisearchService } from './meilisearch.service';
import { DOCUMENT_SCHEMA } from '../constants/common.constant';

export interface MeilisearchModuleOptions {
  host: string;
  apiKey?: string;
}

@Global()
@Module({})
export class MeilisearchModule {
  static forRoot(options: MeilisearchModuleOptions): DynamicModule {
    return {
      module: MeilisearchModule,
      providers: [
        {
          provide: 'MEILISEARCH_CLIENT',
          useFactory: () => new MeiliSearch({
            host: options.host,
            apiKey: options.apiKey,
          }),
        },
        MeilisearchService,
      ],
      exports: [MeilisearchService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: MeilisearchModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'MEILISEARCH_CLIENT',
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get<string>('MEILISEARCH_HOST') || 'http://localhost:7700';
            const apiKey = configService.get<string>('MEILI_MASTER_KEY') || 'qhis-plus';
            const client = new MeiliSearch({
              host: host,
              apiKey: apiKey,
            });

            // 👇 Auto update maxTotalHits cho index 'users'
            const index = client.index(DOCUMENT_SCHEMA.USER);
            await index.updateSettings({
              pagination: {
                maxTotalHits: 99999999  // hoặc giá trị tuỳ ý bạn
              }
            });

            await index.updateSettings({
              typoTolerance: {
                enabled: false,
              }
            });

            return client;
          },
        },
        MeilisearchService,
      ],
      exports: [MeilisearchService],
    };
  }
}