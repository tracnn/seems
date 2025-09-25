/**
 * Hàm helper dùng chung để quản lý loading & error khi gọi async action.
 * @param action    Hàm async cần thực thi.
 * @param state     Đối tượng state/store cần cập nhật loading/error (thường là `this` trong store).
 * @param options   Tuỳ chọn: loadingKey, errorKey, errorMessage.
 */
export async function executeWithLoading<T>(
    action: () => Promise<T>,
    state: any,
    options?: {
      loadingKey?: string;
      errorKey?: string;
      errorMessage?: string;
    }
  ): Promise<T> {
    const loadingKey = options?.loadingKey || 'loading';
    const errorKey = options?.errorKey || 'error';
    const errorMessage = options?.errorMessage || 'Có lỗi xảy ra';
  
    // Set loading = true, error = null
    state[loadingKey] = true;
    state[errorKey] = null;
  
    try {
      return await action();
    } catch (err: any) {
      state[errorKey] = err?.message || errorMessage;
      throw err;
    } finally {
      state[loadingKey] = false;
    }
  }