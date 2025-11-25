import { RpcException } from '@nestjs/microservices';
import { HttpStatus, Logger } from '@nestjs/common';

const logger = new Logger('ConvertRpcError');

/**
 * Helper để chuyển đổi error từ firstValueFrom thành RpcException
 *
 * Khi firstValueFrom nhận được RpcException từ microservice,
 * nó throw một Error object thông thường, không phải RpcException.
 * Helper này giúp chuyển đổi lại thành RpcException để exception filter xử lý đúng.
 *
 * @param error - Error object từ firstValueFrom
 * @returns RpcException hoặc throw lại error gốc
 */
export function convertRpcError(error: any): RpcException {
  // Nếu đã là RpcException, return trực tiếp
  if (error instanceof RpcException) {
    return error;
  }

  // Tìm RPC error data trong các vị trí có thể
  let rpcError: any = null;

  // Kiểm tra error.error (thường là nơi chứa RPC error data)
  if (error?.error && typeof error.error === 'object') {
    rpcError = error.error;
  }
  // Kiểm tra error.response
  else if (error?.response && typeof error.response === 'object') {
    rpcError = error.response;
  }
  // Kiểm tra trực tiếp trên error object
  else if (error?.statusCode || error?.errorCode) {
    rpcError = error;
  }
  // Kiểm tra trong message nếu là JSON string
  else if (error?.message && typeof error.message === 'string') {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.statusCode || parsed.errorCode) {
        rpcError = parsed;
      }
    } catch {
      // Không phải JSON, bỏ qua
    }
  }

  // Nếu tìm thấy RPC error data, tạo RpcException
  if (rpcError && (rpcError.statusCode || rpcError.errorCode)) {
    return new RpcException({
      statusCode: rpcError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: rpcError.errorCode || null,
      errorDescription:
        rpcError.errorDescription ||
        rpcError.message ||
        'An error occurred in microservice',
      ...(rpcError.metadata && { metadata: rpcError.metadata }),
    });
  }

  // Log để debug nếu không tìm thấy RPC error structure
  logger.warn('Could not convert error to RpcException, structure:', {
    errorType: error?.constructor?.name,
    hasError: !!error?.error,
    hasResponse: !!error?.response,
    hasStatusCode: !!error?.statusCode,
    hasErrorCode: !!error?.errorCode,
    message: error?.message,
    keys: error ? Object.keys(error) : [],
  });

  // Nếu không phải RPC error, throw lại error gốc
  throw error;
}
