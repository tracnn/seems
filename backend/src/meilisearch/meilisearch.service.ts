import { Inject, Injectable } from '@nestjs/common';
import { MeiliSearch, Index, SearchResponse } from 'meilisearch';

@Injectable()
export class MeilisearchService {
  constructor(
    @Inject('MEILISEARCH_CLIENT')
    private readonly client: MeiliSearch,
  ) {}

  getIndex(indexName: string): Index {
    return this.client.index(indexName);
  }

  async addDocuments(indexName: string, documents: any[]): Promise<void> {
    await this.getIndex(indexName).addDocuments(documents);
  }

  async deleteDocument(indexName: string, documentId: string | number): Promise<void> {
    await this.getIndex(indexName).deleteDocument(documentId);
  }

  async search<T extends Record<string, any>>(indexName: string, query: string, limit = 20, offset = 0, sort?: string[]): Promise<SearchResponse<T>> {
    return await this.getIndex(indexName).search<T>(query, { limit, offset, sort });
  }

  async updateSearchableAttributes(indexName: string, attributes: string[]): Promise<void> {
    await this.getIndex(indexName).updateSearchableAttributes(attributes);
  }

  async updateSortableAttributes(indexName: string, attributes: string[]): Promise<void> {
    await this.getIndex(indexName).updateSortableAttributes(attributes);
  }
}