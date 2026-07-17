import { apiClient } from '../lib/api-client';
import type {
  CreateInboundSchedulePayload,
  CreateInboundScheduleResult,
  CreateOutboundSchedulePayload,
  CreateOutboundScheduleResult,
  ExecutePreviewResult,
  ExecuteSchedulePayload,
  ExecuteScheduleResult,
  GetSchedulesParams,
  InboundSuggestionPreviewPayload,
  InboundSuggestionResult,
  OutboundSuggestionPreviewPayload,
  OutboundSuggestionResult,
  PaginatedResult,
  Schedule,
  UpdateSchedulePayload,
} from '../types';

export const scheduleService = {
  getSchedules(params: GetSchedulesParams): Promise<PaginatedResult<Schedule>> {
    return apiClient.get('/schedules', { params });
  },

  getScheduleById(id: string): Promise<Schedule> {
    return apiClient.get(`/schedules/${id}`);
  },

  cancelSchedule(id: string, reason?: string): Promise<Schedule> {
    return apiClient.patch(`/schedules/${id}/cancel`, { reason });
  },

  updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<Schedule> {
    return apiClient.patch(`/schedules/${id}`, payload);
  },

  // ---- Đặt lịch nhập / Smart Location Suggestion ----

  previewInbound(payload: InboundSuggestionPreviewPayload): Promise<InboundSuggestionResult> {
    return apiClient.post('/schedules/inbound/preview', payload);
  },

  createInbound(payload: CreateInboundSchedulePayload): Promise<CreateInboundScheduleResult> {
    return apiClient.post('/schedules/inbound', payload);
  },

  // ---- Đặt lịch xuất / Smart Picking Suggestion (FEFO) ----

  previewOutbound(payload: OutboundSuggestionPreviewPayload): Promise<OutboundSuggestionResult> {
    return apiClient.post('/schedules/outbound/preview', payload);
  },

  createOutbound(payload: CreateOutboundSchedulePayload): Promise<CreateOutboundScheduleResult> {
    return apiClient.post('/schedules/outbound', payload);
  },

  // ---- Thực hiện lịch ----

  previewExecute(id: string): Promise<ExecutePreviewResult> {
    return apiClient.post(`/schedules/${id}/execute/preview`);
  },

  executeSchedule(id: string, payload: ExecuteSchedulePayload): Promise<ExecuteScheduleResult> {
    return apiClient.post(`/schedules/${id}/execute`, payload);
  },
};
