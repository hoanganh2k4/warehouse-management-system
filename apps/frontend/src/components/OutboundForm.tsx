import { useEffect, useState } from 'react';
import { productService } from '../services/product.service';
import type { OutboundPayload, Product } from '../types';

type OutboundFormProps = {
  onSubmit: (payload: OutboundPayload) => void;
  submitting: boolean;
};

type FormState = {
  productId: string;
  quantity: string;
  note: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  productId: '',
  quantity: '',
  note: '',
};

export function OutboundForm({ onSubmit, submitting }: OutboundFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

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

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(state: FormState): FormErrors {
    const next: FormErrors = {};

    if (!state.productId) next.productId = 'Vui lòng chọn sản phẩm';

    const quantityNum = Number(state.quantity);
    if (!state.quantity || !Number.isInteger(quantityNum) || quantityNum < 1) {
      next.quantity = 'Số lượng phải là số nguyên dương';
    }

    return next;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      productId: form.productId,
      quantity: Number(form.quantity),
      note: form.note.trim() ? form.note.trim() : undefined,
    });
  }


  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="productId">
          Sản phẩm
        </label>
        <select
          id="productId"
          name="productId"
          className="form-input"
          value={form.productId}
          disabled={productsLoading}
          onChange={(e) => updateField('productId', e.target.value)}
        >
          <option value="">
            {productsLoading ? 'Đang tải sản phẩm...' : '-- Chọn sản phẩm --'}
          </option>
          {!productsLoading &&
            products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.skuCode} — {product.name}
              </option>
            ))}
        </select>
        {errors.productId && <p className="form-error">{errors.productId}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="quantity">
          Số lượng
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          className="form-input"
          value={form.quantity}
          onChange={(e) => updateField('quantity', e.target.value)}
        />
        {errors.quantity && <p className="form-error">{errors.quantity}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note">
          Ghi chú
        </label>
        <textarea
          id="note"
          name="note"
          className="form-input"
          rows={3}
          value={form.note}
          onChange={(e) => updateField('note', e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang xuất kho...' : 'Xuất kho'}
        </button>
      </div>
    </form>
  );
}

export default OutboundForm;