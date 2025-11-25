import { ErrorMessagesService } from './error-messages.service';
import { ErrorCode } from './index';

describe('ErrorMessagesService', () => {
  let service: ErrorMessagesService;

  beforeEach(() => {
    service = new ErrorMessagesService();
  });

  describe('getMessage', () => {
    it('should return English message by default', () => {
      const message = service.getMessage('AUTH_SERVICE.0001');
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return Vietnamese message when language is vi', () => {
      const message = service.getMessage('AUTH_SERVICE.0001', 'vi');
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
      // Should be different from English
      expect(message).not.toBe(service.getMessage('AUTH_SERVICE.0001', 'en'));
    });

    it('should return fallback message for unknown error code', () => {
      const message = service.getMessage('UNKNOWN_ERROR.9999');
      expect(message).toContain('UNKNOWN_ERROR.9999');
    });

    it('should handle ErrorCode enum values', () => {
      const message = service.getMessage(ErrorCode.AUTH_SERVICE_0001);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });
  });

  describe('getStatusCode', () => {
    it('should return status code for valid error code', () => {
      const statusCode = service.getStatusCode('AUTH_SERVICE.0001');
      expect(statusCode).toBe(401);
    });

    it('should return 500 for unknown error code', () => {
      const statusCode = service.getStatusCode('UNKNOWN_ERROR.9999');
      expect(statusCode).toBe(500);
    });
  });

  describe('getCategory', () => {
    it('should return category for valid error code', () => {
      const category = service.getCategory('AUTH_SERVICE.0001');
      expect(category).toBe('authentication');
    });

    it('should return unknown for unknown error code', () => {
      const category = service.getCategory('UNKNOWN_ERROR.9999');
      expect(category).toBe('unknown');
    });
  });

  describe('getAllErrors', () => {
    it('should return all errors for default language', () => {
      const errors = service.getAllErrors();
      expect(errors).toBeDefined();
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors['AUTH_SERVICE.0001']).toBeDefined();
    });

    it('should return all errors for Vietnamese', () => {
      const errors = service.getAllErrors('vi');
      expect(errors).toBeDefined();
      expect(Object.keys(errors).length).toBeGreaterThan(0);
    });
  });

  describe('hasError', () => {
    it('should return true for existing error code', () => {
      expect(service.hasError('AUTH_SERVICE.0001')).toBe(true);
    });

    it('should return false for unknown error code', () => {
      expect(service.hasError('UNKNOWN_ERROR.9999')).toBe(false);
    });
  });

  describe('getErrorInfo', () => {
    it('should return full error information', () => {
      const info = service.getErrorInfo('AUTH_SERVICE.0001');
      expect(info).toHaveProperty('code');
      expect(info).toHaveProperty('message');
      expect(info).toHaveProperty('statusCode');
      expect(info).toHaveProperty('category');
      expect(info.code).toBe('AUTH_SERVICE.0001');
      expect(info.statusCode).toBe(401);
      expect(info.category).toBe('authentication');
    });
  });
});


