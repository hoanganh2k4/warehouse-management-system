import { getExpiryStatus } from './expiry.util';

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

describe('getExpiryStatus', () => {
  it('trả về EXPIRED khi ngày hết hạn đã qua', () => {
    const result = getExpiryStatus(daysFromNow(-1));
    expect(result.status).toBe('EXPIRED');
    expect(result.daysUntilExpiry).toBe(-1);
  });

  it('trả về CRITICAL khi còn từ 0 đến 7 ngày', () => {
    expect(getExpiryStatus(daysFromNow(0)).status).toBe('CRITICAL');
    expect(getExpiryStatus(daysFromNow(7)).status).toBe('CRITICAL');
  });

  it('trả về WARNING khi còn từ 8 đến 30 ngày', () => {
    expect(getExpiryStatus(daysFromNow(8)).status).toBe('WARNING');
    expect(getExpiryStatus(daysFromNow(30)).status).toBe('WARNING');
  });

  it('trả về OK khi còn hơn 30 ngày', () => {
    const result = getExpiryStatus(daysFromNow(31));
    expect(result.status).toBe('OK');
    expect(result.daysUntilExpiry).toBe(31);
  });
});
