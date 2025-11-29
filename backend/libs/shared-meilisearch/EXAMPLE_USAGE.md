# Example Usage - Meilisearch Shared Library

## Quick Start Example

### 1. Setup Module trong Service

```typescript
// auth-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MeilisearchModule } from '@app/shared-meilisearch';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MeilisearchModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('MEILISEARCH_HOST') || 'http://localhost:7700',
        apiKey: configService.get<string>('MEILISEARCH_MASTER_KEY'),
        timeout: Number(configService.get<string>('MEILISEARCH_TIMEOUT')) || 5000,
        maxRetries: Number(configService.get<string>('MEILISEARCH_MAX_RETRIES')) || 3,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthServiceModule {}
```

### 2. Sử dụng trong Service

```typescript
// user-search.service.ts
import { Injectable } from '@nestjs/common';
import { MeilisearchService } from '@app/shared-meilisearch';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

@Injectable()
export class UserSearchService {
  private readonly INDEX_NAME = 'users';

  constructor(
    private readonly meilisearch: MeilisearchService,
  ) {}

  async initializeIndex(): Promise<void> {
    // Create index if not exists
    try {
      await this.meilisearch.createIndex(this.INDEX_NAME, {
        primaryKey: 'id',
      });

      // Configure settings
      await this.meilisearch.updateSettings(this.INDEX_NAME, {
        searchableAttributes: ['name', 'email'],
        filterableAttributes: ['status'],
        sortableAttributes: ['createdAt'],
      });
    } catch (error) {
      // Index might already exist
      console.log('Index setup:', error.message);
    }
  }

  async indexUser(user: User): Promise<void> {
    await this.meilisearch.addDocuments(this.INDEX_NAME, [user]);
  }

  async searchUsers(keyword: string): Promise<User[]> {
    const results = await this.meilisearch.search<User>(
      this.INDEX_NAME,
      keyword,
      {
        limit: 20,
        filter: 'status:active',
      }
    );

    return results.hits;
  }
}
```

### 3. Sử dụng trong Use Case (CQRS)

```typescript
// search-users.query.ts
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MeilisearchService } from '@app/shared-meilisearch';

export class SearchUsersQuery {
  constructor(
    public readonly keyword: string,
    public readonly limit: number = 20,
  ) {}
}

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
  private readonly INDEX_NAME = 'users';

  constructor(
    private readonly meilisearch: MeilisearchService,
  ) {}

  async execute(query: SearchUsersQuery) {
    const results = await this.meilisearch.search(
      this.INDEX_NAME,
      query.keyword,
      {
        limit: query.limit,
      }
    );

    return results.hits;
  }
}
```

### 4. Repository Pattern

```typescript
// user-search.repository.ts
import { Injectable } from '@nestjs/common';
import { MeilisearchService } from '@app/shared-meilisearch';
import { IUserSearchRepository } from '../../domain/interfaces/user-search.repository.interface';

@Injectable()
export class UserSearchRepository implements IUserSearchRepository {
  private readonly INDEX_NAME = 'users';

  constructor(
    private readonly meilisearch: MeilisearchService,
  ) {}

  async index(user: User): Promise<void> {
    await this.meilisearch.addDocuments(this.INDEX_NAME, [this.toDocument(user)]);
  }

  async search(criteria: UserSearchCriteria): Promise<User[]> {
    const results = await this.meilisearch.search<User>(
      this.INDEX_NAME,
      criteria.keyword || '',
      {
        limit: criteria.limit || 20,
        offset: criteria.offset || 0,
        filter: this.buildFilter(criteria),
        sort: criteria.sort || ['createdAt:desc'],
      }
    );

    return results.hits;
  }

  async update(userId: string, data: Partial<User>): Promise<void> {
    await this.meilisearch.updateDocuments(this.INDEX_NAME, [
      { id: userId, ...data },
    ]);
  }

  async delete(userId: string): Promise<void> {
    await this.meilisearch.deleteDocuments(this.INDEX_NAME, [userId]);
  }

  private toDocument(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt?.toISOString(),
    };
  }

  private buildFilter(criteria: UserSearchCriteria): string | undefined {
    const filters: string[] = [];
    
    if (criteria.status) {
      filters.push(`status:${criteria.status}`);
    }
    
    if (criteria.role) {
      filters.push(`role:${criteria.role}`);
    }
    
    return filters.length > 0 ? filters.join(' AND ') : undefined;
  }
}
```

