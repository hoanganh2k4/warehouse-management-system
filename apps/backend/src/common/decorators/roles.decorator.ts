import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Giới hạn route chỉ cho các role được liệt kê (khớp theo roles.name trong DB).
 * Dùng cùng với RolesGuard (đã đăng ký global trong app.module.ts).
 * Route không gắn @Roles(...) thì không bị giới hạn thêm — chỉ cần đăng nhập
 * (theo JwtAuthGuard) hoặc @Public() nếu route đó mở công khai.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
