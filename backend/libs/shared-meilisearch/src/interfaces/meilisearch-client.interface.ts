/**
 * Meilisearch Client Interface
 * 
 * Abstraction layer cho Meilisearch client để dễ dàng test và mock
 */
export interface IMeilisearchClient {
  /**
   * Get index instance
   */
  index(indexName: string): IMeilisearchIndex;
  
  /**
   * Create new index
   */
  createIndex(indexName: string, options?: { primaryKey?: string }): Promise<void>;
  
  /**
   * Delete index
   */
  deleteIndex(indexName: string): Promise<void>;
  
  /**
   * Get all indexes
   */
  getIndexes(): Promise<IMeilisearchIndexInfo[]>;
  
  /**
   * Get index stats
   */
  getStats(): Promise<IMeilisearchStats>;
  
  /**
   * Health check
   */
  health(): Promise<IMeilisearchHealth>;
}

/**
 * Meilisearch Index Interface
 */
export interface IMeilisearchIndex {
  /**
   * Add documents to index
   */
  addDocuments<T = any>(documents: T[], options?: { primaryKey?: string }): Promise<IMeilisearchTask>;
  
  /**
   * Update documents in index
   */
  updateDocuments<T = any>(documents: T[], options?: { primaryKey?: string }): Promise<IMeilisearchTask>;
  
  /**
   * Delete documents by IDs
   */
  deleteDocuments(documentIds: string[]): Promise<IMeilisearchTask>;
  
  /**
   * Delete all documents
   */
  deleteAllDocuments(): Promise<IMeilisearchTask>;
  
  /**
   * Get document by ID
   */
  getDocument<T = any>(documentId: string): Promise<T>;
  
  /**
   * Get documents with pagination
   */
  getDocuments<T = any>(options?: IMeilisearchGetDocumentsOptions): Promise<IMeilisearchDocumentsResponse<T>>;
  
  /**
   * Search documents
   */
  search<T = any>(query: string, options?: IMeilisearchSearchOptions): Promise<IMeilisearchSearchResponse<T>>;
  
  /**
   * Update index settings
   */
  updateSettings(settings: IMeilisearchIndexSettings): Promise<IMeilisearchTask>;
  
  /**
   * Get index settings
   */
  getSettings(): Promise<IMeilisearchIndexSettings>;
  
  /**
   * Reset index settings
   */
  resetSettings(): Promise<IMeilisearchTask>;
  
  /**
   * Get index info
   */
  getRawInfo(): Promise<IMeilisearchIndexInfo>;
  
  /**
   * Wait for task completion
   */
  waitForTask(taskUid: number, options?: { timeOutMs?: number; intervalMs?: number }): Promise<IMeilisearchTask>;
}

/**
 * Search Options
 */
export interface IMeilisearchSearchOptions {
  limit?: number;
  offset?: number;
  filter?: string | string[];
  sort?: string[];
  attributesToRetrieve?: string[];
  attributesToHighlight?: string[];
  attributesToCrop?: string[];
  cropLength?: number;
  facets?: string[];
  matchingStrategy?: 'all' | 'last';
  showMatchesPosition?: boolean;
  highlightPreTag?: string;
  highlightPostTag?: string;
  cropMarker?: string;
}

/**
 * Get Documents Options
 */
export interface IMeilisearchGetDocumentsOptions {
  offset?: number;
  limit?: number;
  fields?: string[];
  filter?: string | string[];
}

/**
 * Index Settings
 */
export interface IMeilisearchIndexSettings {
  displayedAttributes?: string[];
  searchableAttributes?: string[];
  filterableAttributes?: string[];
  sortableAttributes?: string[];
  rankingRules?: string[];
  stopWords?: string[];
  synonyms?: Record<string, string[]>;
  distinctAttribute?: string;
  typoTolerance?: IMeilisearchTypoTolerance;
  faceting?: IMeilisearchFaceting;
  pagination?: IMeilisearchPagination;
}

/**
 * Typo Tolerance Settings
 */
export interface IMeilisearchTypoTolerance {
  enabled?: boolean;
  disableOnAttributes?: string[];
  disableOnWords?: string[];
  minWordSizeForTypos?: {
    oneTypo?: number;
    twoTypos?: number;
  };
}

/**
 * Faceting Settings
 */
export interface IMeilisearchFaceting {
  maxValuesPerFacet?: number;
  sortFacetValuesBy?: Record<string, 'alpha' | 'count'>;
}

/**
 * Pagination Settings
 */
export interface IMeilisearchPagination {
  maxTotalHits?: number;
}

/**
 * Search Response
 */
export interface IMeilisearchSearchResponse<T = any> {
  hits: T[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
  facetStats?: Record<string, { min: number; max: number }>;
}

/**
 * Documents Response
 */
export interface IMeilisearchDocumentsResponse<T = any> {
  results: T[];
  offset: number;
  limit: number;
  total: number;
}

/**
 * Task Response
 */
export interface IMeilisearchTask {
  taskUid: number;
  indexUid: string;
  status: 'enqueued' | 'processing' | 'succeeded' | 'failed';
  type: string;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: {
    message: string;
    code: string;
    type: string;
    link?: string;
  };
}

/**
 * Index Info
 */
export interface IMeilisearchIndexInfo {
  uid: string;
  primaryKey: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stats Response
 */
export interface IMeilisearchStats {
  databaseSize: number;
  lastUpdate: string;
  indexes: Record<string, IMeilisearchIndexStats>;
}

/**
 * Index Stats
 */
export interface IMeilisearchIndexStats {
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution: Record<string, number>;
}

/**
 * Health Response
 */
export interface IMeilisearchHealth {
  status: 'available';
}

