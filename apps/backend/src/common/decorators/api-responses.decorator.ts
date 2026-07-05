import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dto/api-response.dto';
import { ERROR_EXAMPLES } from '../swagger/swagger-examples';

type ErrorExample = (typeof ERROR_EXAMPLES)[keyof typeof ERROR_EXAMPLES];

function errorContent(
  examples: Record<string, { summary: string; value: ErrorExample }>,
) {
  return {
    'application/json': {
      schema: { $ref: getSchemaPath(ApiErrorResponseDto) },
      examples,
    },
  };
}

/** 400 — Lỗi validation */
export function ApiValidationError(
  extraExamples: Record<string, ErrorExample> = {},
) {
  const examples: Record<string, { summary: string; value: ErrorExample }> = {
    validation: { summary: 'Lỗi validation', value: ERROR_EXAMPLES.validation },
    ...Object.fromEntries(
      Object.entries(extraExamples).map(([key, value]) => [
        key,
        { summary: key, value },
      ]),
    ),
  };
  return ApiBadRequestResponse({
    description: '400 Bad Request — Dữ liệu không hợp lệ (validation)',
    content: errorContent(examples),
  });
}

/** 401 — Chưa đăng nhập / token không hợp lệ */
export function ApiUnauthorizedError() {
  return ApiUnauthorizedResponse({
    description: '401 Unauthorized — Thiếu hoặc sai JWT token',
    content: errorContent({
      unauthorized: {
        summary: 'Token không hợp lệ',
        value: ERROR_EXAMPLES.unauthorized,
      },
      invalidCredentials: {
        summary: 'Sai tài khoản/mật khẩu',
        value: ERROR_EXAMPLES.invalidCredentials,
      },
    }),
  });
}

/** 403 — Không có quyền */
export function ApiForbiddenError() {
  return ApiForbiddenResponse({
    description: '403 Forbidden — Không có quyền truy cập',
    content: errorContent({
      forbidden: { summary: 'Không có quyền', value: ERROR_EXAMPLES.forbidden },
    }),
  });
}

/** 404 — Không tìm thấy */
export function ApiNotFoundError(examples: Record<string, ErrorExample> = {}) {
  const merged: Record<string, { summary: string; value: ErrorExample }> = {
    notFound: { summary: 'Không tìm thấy', value: ERROR_EXAMPLES.notFound },
    ...Object.fromEntries(
      Object.entries(examples).map(([key, value]) => [
        key,
        { summary: value.message, value },
      ]),
    ),
  };
  return ApiNotFoundResponse({
    description: '404 Not Found — Không tìm thấy tài nguyên',
    content: errorContent(merged),
  });
}

/** 409 — Xung đột dữ liệu */
export function ApiConflictError(examples: Record<string, ErrorExample> = {}) {
  const merged: Record<string, { summary: string; value: ErrorExample }> = {
    conflict: { summary: 'Xung đột', value: ERROR_EXAMPLES.conflict },
    ...Object.fromEntries(
      Object.entries(examples).map(([key, value]) => [
        key,
        { summary: value.message, value },
      ]),
    ),
  };
  return ApiConflictResponse({
    description: '409 Conflict — Dữ liệu bị trùng hoặc không thể thực hiện',
    content: errorContent(merged),
  });
}

/** Response thành công 200 với example */
export function ApiSuccessExample(
  example: object,
  description = '200 OK — Thành công',
  type?: Type<unknown>,
) {
  return ApiOkResponse({
    description,
    ...(type ? { type } : {}),
    content: {
      'application/json': {
        examples: {
          success: { summary: 'Thành công', value: example },
        },
      },
    },
  });
}

/** Response tạo mới 201 với example */
export function ApiCreatedExample(
  example: object,
  description = '201 Created — Tạo thành công',
) {
  return ApiCreatedResponse({
    description,
    content: {
      'application/json': {
        examples: {
          success: { summary: 'Tạo thành công', value: example },
        },
      },
    },
  });
}

/** Bộ lỗi chuẩn cho endpoint cần auth (GET/PUT/DELETE theo id) */
export function ApiAuthReadErrors(
  notFound: ErrorExample = ERROR_EXAMPLES.notFound,
) {
  return applyDecorators(
    ApiUnauthorizedError(),
    ApiForbiddenError(),
    ApiNotFoundError({ notFound }),
  );
}

/** Bộ lỗi chuẩn cho endpoint ghi (POST/PUT) cần auth */
export function ApiAuthWriteErrors(options?: {
  notFound?: ErrorExample;
  conflict?: Record<string, ErrorExample>;
}) {
  return applyDecorators(
    ApiValidationError(),
    ApiUnauthorizedError(),
    ApiForbiddenError(),
    ApiNotFoundError(options?.notFound ? { notFound: options.notFound } : {}),
    ...(options?.conflict ? [ApiConflictError(options.conflict)] : []),
  );
}

/** Bộ lỗi chuẩn cho endpoint public GET */
export function ApiPublicReadErrors(
  notFound: ErrorExample = ERROR_EXAMPLES.notFound,
) {
  return applyDecorators(ApiNotFoundError({ notFound }));
}
