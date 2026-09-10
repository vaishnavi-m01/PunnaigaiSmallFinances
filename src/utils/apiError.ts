export const parseApiError = (err: any): string => {
  if (typeof err === 'string' && err.trim() !== '') {
    return err;
  }

  const responseData = err?.response?.data;
  if (responseData) {
    if (typeof responseData.message === 'string' && responseData.message.trim() !== '') {
      return responseData.message;
    }
    if (typeof responseData.error === 'string' && responseData.error.trim() !== '') {
      return responseData.error;
    }
    if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      const first = responseData.errors[0];
      return typeof first === 'string' ? first : first.message || JSON.stringify(first);
    }
    if (typeof responseData.errors === 'object' && responseData.errors !== null) {
      const keys = Object.keys(responseData.errors);
      if (keys.length > 0) {
        const val = responseData.errors[keys[0]];
        if (Array.isArray(val) && val.length > 0) return String(val[0]);
        if (typeof val === 'string') return val;
      }
    }
    if (typeof responseData === 'string' && responseData.trim() !== '') {
      return responseData;
    }
  }

  if (err?.message && typeof err.message === 'string' && err.message.trim() !== '') {
    return err.message;
  }

  return 'An unexpected error occurred.';
};
