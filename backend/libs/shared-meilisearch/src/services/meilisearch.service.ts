import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import {
  IMeilisearchClient,
  IMeilisearchIndex,
  IMeilisearchSearchOptions,
  IMeilisearchSearchResponse,
  IMeilisearchIndexSettings,
  IMeilisearchTask,
  IMeilisearchIndexInfo,
  IMeilisearchStats,
  IMeilisearchHealth,
  IMeilisearchGetDocumentsOptions,
  IMeilisearchDocumentsResponse,
} from '../interfaces';
import {
  MeilisearchConnectionException,
  MeilisearchIndexException,
  MeilisearchDocumentException,
  MeilisearchSearchException,
  MeilisearchTaskException,
} from '../exceptions';

/**
 * Meilisearch Service
 * 
 * Wrapper service cho Meilisearch client với error handling và logging
 */
@Injectable()
export class MeilisearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MeilisearchService.name);
  private client: MeiliSearch | null = null;

  constructor(
    private readonly host: string,
    private readonly apiKey?: string,
    private readonly timeout?: number,
    private readonly maxRetries?: number,
  ) {}

  /**
   * Initialize Meilisearch client on module init
   */
  async onModuleInit() {
    try {
      this.client = new MeiliSearch({
        host: this.host,
        apiKey: this.apiKey,
        timeout: this.timeout,
      });

      // Test connection
      await this.client.health();
      this.logger.log(`✅ Connected to Meilisearch at ${this.host}`);
    } catch (error) {
      this.logger.error(`❌ Failed to connect to Meilisearch: ${error.message}`);
      throw new MeilisearchConnectionException(error.message);
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    // Meilisearch client doesn't need explicit cleanup
    this.logger.log('Meilisearch client disconnected');
  }

  /**
   * Get Meilisearch client instance
   */
  private getClient(): MeiliSearch {
    if (!this.client) {
      throw new MeilisearchConnectionException('Meilisearch client not initialized');
    }
    return this.client;
  }

  /**
   * Get index instance
   */
  getIndex(indexName: string) {
    try {
      return this.getClient().index(indexName);
    } catch (error) {
      this.logger.error(`Failed to get index ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to get index: ${error.message}`);
    }
  }

  /**
   * Create new index
   */
  async createIndex(indexName: string, options?: { primaryKey?: string }): Promise<void> {
    try {
      await this.getClient().createIndex(indexName, options);
      this.logger.log(`✅ Created index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to create index ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to create index: ${error.message}`);
    }
  }

  /**
   * Delete index
   */
  async deleteIndex(indexName: string): Promise<void> {
    try {
      await this.getClient().deleteIndex(indexName);
      this.logger.log(`✅ Deleted index: ${indexName}`);
    } catch (error) {
      this.logger.error(`Failed to delete index ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to delete index: ${error.message}`);
    }
  }

  /**
   * Get all indexes
   */
  async getIndexes(): Promise<IMeilisearchIndexInfo[]> {
    try {
      const result = await this.getClient().getIndexes();
      // Meilisearch SDK returns IndexesResults, extract results array
      return result.results.map((index) => ({
        uid: index.uid,
        primaryKey: index.primaryKey || null,
        createdAt: index.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: index.updatedAt?.toISOString() || new Date().toISOString(),
      }));
    } catch (error) {
      this.logger.error(`Failed to get indexes: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to get indexes: ${error.message}`);
    }
  }

  /**
   * Get stats
   */
  async getStats(): Promise<IMeilisearchStats> {
    try {
      return await this.getClient().getStats();
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`);
      throw new MeilisearchConnectionException(`Failed to get stats: ${error.message}`);
    }
  }

  /**
   * Health check
   */
  async health(): Promise<IMeilisearchHealth> {
    try {
      return await this.getClient().health();
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw new MeilisearchConnectionException(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Add documents to index
   */
  async addDocuments<T extends Record<string, any> = Record<string, any>>(
    indexName: string,
    documents: T[],
    options?: { primaryKey?: string },
  ): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.addDocuments(documents as Record<string, any>[], options);
      this.logger.debug(`Added ${documents.length} documents to index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to add documents to ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to add documents: ${error.message}`);
    }
  }

  /**
   * Update documents in index
   */
  async updateDocuments<T extends Record<string, any> = Record<string, any>>(
    indexName: string,
    documents: T[],
    options?: { primaryKey?: string },
  ): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.updateDocuments(documents as Partial<Record<string, any>>[], options);
      this.logger.debug(`Updated ${documents.length} documents in index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to update documents in ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to update documents: ${error.message}`);
    }
  }

  /**
   * Delete documents by IDs
   */
  async deleteDocuments(indexName: string, documentIds: string[]): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.deleteDocuments(documentIds);
      this.logger.debug(`Deleted ${documentIds.length} documents from index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to delete documents from ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to delete documents: ${error.message}`);
    }
  }

  /**
   * Delete all documents in index
   */
  async deleteAllDocuments(indexName: string): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.deleteAllDocuments();
      this.logger.debug(`Deleted all documents from index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to delete all documents from ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to delete all documents: ${error.message}`);
    }
  }

  /**
   * Get document by ID
   */
  async getDocument<T extends Record<string, any> = Record<string, any>>(
    indexName: string,
    documentId: string,
  ): Promise<T> {
    try {
      const index = this.getIndex(indexName);
      return (await index.getDocument<T>(documentId)) as T;
    } catch (error) {
      this.logger.error(`Failed to get document ${documentId} from ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Get documents with pagination
   */
  async getDocuments<T extends Record<string, any> = Record<string, any>>(
    indexName: string,
    options?: IMeilisearchGetDocumentsOptions,
  ): Promise<IMeilisearchDocumentsResponse<T>> {
    try {
      const index = this.getIndex(indexName);
      // Convert options to Meilisearch SDK format
      const sdkOptions: any = {
        offset: options?.offset,
        limit: options?.limit,
        fields: options?.fields as any,
        filter: options?.filter,
      };
      const response = await index.getDocuments<T>(sdkOptions);
      return {
        results: response.results as T[],
        offset: response.offset || 0,
        limit: response.limit || 20,
        total: response.total,
      };
    } catch (error) {
      this.logger.error(`Failed to get documents from ${indexName}: ${error.message}`);
      throw new MeilisearchDocumentException(`Failed to get documents: ${error.message}`);
    }
  }

  /**
   * Search documents
   */
  async search<T extends Record<string, any> = Record<string, any>>(
    indexName: string,
    query: string,
    options?: IMeilisearchSearchOptions,
  ): Promise<IMeilisearchSearchResponse<T>> {
    try {
      const index = this.getIndex(indexName);
      const response = await index.search<T>(query, options);
      return {
        hits: response.hits as T[],
        query: response.query,
        processingTimeMs: response.processingTimeMs,
        limit: response.limit,
        offset: response.offset,
        estimatedTotalHits: response.estimatedTotalHits,
        facetDistribution: response.facetDistribution,
        facetStats: response.facetStats,
      };
    } catch (error) {
      this.logger.error(`Failed to search in ${indexName}: ${error.message}`);
      throw new MeilisearchSearchException(`Failed to search: ${error.message}`);
    }
  }

  /**
   * Update index settings
   */
  async updateSettings(
    indexName: string,
    settings: IMeilisearchIndexSettings,
  ): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      // Convert settings to Meilisearch SDK format
      const sdkSettings: any = {
        ...settings,
        displayedAttributes: settings.displayedAttributes === null ? null : settings.displayedAttributes,
      };
      const task = await index.updateSettings(sdkSettings);
      this.logger.debug(`Updated settings for index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to update settings for ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Get index settings
   */
  async getSettings(indexName: string): Promise<IMeilisearchIndexSettings> {
    try {
      const index = this.getIndex(indexName);
      const settings = await index.getSettings();
      // Convert SDK settings to our interface format
      return {
        displayedAttributes: Array.isArray(settings.displayedAttributes)
          ? settings.displayedAttributes
          : settings.displayedAttributes === null
          ? null
          : undefined,
        searchableAttributes: settings.searchableAttributes,
        filterableAttributes: settings.filterableAttributes,
        sortableAttributes: settings.sortableAttributes,
        rankingRules: settings.rankingRules,
        stopWords: settings.stopWords,
        synonyms: settings.synonyms,
        distinctAttribute: settings.distinctAttribute,
        typoTolerance: settings.typoTolerance,
        faceting: settings.faceting,
        pagination: settings.pagination,
      } as IMeilisearchIndexSettings;
    } catch (error) {
      this.logger.error(`Failed to get settings for ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to get settings: ${error.message}`);
    }
  }

  /**
   * Reset index settings
   */
  async resetSettings(indexName: string): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.resetSettings();
      this.logger.debug(`Reset settings for index ${indexName}`);
      return this.convertTask(task);
    } catch (error) {
      this.logger.error(`Failed to reset settings for ${indexName}: ${error.message}`);
      throw new MeilisearchIndexException(`Failed to reset settings: ${error.message}`);
    }
  }

  /**
   * Wait for task completion
   */
  async waitForTask(
    indexName: string,
    taskUid: number,
    options?: { timeOutMs?: number; intervalMs?: number },
  ): Promise<IMeilisearchTask> {
    try {
      const index = this.getIndex(indexName);
      const task = await index.waitForTask(taskUid, options);
      return this.convertTaskFromTask(task, taskUid);
    } catch (error) {
      this.logger.error(`Failed to wait for task ${taskUid}: ${error.message}`);
      throw new MeilisearchTaskException(`Failed to wait for task: ${error.message}`);
    }
  }

  /**
   * Convert Meilisearch SDK EnqueuedTask to IMeilisearchTask
   */
  private convertTask(task: any): IMeilisearchTask {
    return {
      taskUid: task.taskUid,
      indexUid: task.indexUid,
      status: task.status,
      type: task.type,
      enqueuedAt: task.enqueuedAt instanceof Date ? task.enqueuedAt.toISOString() : task.enqueuedAt,
      startedAt: task.startedAt instanceof Date ? task.startedAt.toISOString() : task.startedAt,
      finishedAt: task.finishedAt instanceof Date ? task.finishedAt.toISOString() : task.finishedAt,
      error: task.error,
    };
  }

  /**
   * Convert Meilisearch SDK Task to IMeilisearchTask
   */
  private convertTaskFromTask(task: any, taskUid: number): IMeilisearchTask {
    return {
      taskUid: taskUid,
      indexUid: task.indexUid || '',
      status: task.status,
      type: task.type || '',
      enqueuedAt: task.enqueuedAt instanceof Date ? task.enqueuedAt.toISOString() : task.enqueuedAt || '',
      startedAt: task.startedAt instanceof Date ? task.startedAt.toISOString() : task.startedAt,
      finishedAt: task.finishedAt instanceof Date ? task.finishedAt.toISOString() : task.finishedAt,
      error: task.error,
    };
  }
}

