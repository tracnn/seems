# Meilisearch Shared Library

Shared library cho Meilisearch integration trong NestJS microservices architecture.

## 📋 Mục Lục

- [Cài Đặt](#cài-đặt)
- [Cấu Hình](#cấu-hình)
- [Sử Dụng](#sử-dụng)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## 🚀 Cài Đặt

### 1. Cài đặt dependencies

```bash
npm install meilisearch
```

### 2. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=qhis-plus
MEILISEARCH_TIMEOUT=5000
MEILISEARCH_MAX_RETRIES=3
```

---

## ⚙️ Cấu Hình

### Option 1: Async Configuration (Recommended)

Sử dụng với `ConfigModule`:

```typescript
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
export class YourServiceModule {}
```

### Option 2: Sync Configuration

```typescript
import { Module } from '@nestjs/common';
import { MeilisearchModule } from '@app/shared-meilisearch';

@Module({
  imports: [
    MeilisearchModule.forRoot({
      host: 'http://localhost:7700',
      apiKey: 'master-key',
      timeout: 5000,
      maxRetries: 3,
    }),
  ],
})
export class YourServiceModule {}
```

---

## 📖 Sử Dụng

### Inject Service

```typescript
import { Injectable } from '@nestjs/common';
import { MeilisearchService } from '@app/shared-meilisearch';

@Injectable()
export class UserSearchService {
  constructor(
    private readonly meilisearch: MeilisearchService,
  ) {}
}
```

### Basic Operations

#### 1. Create Index

```typescript
await this.meilisearch.createIndex('users', {
  primaryKey: 'id',
});
```

#### 2. Add Documents

```typescript
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

await this.meilisearch.addDocuments('users', users);
```

#### 3. Search Documents

```typescript
const results = await this.meilisearch.search<User>(
  'users',
  'John',
  {
    limit: 20,
    offset: 0,
    filter: 'status:active',
    sort: ['created_at:desc'],
  }
);

console.log(results.hits); // Array of matching documents
console.log(results.estimatedTotalHits); // Total count
```

#### 4. Update Documents

```typescript
const updatedUsers = [
  { id: '1', name: 'John Updated', email: 'john@example.com' },
];

await this.meilisearch.updateDocuments('users', updatedUsers);
```

#### 5. Delete Documents

```typescript
// Delete by IDs
await this.meilisearch.deleteDocuments('users', ['1', '2']);

// Delete all documents
await this.meilisearch.deleteAllDocuments('users');
```

#### 6. Get Document by ID

```typescript
const user = await this.meilisearch.getDocument<User>('users', '1');
```

#### 7. Get Documents with Pagination

```typescript
const response = await this.meilisearch.getDocuments<User>('users', {
  offset: 0,
  limit: 20,
  fields: ['id', 'name', 'email'],
});
```

#### 8. Update Index Settings

```typescript
await this.meilisearch.updateSettings('users', {
  searchableAttributes: ['name', 'email'],
  filterableAttributes: ['status', 'role'],
  sortableAttributes: ['created_at', 'updated_at'],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
  ],
});
```

#### 9. Wait for Task Completion

```typescript
const task = await this.meilisearch.addDocuments('users', users);
const completedTask = await this.meilisearch.waitForTask(
  'users',
  task.taskUid,
  {
    timeOutMs: 5000,
    intervalMs: 50,
  }
);

if (completedTask.status === 'succeeded') {
  console.log('Documents indexed successfully');
}
```

---

## 📚 API Reference

### MeilisearchService

#### Index Operations

- `createIndex(indexName: string, options?: { primaryKey?: string }): Promise<void>`
- `deleteIndex(indexName: string): Promise<void>`
- `getIndexes(): Promise<IMeilisearchIndexInfo[]>`
- `getStats(): Promise<IMeilisearchStats>`
- `health(): Promise<IMeilisearchHealth>`

#### Document Operations

- `addDocuments<T>(indexName: string, documents: T[], options?: { primaryKey?: string }): Promise<IMeilisearchTask>`
- `updateDocuments<T>(indexName: string, documents: T[], options?: { primaryKey?: string }): Promise<IMeilisearchTask>`
- `deleteDocuments(indexName: string, documentIds: string[]): Promise<IMeilisearchTask>`
- `deleteAllDocuments(indexName: string): Promise<IMeilisearchTask>`
- `getDocument<T>(indexName: string, documentId: string): Promise<T>`
- `getDocuments<T>(indexName: string, options?: IMeilisearchGetDocumentsOptions): Promise<IMeilisearchDocumentsResponse<T>>`

#### Search Operations

- `search<T>(indexName: string, query: string, options?: IMeilisearchSearchOptions): Promise<IMeilisearchSearchResponse<T>>`

#### Settings Operations

- `updateSettings(indexName: string, settings: IMeilisearchIndexSettings): Promise<IMeilisearchTask>`
- `getSettings(indexName: string): Promise<IMeilisearchIndexSettings>`
- `resetSettings(indexName: string): Promise<IMeilisearchTask>`

#### Task Operations

- `waitForTask(indexName: string, taskUid: number, options?: { timeOutMs?: number; intervalMs?: number }): Promise<IMeilisearchTask>`

---

## 💡 Examples

### Example 1: User Search Service

```typescript
import { Injectable } from '@nestjs/common';
import { MeilisearchService } from '@app/shared-meilisearch';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

@Injectable()
export class UserSearchService {
  private readonly INDEX_NAME = 'users';

  constructor(
    private readonly meilisearch: MeilisearchService,
  ) {}

  async indexUser(user: User): Promise<void> {
    await this.meilisearch.addDocuments(this.INDEX_NAME, [user]);
  }

  async searchUsers(keyword: string, filters?: { status?: string }): Promise<User[]> {
    const filter = filters?.status ? `status:${filters.status}` : undefined;
    
    const results = await this.meilisearch.search<User>(
      this.INDEX_NAME,
      keyword,
      {
        limit: 20,
        filter,
        sort: ['createdAt:desc'],
      }
    );

    return results.hits;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await this.meilisearch.updateDocuments(this.INDEX_NAME, [
      { id: userId, ...data },
    ]);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.meilisearch.deleteDocuments(this.INDEX_NAME, [userId]);
  }
}
```

### Example 2: Repository Pattern với Clean Architecture

```typescript
// domain/interfaces/user-search.repository.interface.ts
export interface IUserSearchRepository {
  index(user: User): Promise<void>;
  search(criteria: UserSearchCriteria): Promise<User[]>;
  update(userId: string, data: Partial<User>): Promise<void>;
  delete(userId: string): Promise<void>;
}

// infrastructure/repositories/user-search.repository.ts
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
      createdAt: user.createdAt.toISOString(),
    };
  }

  private buildFilter(criteria: UserSearchCriteria): string | undefined {
    const filters: string[] = [];
    
    if (criteria.status) {
      filters.push(`status:${criteria.status}`);
    }
    
    return filters.length > 0 ? filters.join(' AND ') : undefined;
  }
}
```

---

## ✅ Best Practices

### 1. Index Naming Convention

Sử dụng naming convention nhất quán:

```typescript
// ✅ Good
const INDEX_NAME = 'users';
const INDEX_NAME = 'products-v1';
const INDEX_NAME = 'orders-2024';

