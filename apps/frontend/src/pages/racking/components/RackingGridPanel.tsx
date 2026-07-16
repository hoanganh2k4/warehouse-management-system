import type { Level, Rack, Slot, Zone } from '../../../types';
import type { GridRow } from '../racking.types';
import { slotStatus } from '../racking.types';

type RackingGridPanelProps = {
  selectedRackId: string | null;
  selectedZone: Zone | null;
  selectedRack: Rack | null;
  gridRows: GridRow[];
  gridLoading: boolean;
  gridError: string | null;
  columns: string[];
  openLevelMenuId: string | null;
  onSetOpenLevelMenuId: (id: string | null) => void;
  onCreateLevel: () => void;
  onEditRack: () => void;
  onDeleteRack: () => void;
  onEditLevel: (level: Level) => void;
  onDeleteLevel: (level: Level) => void;
  onCreateSlot: (levelId: string) => void;
  onOpenSlotDetail: (slot: Slot) => void;
};

export function RackingGridPanel({
  selectedRackId,
  selectedZone,
  selectedRack,
  gridRows,
  gridLoading,
  gridError,
  columns,
  openLevelMenuId,
  onSetOpenLevelMenuId,
  onCreateLevel,
  onEditRack,
  onDeleteRack,
  onEditLevel,
  onDeleteLevel,
  onCreateSlot,
  onOpenSlotDetail,
}: RackingGridPanelProps) {
  return (
    <section className="panel racking-grid-panel">
      {!selectedRackId && (
        <div className="racking-empty-state">
          <p>Chọn Zone rồi chọn Rack ở bên trái để xem sơ đồ kho.</p>
        </div>
      )}

      {selectedRackId && (
        <>
          <div className="warehouse-map-panel-header">
            <p className="warehouse-map-caption">
              {selectedZone?.code} – {selectedRack?.code}
            </p>
            {selectedRack && (
              <div className="warehouse-map-panel-header-actions">
                <button
                  type="button"
                  className="btn-secondary racking-add-btn"
                  onClick={onCreateLevel}
                >
                  + Thêm Level
                </button>
                <button type="button" className="racking-list-item-edit" onClick={onEditRack}>
                  Sửa Rack
                </button>
                <button type="button" className="racking-list-item-delete" onClick={onDeleteRack}>
                  Xoá Rack
                </button>
              </div>
            )}
          </div>

          <ul className="warehouse-map-legend">
            <li>
              <span className="warehouse-map-legend-dot is-empty" /> Trống
            </li>
            <li>
              <span className="warehouse-map-legend-dot is-partial" /> Đang sử dụng
            </li>
            <li>
              <span className="warehouse-map-legend-dot is-full" /> Đầy
            </li>
          </ul>

          {gridLoading && (
            <div className="warehouse-map-skeleton">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="skeleton" style={{ height: '40px' }} />
              ))}
            </div>
          )}

          {!gridLoading && gridError && (
            <div className="racking-empty-state">
              <p>{gridError}</p>
            </div>
          )}

          {!gridLoading && !gridError && gridRows.length === 0 && (
            <div className="racking-empty-state">
              <p>Rack này chưa có Level nào.</p>
            </div>
          )}

          {!gridLoading && !gridError && gridRows.length > 0 && (
            <div className="warehouse-map-scroll">
              <div className="warehouse-map-grid">
                {gridRows.map(({ level, slots }) => {
                  const codeToSlot = new Map(slots.map((slot) => [slot.code, slot]));
                  const menuOpen = openLevelMenuId === level.id;
                  return (
                    <div className="warehouse-map-row" key={level.id}>
                      <div className="warehouse-map-row-lead">
                        <span className="warehouse-map-row-label">L{level.levelNumber}</span>
                      </div>
                      <div className="warehouse-map-cells">
                        {columns.map((code) => {
                          const slot = codeToSlot.get(code);
                          if (!slot) {
                            return (
                              <span
                                key={code}
                                className="warehouse-map-cell is-placeholder"
                                aria-hidden="true"
                              />
                            );
                          }
                          const status = slotStatus(slot);
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`warehouse-map-cell is-${status}`}
                              onClick={() => onOpenSlotDetail(slot)}
                              title={`${slot.code} — ${Math.round(slot.occupancyRate)}%`}
                              aria-label={`Slot ${slot.code}, ${Math.round(slot.occupancyRate)}% lấp đầy`}
                            />
                          );
                        })}
                        <button
                          type="button"
                          className="warehouse-map-cell is-add"
                          onClick={() => onCreateSlot(level.id)}
                          aria-label={`Thêm Slot vào Tầng ${level.levelNumber}`}
                          title="Thêm Slot"
                        >
                          +
                        </button>
                        <div className="row-menu">
                          <button
                            type="button"
                            className="row-menu-trigger"
                            onClick={() => onSetOpenLevelMenuId(menuOpen ? null : level.id)}
                            aria-label={`Hành động cho Tầng ${level.levelNumber}`}
                            aria-expanded={menuOpen}
                          >
                            ⋮
                          </button>
                          {menuOpen && (
                            <>
                              <div
                                className="row-menu-backdrop"
                                onClick={() => onSetOpenLevelMenuId(null)}
                              />
                              <div className="row-menu-popover">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSetOpenLevelMenuId(null);
                                    onEditLevel(level);
                                  }}
                                >
                                  Sửa
                                </button>
                                <button
                                  type="button"
                                  className="is-danger"
                                  onClick={() => {
                                    onSetOpenLevelMenuId(null);
                                    onDeleteLevel(level);
                                  }}
                                >
                                  Xoá
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {columns.length > 0 && (
                  <div className="warehouse-map-row warehouse-map-col-labels">
                    <span className="warehouse-map-row-lead" aria-hidden="true" />
                    <div className="warehouse-map-cells">
                      {columns.map((code) => (
                        <span key={code} className="warehouse-map-cell-label">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
