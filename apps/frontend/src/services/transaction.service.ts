import { apiClient } from '../lib/api-client';
import type { GetTransactionsParams, PaginatedResult, Transaction } from '../types';

export const transactionService = {
  getTransactions(params: GetTransactionsParams): Promise<PaginatedResult<Transaction>> {
    return apiClient.get('/transactions', { params });
  },
};