// ❌ Bad
const INDEX_NAME = 'Users';
const INDEX_NAME = 'user_data';
```

### 2. Error Handling

```typescript
import { 
  MeilisearchException,
  MeilisearchConnectionException,
  MeilisearchSearchException,
} from '@app/shared-meilisearch';

try {
  await this.meilisearch.search('users', 'keyword');
} catch (error) {
  if (error instanceof MeilisearchConnectionException) {
    // Handle connection error
    this.logger.error('Meilisearch connection failed');
  } else if (error instanceof MeilisearchSearchException) {
    // Handle search error
    this.logger.error('Search failed', error);
  } else {
    // Handle other errors
    throw error;
  }
}
```

### 3. Batch Operations

Sử dụng batch operations cho nhiều documents:

```typescript
// ✅ Good - Batch operation
const users = [/* 1000 users */];
await this.meilisearch.addDocuments('users', users);

// ❌ Bad - Individual operations
for (const user of users) {
  await this.meilisearch.addDocuments('users', [user]);
}
```

### 4. Task Management

Luôn đợi task completion cho critical operations:

```typescript
const task = await this.meilisearch.addDocuments('users', users);
await this.meilisearch.waitForTask('users', task.taskUid);

// Now documents are indexed and searchable
```

### 5. Settings Configuration

Cấu hình settings khi tạo index:

```typescript
await this.meilisearch.createIndex('users', { primaryKey: 'id' });

await this.meilisearch.updateSettings('users', {
  searchableAttributes: ['name', 'email'],
  filterableAttributes: ['status', 'role'],
  sortableAttributes: ['createdAt'],
});
```

---

## 🔧 Troubleshooting

### Connection Issues

```typescript
// Check health
const health = await this.meilisearch.health();
console.log(health); // { status: 'available' }
```

### Index Not Found

```typescript
// Check if index exists
const indexes = await this.meilisearch.getIndexes();
const indexExists = indexes.some(idx => idx.uid === 'users');

if (!indexExists) {
  await this.meilisearch.createIndex('users', { primaryKey: 'id' });
}
```

---

## 📝 License

Internal use only.

