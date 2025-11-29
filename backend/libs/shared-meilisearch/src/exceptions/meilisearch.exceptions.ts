import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base Meilisearch Exception
 */
export class MeilisearchException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(
      {
        statusCode,
        error: 'MeilisearchError',
        message,
        code: 'MEILISEARCH_ERROR',
      },
      statusCode,
    );
  }
}

/**
 * Meilisearch Connection Exception
 */
export class MeilisearchConnectionException extends MeilisearchException {
  constructor(message: string = 'Failed to connect to Meilisearch server') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

/**
 * Meilisearch Index Exception
 */
export class MeilisearchIndexException extends MeilisearchException {
  constructor(message: string = 'Index operation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Meilisearch Document Exception
 */
export class MeilisearchDocumentException extends MeilisearchException {
  constructor(message: string = 'Document operation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Meilisearch Search Exception
 */
export class MeilisearchSearchException extends MeilisearchException {
  constructor(message: string = 'Search operation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Meilisearch Task Exception
 */
export class MeilisearchTaskException extends MeilisearchException {
  constructor(message: string = 'Task operation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

