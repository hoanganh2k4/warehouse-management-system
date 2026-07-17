import { useEffect, useState } from 'react';
import { zoneService } from '../services/zone.service';
import { rackService } from '../services/rack.service';
import { levelService } from '../services/level.service';
import { slotService } from '../services/slot.service';
import type { Level, OverrideLocationPayload, Rack, ScheduleOverrideReasonCode, Slot, Zone } from '../types';
import { OVERRIDE_REASON_OPTIONS } from '../utils/schedule.utils';

type OverrideLocationModalProps = {
  onClose: () => void;
  onSave: (payload: OverrideLocationPayload) => void;
  saving: boolean;
};

export function OverrideLocationModal({ onClose, onSave, saving }: OverrideLocationModalProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [zoneId, setZoneId] = useState('');
  const [rackId, setRackId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [reason, setReason] = useState<ScheduleOverrideReasonCode | ''>('');
  const [reasonNote, setReasonNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    zoneService.getAll().then(setZones);
  }, []);

  useEffect(() => {
    function resetRack() {
      setRackId('');
      setRacks([]);
      if (!zoneId) return;
      rackService.getAll(zoneId).then(setRacks);
    }
    resetRack();
  }, [zoneId]);

  useEffect(() => {
    function resetLevel() {
      setLevelId('');
      setLevels([]);
      if (!rackId) return;
      levelService.getAll(rackId).then(setLevels);
    }
    resetLevel();
  }, [rackId]);

  useEffect(() => {
    function resetSlot() {
      setSlotId('');
      setSlots([]);
      if (!levelId) return;
      slotService.getAll({ levelId, page: 1, limit: 100 }).then((result) => setSlots(result.items));
    }
    resetSlot();
  }, [levelId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!slotId) {
      setError('Vui lòng chọn đầy đủ Zone / Rack / Level / Slot');
      return;
    }
    if (!reason) {
      setError('Vui lòng chọn lý do thay đổi');
      return;
    }
    if (reason === 'OTHER' && !reasonNote.trim()) {
      setError('Vui lòng nhập nội dung lý do');
      return;
    }

    onSave({
      slotId,
      reason,
      reasonNote: reason === 'OTHER' ? reasonNote.trim() : undefined,
    });
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog-title">Điều chỉnh vị trí lưu trữ</h3>

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="ov-zone">
              Zone
            </label>
            <select
              id="ov-zone"
              className="form-input"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
            >
              <option value="">-- Chọn Zone --</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ov-rack">
              Rack
            </label>
            <select
              id="ov-rack"
              className="form-input"
              value={rackId}
              disabled={!zoneId}
              onChange={(e) => setRackId(e.target.value)}
            >
              <option value="">-- Chọn Rack --</option>
              {racks.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ov-level">
              Level
            </label>
            <select
              id="ov-level"
              className="form-input"
              value={levelId}
              disabled={!rackId}
              onChange={(e) => setLevelId(e.target.value)}
            >
              <option value="">-- Chọn Level --</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  Level {l.levelNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ov-slot">
              Slot
            </label>
            <select
              id="ov-slot"
              className="form-input"
              value={slotId}
              disabled={!levelId}
              onChange={(e) => setSlotId(e.target.value)}
            >
              <option value="">-- Chọn Slot --</option>
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} ({s.availableCapacity}/{s.maxCapacity} trống)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ov-reason">
              Lý do thay đổi
            </label>
            <select
              id="ov-reason"
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value as ScheduleOverrideReasonCode)}
            >
              <option value="">-- Chọn lý do --</option>
              {OVERRIDE_REASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {reason === 'OTHER' && (
            <div className="form-group">
              <label className="form-label" htmlFor="ov-reasonNote">
                Nội dung lý do
              </label>
              <textarea
                id="ov-reasonNote"
                className="form-input"
                rows={2}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
              />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu vị trí'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
