import { isAxiosError } from 'axios';
import type { Level, Rack, Slot } from '../../types';

export type DeleteTarget =
  | { type: 'zone'; id: string; label: string }
  | { type: 'rack'; id: string; label: string; zoneId: string }
  | { type: 'level'; id: string; label: string }
  | { type: 'slot'; id: string; label: string };

export type RackBucket = { items: Rack[]; loading: boolean; error: string | null; loaded: boolean };

export type GridRow = { level: Level; slots: Slot[] };

export type SlotStatus = 'empty' | 'partial' | 'full';

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : data.message;
    }
  }
  return fallback;
}

export function slotStatus(slot: Slot): SlotStatus {
  if (slot.occupancyRate <= 0) return 'empty';
  if (slot.occupancyRate >= 100) return 'full';
  return 'partial';
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
