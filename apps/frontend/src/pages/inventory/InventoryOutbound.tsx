import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { OutboundForm } from '../../components/OutboundForm';
import { Toast } from '../../components/Toast';
import { inventoryService } from '../../services/inventory.service';
import type { OutboundPayload } from '../../types';

export default function InventoryOutbound() {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );
  const navigate = useNavigate();

  async function handleSubmit(payload: OutboundPayload) {
    setSubmitting(true);
    try {
      await inventoryService.outbound(payload);
      setToast({ message: 'Xuất kho thành công.', type: 'success' });
      navigate('/inventory');
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.message ?? 'Không thể xuất kho. Vui lòng thử lại.')
        : 'Không thể xuất kho. Vui lòng thử lại.';
      setToast({ message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-content">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Kho hàng</p>
          <h1>Xuất kho</h1>
          <p className="page-desc">Ghi nhận lô hàng xuất ra khỏi kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin xuất kho</h2>
        </div>

        <OutboundForm onSubmit={handleSubmit} submitting={submitting} />
      </section>
    </main>
  );
}
