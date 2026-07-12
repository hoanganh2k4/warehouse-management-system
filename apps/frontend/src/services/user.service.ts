import { apiClient } from '../lib/api-client';
import type { PaginatedResult, TeamMember, GetTeamMembersParams } from '../types';

export const userService = {
  getTeamMembers(params: GetTeamMembersParams): Promise<PaginatedResult<TeamMember>> {
    return apiClient.get('/users', { params });
  },
};