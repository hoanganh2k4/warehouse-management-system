import { Link } from 'react-router-dom';

export default function ProductCreate() {
  return (
    <main className="app-content">
      <div className="page-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Thêm sản phẩm mới</h1>
          <p className="page-desc">Điền thông tin sản phẩm để thêm vào kho.</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Thông tin sản phẩm</h2>
        </div>

        <form className="product-form">
          <div className="form-group">
            <label className="form-label" htmlFor="skuCode">
              Mã SKU
            </label>
            <input id="skuCode" name="skuCode" type="text" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Tên sản phẩm
            </label>
            <input id="name" name="name" type="text" className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Danh mục
            </label>
            <select id="category" name="category" className="form-input" defaultValue="MILK">
              <option value="MILK">Sữa (MILK)</option>
              <option value="CRACKER">Bánh quy (CRACKER)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="unit">
              Đơn vị
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              className="form-input"
              placeholder="ví dụ: hộp, thùng, kg"
            />
          </div>

          <div className="form-group form-group-checkbox">
            <label className="form-label form-label-checkbox" htmlFor="isHeavy">
              <input id="isHeavy" name="isHeavy" type="checkbox" />
              Hàng nặng (cần xử lý đặc biệt)
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Tạo sản phẩm
            </button>
            <Link to="/" className="btn-secondary">
              Huỷ
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
