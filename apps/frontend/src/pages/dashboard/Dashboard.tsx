import { useEffect, useState } from 'react';
import '../../App.css';
import './Dashboard.css';
import { StatCard } from '../../components/StatCard';
import { InboundOutboundChart } from '../../components/InboundOutboundChart';
import { AlertIcon, BoxIcon, GridIcon, LayersIcon, ScaleIcon, WarehouseIcon } from '../../components/icons';
import { useDashboard } from '../../hooks/useDashboard';
import { useDashboardChart } from '../../hooks/useDashboardChart';
import { dashboardService } from '../../services/dashboard.service';
import type { DashboardExpiringBatch } from '../../types';
import { formatDate, getExpiryBadgeClass, getExpiryLabel } from '../../utils/expiry.utils';

export default function Dashboard() {
  const { summary, loading, error, refetch } = useDashboard();
  const [chartDays, setChartDays] = useState(14);
  const { data: chartData, loading: chartLoading } = useDashboardChart(chartDays);
  const [expiringBatches, setExpiringBatches] = useState<DashboardExpiringBatch[]>([]);
  const [expiringLoading, setExpiringLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    dashboardService
      .getExpiringBatches()
      .then((items) => {
        if (!cancelled) setExpiringBatches(items);
      })
      .finally(() => {
        if (!cancelled) setExpiringLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-content dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tổng quan</p>
          <h1>Dashboard</h1>
          <p className="page-desc">Toàn cảnh hoạt động kho hàng hiện tại.</p>
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
            hint="Số lượng slot, không tính dung lượng"
            icon={<GridIcon />}
          />
          <StatCard
            label="Tỉ lệ lấp đầy"
            value={loading ? '—' : `${summary?.occupancyPercent ?? 0}%`}
            hint="Theo dung lượng đã dùng"
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


      {!error && (
        <div className="panel expiry-panel">
          <div className="panel-header">
            <div className="panel-header-title-group">
              <h2>Lô sắp hết hạn / đã hết hạn</h2>
              <span className="result-count">{expiringBatches.length} lô cần chú ý</span>
            </div>
          </div>
          {expiringLoading ? (
            <div className="state-panel"><p className="state-body">Đang tải dữ liệu hạn sử dụng...</p></div>
          ) : expiringBatches.length === 0 ? (
            <div className="state-panel"><p className="state-body">Không có lô hàng sắp hết hạn.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="product-table expiry-table">
                <thead>
                  <tr>
                    <th>Lô hàng</th>
                    <th>Sản phẩm</th>
                    <th>Hạn sử dụng</th>
                    <th>Trạng thái</th>
                    <th>Số lượng</th>
                    <th>Vị trí</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringBatches.map((batch) => (
                    <tr key={batch.batchId}>
                      <td><span className="sku-code">{batch.batchCode}</span></td>
                      <td>{batch.productSkuCode} — {batch.productName}</td>
                      <td>{formatDate(batch.expiryDate)}</td>
                      <td>
                        <span className={getExpiryBadgeClass(batch.expiryStatus)}>
                          {getExpiryLabel(batch.expiryStatus, batch.daysUntilExpiry)}
                        </span>
                      </td>
                      <td>{batch.quantity}</td>
                      <td>{batch.locations.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!error && (
        <div className="panel chart-panel">
          <div className="panel-header">
            <div className="panel-header-title-group">
              <h2>Nhập / Xuất kho</h2>
              <span className="result-count">Tổng hợp theo ngày</span>
            </div>
            <select
              className="chart-range-select"
              value={chartDays}
              onChange={(e) => setChartDays(Number(e.target.value))}
            >
              <option value={7}>7 ngày qua</option>
              <option value={14}>14 ngày qua</option>
              <option value={30}>30 ngày qua</option>
            </select>
          </div>
          <div className="chart-panel-body">
            <InboundOutboundChart data={chartData} loading={chartLoading} />
          </div>
        </div>
      )}
    </main>
  );
}
