interface Toast {
  add: (options: { severity: string; summary: string; detail: string; life: number }) => void;
}

interface ApiErrorResponse {
  status?: number;
  message?: string;
  errors?: any[];
  response?: {
    data?: {
      message?: string;
      errors?: any[];
    };
  };
}

export function handleApiError(
  errorOrRes: ApiErrorResponse,
  toast: Toast,
  defaultMessage: string = 'Có lỗi xảy ra!'
): void {
  let msg = '';

  // Case 1: Lỗi do response backend trả về status 200 nhưng lỗi nghiệp vụ
  if (errorOrRes && (errorOrRes.status && errorOrRes.status >= 400 || errorOrRes.errors?.length)) {
    msg = errorOrRes.message
      || (Array.isArray(errorOrRes.errors) && errorOrRes.errors[0]?.message?.[0])
      || defaultMessage;
  }

  // Case 2: Lỗi do HTTP error
  if (errorOrRes?.response?.data) {
    msg = errorOrRes.response.data.message
      || (Array.isArray(errorOrRes.response.data.errors) && errorOrRes.response.data.errors[0]?.message?.[0])
      || errorOrRes.response.data.errors
      || errorOrRes.message
      || defaultMessage;

    if (Array.isArray(msg)) msg = msg.join(', ');
    if (typeof msg === 'object') msg = JSON.stringify(msg);
  }

  if (!msg && errorOrRes?.message) {
    msg = errorOrRes.message;
  }

  toast.add({ severity: 'error', summary: 'Lỗi', detail: msg || defaultMessage, life: 4000 });
} 