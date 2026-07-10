import axios, { AxiosError } from 'axios';

/**
 * apiClient — axios instance dùng chung cho toàn bộ app.
 *
 * Backend luôn trả về theo 1 khuôn:
 *  - Thành công: { success: true, data: <dữ liệu thật> }
 *  - Thất bại:   { success: false, message: "<mô tả lỗi>" }
 *
 * Interceptor bên dưới "bóc vỏ" response thành công (trả thẳng `data`),
 * và ném lỗi (throw) với message rõ ràng khi backend báo thất bại,
 * hoặc khi có lỗi HTTP (4xx/5xx) / lỗi mạng.
 *
 * => Mọi service chỉ cần viết:
 *    const products = await apiClient.get('/products');
 *    // products chính là phần `data` đã bóc vỏ, KHÔNG phải { success, data }
 */
export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;

    // Backend báo thất bại nhưng vẫn trả HTTP 2xx -> ném lỗi để service/hook xử lý qua catch
    if (body && body.success === false) {
      return Promise.reject(new Error(body.message ?? 'Request failed'));
    }

    // Bóc vỏ: trả thẳng phần `data`, không trả nguyên object { success, data }
    return body?.data;
  },
  (error: AxiosError<{ message?: string }>) => {
    // Lỗi HTTP (401, 404, 409, 500...) hoặc lỗi mạng (không có response) đều rơi vào đây
    const message =
      error.response?.data?.message ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
