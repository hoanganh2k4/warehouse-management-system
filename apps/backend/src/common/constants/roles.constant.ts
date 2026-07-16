// Tên role phải khớp chính xác với dữ liệu seed trong prisma/seed.ts (bảng roles.name).
// Role là dữ liệu động trong DB (không phải enum), nên đây chỉ là "hợp đồng" giữa
// seed data và các nơi dùng @Roles(...) — nếu đổi tên role trong seed, phải đổi ở đây.
export const MANAGER_ROLE = 'Quản lý';
export const STAFF_ROLE = 'Nhân viên kho';
