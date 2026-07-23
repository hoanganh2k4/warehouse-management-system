import { useEffect, useState } from 'react';
import '../../App.css';
import { TransactionTable } from '../../components/TransactionTable';
import { TransactionDetailModal } from '../../components/TransactionDetailModal';
import { ScheduleTable } from '../../components/ScheduleTable';
import { ScheduleDetailModal } from '../../components/ScheduleDetailModal';
import { InboundScheduleModal } from '../../components/InboundScheduleModal';
import { OutboundScheduleModal } from '../../components/OutboundScheduleModal';
import { ExecuteScheduleDialog } from '../../components/ExecuteScheduleDialog';
import { Toast } from '../../components/Toast';
import { CalendarPlusIcon } from '../../components/icons';
import { useTransactions } from '../../hooks/useTransactions';
import { useSchedules } from '../../hooks/useSchedules';
import { scheduleService } from '../../services/schedule.service';
import { productService } from '../../services/product.service';
import type { Product, Schedule, TransactionType } from '../../types';

type MainTab = 'history' | 'schedule';

export default function TransactionList() {
  const [activeTab, setActiveTab] = useState<MainTab>('history');

  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [productIdFilter, setProductIdFilter] = useState('');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [detailTransactionId, setDetailTransactionId] = useState<string | null>(null);

  // ---- Tab "Lịch nhập / xuất" ----
  const [schedulePage, setSchedulePage] = useState(1);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);
  const [outboundModalOpen, setOutboundModalOpen] = useState(false);
  const [executingSchedule, setExecutingSchedule] = useState<Schedule | null>(null);
  const [scheduleToast, setScheduleToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const {
    items: schedules,
    meta: scheduleMeta,
    loading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useSchedules({ page: schedulePage, limit: 20 }, activeTab === 'schedule');

  function handleOpenScheduleModal(kind: 'inbound' | 'outbound') {
    if (kind === 'inbound') setInboundModalOpen(true);
    else setOutboundModalOpen(true);
  }

  function handleScheduleCreated(kind: 'inbound' | 'outbound') {
    if (kind === 'inbound') setInboundModalOpen(false);
    else setOutboundModalOpen(false);
    setScheduleToast({
      message: kind === 'inbound' ? 'Đã đặt lịch nhập kho thành công.' : 'Đã đặt lịch xuất kho thành công.',
      type: 'success',
    });
    setSchedulePage(1);
    refetchSchedules();
  }

  function handleExecuteSchedule(schedule: Schedule) {
    setExecutingSchedule(schedule);
  }

  function handleScheduleExecuted() {
    setExecutingSchedule(null);
    setScheduleToast({ message: 'Đã thực hiện lịch thành công.', type: 'success' });
    refetchSchedules();
  }

  function handleEditSchedule() {
    setScheduleToast({
      message: 'Chức năng "Sửa lịch" sẽ được bổ sung ở bước tiếp theo.',
      type: 'success',
    });
  }

  async function handleCancelSchedule(schedule: Schedule) {
    const confirmed = window.confirm(
      `Hủy lịch ${schedule.type === 'INBOUND' ? 'nhập' : 'xuất'} kho cho sản phẩm "${
        schedule.product?.name ?? ''
      }"?`,
    );
    if (!confirmed) return;

    setCancellingId(schedule.id);
    try {
      await scheduleService.cancelSchedule(schedule.id);
      setScheduleToast({ message: 'Đã hủy lịch thành công.', type: 'success' });
      refetchSchedules();
    } catch (err) {
      setScheduleToast({
        message: err instanceof Error ? err.message : 'Không thể hủy lịch. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    productService
      .getProducts({ page: 1, limit: 100 })
      .then((result) => {
        if (!cancelled) setProducts(result.items);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { items, meta, loading, error } = useTransactions({
    page,
    limit: 20,
    type: typeFilter || undefined,
    from: fromFilter || undefined,
    to: toFilter || undefined,
    productId: productIdFilter || undefined,
  });

  const totalCount = meta?.total ?? 0;

  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Lịch sử giao dịch</h1>
          <p className="page-desc">
            Nhật ký nhập/xuất/di chuyển hàng trong kho, được sinh tự động từ các thao tác kho.
          </p>
        </div>

        <div className="page-header-controls">
          <select
            className="sort-select"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as TransactionType | '');
              setPage(1);
            }}
            aria-label="Lọc theo loại giao dịch"
          >
            <option value="">Tất cả loại</option>
            <option value="IMPORT">Nhập kho</option>
            <option value="EXPORT">Xuất kho</option>
          </select>

          <select
            className="sort-select"
            value={productIdFilter}
            disabled={productsLoading}
            onChange={(event) => {
              setProductIdFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Lọc theo sản phẩm"
          >
            <option value="">{productsLoading ? 'Đang tải sản phẩm...' : 'Tất cả sản phẩm'}</option>
            {!productsLoading &&
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.skuCode} — {product.name}
                </option>
              ))}
          </select>

          <div className="filter-field">
            <label className="filter-field-label" htmlFor="txn-from-date">
              Từ ngày
            </label>
            <input
              id="txn-from-date"
              type="date"
              className="filter-input"
              value={fromFilter}
              onChange={(event) => {
                setFromFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="filter-field">
            <label className="filter-field-label" htmlFor="txn-to-date">
              Đến ngày
            </label>
            <input
              id="txn-to-date"
              type="date"
              className="filter-input"
              value={toFilter}
              onChange={(event) => {
                setToFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="schedule-header-actions">
            <button
              type="button"
              className="btn-schedule btn-schedule-inbound"
              onClick={() => handleOpenScheduleModal('inbound')}
            >
              <CalendarPlusIcon size={16} />
              Đặt lịch nhập
            </button>
            <button
              type="button"
              className="btn-schedule btn-schedule-outbound"
              onClick={() => handleOpenScheduleModal('outbound')}
            >
              <CalendarPlusIcon size={16} />
              Đặt lịch xuất
            </button>
          </div>
        </div>
      </div>

      <nav className="tab-nav" aria-label="Chuyển đổi giữa lịch sử giao dịch và lịch nhập/xuất">
        <button
          type="button"
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử giao dịch
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Lịch nhập / xuất
        </button>
      </nav>

      {activeTab === 'history' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Toàn bộ giao dịch</h2>
            {!loading && !error && (
              <span className="result-count">
                {items.length} of {totalCount}
              </span>
            )}
          </div>

          <TransactionTable
            items={items}
            totalCount={totalCount}
            loading={loading}
            error={error}
            onViewDetail={(transaction) => setDetailTransactionId(transaction.id)}
          />

          <div className="pagination-controls">
            <button disabled={loading || page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trang trước
            </button>
            <span>
              Trang {page} / {meta?.totalPages ?? 1}
            </span>
            <button
              disabled={loading || !meta || page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </button>
          </div>
        </section>
      )}

      {activeTab === 'schedule' && (
        <section className="panel">
          <div className="panel-header">
            <h2>Lịch nhập / xuất</h2>
            {!schedulesLoading && !schedulesError && (
              <span className="result-count">
                {schedules.length} of {scheduleMeta?.total ?? 0}
              </span>
            )}
          </div>

          <ScheduleTable
            items={schedules}
            totalCount={scheduleMeta?.total ?? 0}
            loading={schedulesLoading}
            error={schedulesError}
            cancellingId={cancellingId}
            onExecute={handleExecuteSchedule}
            onEdit={handleEditSchedule}
            onCancel={handleCancelSchedule}
            onViewDetail={(schedule) => setDetailSchedule(schedule)}
          />

          <div className="pagination-controls">
            <button
              disabled={schedulesLoading || schedulePage <= 1}
              onClick={() => setSchedulePage((p) => p - 1)}
            >
              Trang trước
            </button>
            <span>
              Trang {schedulePage} / {scheduleMeta?.totalPages ?? 1}
            </span>
            <button
              disabled={
                schedulesLoading || !scheduleMeta || schedulePage >= scheduleMeta.totalPages
              }
              onClick={() => setSchedulePage((p) => p + 1)}
            >
              Trang sau
            </button>
          </div>
        </section>
      )}

      {detailTransactionId && (
        <TransactionDetailModal
          transactionId={detailTransactionId}
          onClose={() => setDetailTransactionId(null)}
        />
      )}

      {detailSchedule && (
        <ScheduleDetailModal schedule={detailSchedule} onClose={() => setDetailSchedule(null)} />
      )}

      {inboundModalOpen && (
        <InboundScheduleModal
          onClose={() => setInboundModalOpen(false)}
          onCreated={() => handleScheduleCreated('inbound')}
        />
      )}

      {outboundModalOpen && (
        <OutboundScheduleModal
          onClose={() => setOutboundModalOpen(false)}
          onCreated={() => handleScheduleCreated('outbound')}
        />
      )}

      {executingSchedule && (
        <ExecuteScheduleDialog
          schedule={executingSchedule}
          onClose={() => setExecutingSchedule(null)}
          onExecuted={handleScheduleExecuted}
        />
      )}

      {scheduleToast && (
        <Toast
          message={scheduleToast.message}
          type={scheduleToast.type}
          onClose={() => setScheduleToast(null)}
        />
      )}
    </main>
  );
}
