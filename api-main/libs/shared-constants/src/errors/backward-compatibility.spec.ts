/**
 * Backward Compatibility Tests
 * 
 * Ensures that existing code using ERROR_DESCRIPTIONS still works
 * after migrating to errors.json
 */

import { ErrorCode, ERROR_DESCRIPTIONS, getErrorMessage } from './index';
import { BaseException } from '@app/shared-exceptions';
import { HttpStatus } from '@nestjs/common';

describe('Backward Compatibility', () => {
  describe('ERROR_DESCRIPTIONS', () => {
    it('should have all AUTH_SERVICE error codes', () => {
      expect(ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001]).toBeDefined();
      expect(ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0002]).toBeDefined();
      expect(ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0006]).toBeDefined();
    });

    it('should have all IAM_SERVICE error codes', () => {
      expect(ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0001]).toBeDefined();
      expect(ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0100]).toBeDefined();
      expect(ERROR_DESCRIPTIONS[ErrorCode.IAM_SERVICE_0200]).toBeDefined();
    });

    it('should return string messages', () => {
      const message = ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001];
      expect(typeof message).toBe('string');
      expect(message?.length).toBeGreaterThan(0);
    });
  });

  describe('BaseException - Traditional Usage', () => {
    it('should work with traditional constructor', () => {
      const exception = new BaseException(
        ErrorCode.AUTH_SERVICE_0001,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001] || 'Fallback message',
        HttpStatus.UNAUTHORIZED,
      );

      expect(exception.errorCode).toBe(ErrorCode.AUTH_SERVICE_0001);
      expect(exception.errorDescription).toBeDefined();
      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should work with metadata', () => {
      const exception = new BaseException(
        ErrorCode.AUTH_SERVICE_0001,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001] || 'Fallback',
        HttpStatus.UNAUTHORIZED,
        { userId: '123' },
      );

      expect(exception.metadata).toEqual({ userId: '123' });
    });
  });

  describe('BaseException - New fromErrorCode Method', () => {
    it('should create exception with auto-loaded message', () => {
      const exception = BaseException.fromErrorCode(ErrorCode.AUTH_SERVICE_0001);

      expect(exception.errorCode).toBe(ErrorCode.AUTH_SERVICE_0001);
      expect(exception.errorDescription).toBeDefined();
      expect(exception.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('should work with metadata', () => {
      const exception = BaseException.fromErrorCode(
        ErrorCode.AUTH_SERVICE_0001,
        { userId: '123' },
      );

      expect(exception.metadata).toEqual({ userId: '123' });
    });

    it('should support different languages', () => {
      const exceptionEn = BaseException.fromErrorCode(
        ErrorCode.AUTH_SERVICE_0001,
        undefined,
        'en',
      );
      const exceptionVi = BaseException.fromErrorCode(
        ErrorCode.AUTH_SERVICE_0001,
        undefined,
        'vi',
      );

      expect(exceptionEn.errorDescription).toBeDefined();
      expect(exceptionVi.errorDescription).toBeDefined();
      // Vietnamese message should be different from English
      expect(exceptionVi.errorDescription).not.toBe(
        exceptionEn.errorDescription,
      );
    });
  });

  describe('getErrorMessage helper', () => {
    it('should return error message for ErrorCode', () => {
      const message = getErrorMessage(ErrorCode.AUTH_SERVICE_0001);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });

    it('should support different languages', () => {
      const messageEn = getErrorMessage(ErrorCode.AUTH_SERVICE_0001, 'en');
      const messageVi = getErrorMessage(ErrorCode.AUTH_SERVICE_0001, 'vi');

      expect(messageEn).toBeDefined();
      expect(messageVi).toBeDefined();
      expect(messageVi).not.toBe(messageEn);
    });
  });

  describe('Existing Code Patterns', () => {
    it('should support pattern: ERROR_DESCRIPTIONS[ErrorCode.XXX]', () => {
      // This is the most common pattern in existing code
      const message =
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001] ||
        'Fallback message';

      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });

    it('should support pattern in BaseException', () => {
      // Existing code pattern
      const exception = new BaseException(
        ErrorCode.AUTH_SERVICE_0001,
        ERROR_DESCRIPTIONS[ErrorCode.AUTH_SERVICE_0001] ||
          'The provided username or password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );

      expect(exception).toBeInstanceOf(BaseException);
      expect(exception.errorCode).toBe(ErrorCode.AUTH_SERVICE_0001);
    });
  });
});


