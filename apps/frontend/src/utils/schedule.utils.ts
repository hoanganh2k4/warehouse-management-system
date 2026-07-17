import type { ScheduleOverrideReasonCode, SchedulePriority, ScheduleStatus, ScheduleType } from '../types';

export function scheduleTypeLabel(type: ScheduleType) {
  return type === 'INBOUND' ? 'Đặt lịch nhập' : 'Đặt lịch xuất';
}

export function scheduleTypeBadgeClass(type: ScheduleType) {
  return type === 'INBOUND' ? 'badge badge-success' : 'badge badge-danger';
}

export function scheduleStatusLabel(status: ScheduleStatus) {
  switch (status) {
    case 'PENDING':
      return '🟡 Chờ thực hiện';
    case 'IN_PROGRESS':
      return '🔵 Đang thực hiện';
    case 'COMPLETED':
      return '🟢 Hoàn thành';
    case 'CANCELLED':
      return '🔴 Đã hủy';
  }
}

export function scheduleStatusBadgeClass(status: ScheduleStatus) {
  switch (status) {
    case 'PENDING':
      return 'badge badge-warning';
    case 'IN_PROGRESS':
      return 'badge badge-info';
    case 'COMPLETED':
      return 'badge badge-success';
    case 'CANCELLED':
      return 'badge badge-danger';
  }
}

export function priorityLabel(priority: SchedulePriority) {
  switch (priority) {
    case 'HIGH':
      return '🟢 Cao';
    case 'MEDIUM':
      return '🟡 Trung bình';
    case 'LOW':
      return '🔴 Thấp';
  }
}

export function priorityBadgeClass(priority: SchedulePriority) {
  switch (priority) {
    case 'HIGH':
      return 'badge badge-success';
    case 'MEDIUM':
      return 'badge badge-warning';
    case 'LOW':
      return 'badge badge-danger';
  }
}

export const OVERRIDE_REASON_OPTIONS: { value: ScheduleOverrideReasonCode; label: string }[] = [
  { value: 'SLOT_MAINTENANCE', label: 'Slot đang bảo trì' },
  { value: 'SLOT_FULL', label: 'Slot đã đầy' },
  { value: 'FORKLIFT_UNAVAILABLE', label: 'Xe nâng không thể tiếp cận' },
  { value: 'MANAGEMENT_REQUEST', label: 'Theo yêu cầu quản lý' },
  { value: 'OTHER', label: 'Khác' },
];
