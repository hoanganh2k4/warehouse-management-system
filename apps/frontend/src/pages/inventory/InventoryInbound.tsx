import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { InboundForm } from '../../components/InboundForm';
import { Toast } from '../../components/Toast';
import { inventoryService } from '../../services/inventory.service';
import type { InboundPayload } from '../../types';

export default function InventoryInbound() {
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(
    null,
  );
  const navigate = useNavigate();

  async function handleSubmit(payload: InboundPayload) {
    setSubmitting(true);
    try {
      await inventoryService.inbound(payload);
      setToast({ message: 'Nhập kho thành công.', type: 'success' });
      navigate('/inventory');
    } catch (err) {
      const message = isAxiosError(err)
        ? (err.message ?? 'Không thể nhập kho. Vui lòng thử lại.')
        : 'Không thể nhập kho. Vui lòng thử lại.';
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
          <h1>Nhập kho</h1>
          <p className="page-desc">Ghi nhận lô hàng mới nhập vào kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin nhập kho</h2>
        </div>

        <InboundForm onSubmit={handleSubmit} submitting={submitting} />
      </section>
    </main>
  );
}
