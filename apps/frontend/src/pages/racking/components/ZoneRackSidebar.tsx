import { WarehouseIcon, LayersIcon } from '../../../components/icons';
import type { Zone, Rack } from '../../../types';
import type { RackBucket } from '../racking.types';

type ZoneRackSidebarProps = {
  zones: Zone[];
  zonesLoading: boolean;
  zonesError: string | null;
  expandedZoneId: string | null;
  racksByZone: Record<string, RackBucket>;
  selectedRackId: string | null;
  onToggleZone: (zoneId: string) => void;
  onSelectRack: (zoneId: string, rackId: string) => void;
  onEditZone: (zone: Zone) => void;
  onDeleteZone: (zone: Zone) => void;
  onCreateZone: () => void;
  onCreateRack: (zoneId: string) => void;
};

export function ZoneRackSidebar({
  zones,
  zonesLoading,
  zonesError,
  expandedZoneId,
  racksByZone,
  selectedRackId,
  onToggleZone,
  onSelectRack,
  onEditZone,
  onDeleteZone,
  onCreateZone,
  onCreateRack,
}: ZoneRackSidebarProps) {
  return (
    <aside className="panel racking-tree">
      <div className="panel-header">
        <h2>Zones</h2>
        {!zonesLoading && !zonesError && (
          <span className="result-count">{zones.length} zone</span>
        )}
      </div>

      {zonesLoading && (
        <ul className="racking-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="racking-list-item skeleton-row">
              <span className="skeleton" style={{ width: '120px' }} />
            </li>
          ))}
        </ul>
      )}

      {!zonesLoading && zonesError && (
        <div className="racking-empty-state">
          <p>{zonesError}</p>
        </div>
      )}

      {!zonesLoading && !zonesError && zones.length === 0 && (
        <div className="racking-empty-state">
          <p>Chưa có Zone nào.</p>
        </div>
      )}

      {!zonesLoading && !zonesError && zones.length > 0 && (
        <ul className="racking-tree-list">
          {zones.map((zone) => {
            const isExpanded = expandedZoneId === zone.id;
            const bucket = racksByZone[zone.id];
            return (
              <li key={zone.id}>
                <div className="racking-tree-row">
                  <button
                    type="button"
                    className="racking-tree-expand"
                    onClick={() => onToggleZone(zone.id)}
                    aria-label={
                      isExpanded ? `Thu gọn Zone ${zone.code}` : `Mở rộng Zone ${zone.code}`
                    }
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                  <button
                    type="button"
                    className="racking-tree-label"
                    onClick={() => onToggleZone(zone.id)}
                  >
                    <WarehouseIcon size={15} />
                    <span>{zone.code}</span>
                  </button>
                  <button
                    type="button"
                    className="racking-list-item-edit"
                    onClick={() => onEditZone(zone)}
                    aria-label={`Sửa Zone ${zone.code}`}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="racking-list-item-delete"
                    onClick={() => onDeleteZone(zone)}
                    aria-label={`Xoá Zone ${zone.code}`}
                  >
                    Xoá
                  </button>
                </div>

                {isExpanded && (
                  <ul className="racking-tree-sublist">
                    {bucket?.loading &&
                      Array.from({ length: 2 }).map((_, i) => (
                        <li key={i} className="racking-tree-row skeleton-row">
                          <span className="skeleton" style={{ width: '90px' }} />
                        </li>
                      ))}

                    {!bucket?.loading && bucket?.error && (
                      <li className="racking-tree-empty">{bucket.error}</li>
                    )}

                    {!bucket?.loading &&
                      !bucket?.error &&
                      bucket?.loaded &&
                      bucket.items.length === 0 && (
                        <li className="racking-tree-empty">Chưa có Rack nào.</li>
                      )}

                    {!bucket?.loading &&
                      !bucket?.error &&
                      bucket?.items.map((rack: Rack) => (
                        <li key={rack.id} className="racking-tree-row">
                          <button
                            type="button"
                            className={`racking-tree-label is-rack${
                              selectedRackId === rack.id ? ' is-active' : ''
                            }`}
                            onClick={() => onSelectRack(zone.id, rack.id)}
                          >
                            <LayersIcon size={14} />
                            <span>{rack.code}</span>
                          </button>
                        </li>
                      ))}

                    <li>
                      <button
                        type="button"
                        className="racking-tree-add"
                        onClick={() => onCreateRack(zone.id)}
                      >
                        + Thêm Rack
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="racking-add-zone-footer">
        <button type="button" className="racking-add-zone-btn" onClick={onCreateZone}>
          + Thêm Zone
        </button>
      </div>
    </aside>
  );
}
