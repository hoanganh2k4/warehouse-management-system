import '../../App.css';
import { StatCard } from '../../components/StatCard';
import { AlertIcon, BoxIcon, GridIcon, LayersIcon, ScaleIcon, WarehouseIcon } from '../../components/icons';
import { useDashboard } from '../../hooks/useDashboard';

export default function Dashboard() {
  const { summary, loading, error, refetch } = useDashboard();

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p className="page-desc">Snapshot of warehouse activity right now.</p>
        </div>
      </div>

      {error ? (
        <div className="state-panel state-error">
          <AlertIcon size={22} />
          <p className="state-title">Couldn't load the dashboard</p>
          <p className="state-body">{error}. Check that the API is running and try again.</p>
          <button type="button" className="btn-primary" onClick={refetch}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="stat-row">
          <StatCard
            label="Sản phẩm"
            value={loading ? '—' : String(summary?.products ?? 0)}
            hint="Tổng số SKU"
            icon={<BoxIcon />}
          />
          <StatCard
            label="Lô hàng"
            value={loading ? '—' : String(summary?.batches ?? 0)}
            hint="Tổng số batch"
            icon={<LayersIcon />}
          />
          <StatCard
            label="Tồn kho"
            value={loading ? '—' : String(summary?.inventory ?? 0)}
            hint="Tổng số lượng hàng"
            icon={<ScaleIcon />}
          />
          <StatCard
            label="Slot trống"
            value={loading ? '—' : `${summary?.availableSlots ?? 0} / ${summary?.totalSlots ?? 0}`}
            hint="Trống / tổng số slot"
            icon={<GridIcon />}
          />
          <StatCard
            label="Tỉ lệ lấp đầy"
            value={loading ? '—' : `${summary?.occupancyPercent ?? 0}%`}
            hint="Slot đang sử dụng"
            icon={<WarehouseIcon />}
          />
          <StatCard
            label="Sắp hết hạn"
            value={loading ? '—' : String(summary?.expiringSoon ?? 0)}
            hint="Lô hàng cần chú ý"
            icon={<AlertIcon />}
          />
        </div>
      )}
    </main>
  );
}
