# Task 38 — `deleteProduct` + gọi từ List/Detail + refetch

**Nhóm:** F – Delete
**Thời lượng ước tính:** 2.5 giờ
**File sửa:** `apps/frontend/src/services/product.service.ts`, `apps/frontend/src/pages/products/ProductList.tsx`, `apps/frontend/src/pages/products/ProductDetail.tsx`
**File cần xác nhận trước khi sửa (xem "Quyết định cần xác nhận" bên dưới):** `apps/frontend/src/components/ProductTable.tsx`
**Phụ thuộc bắt buộc:** Task 37 (`ConfirmDialog.tsx`), Task 30 (pattern gọi service), Task 33 (nút "Sửa" đã có trong `ProductDetail.tsx`, chỗ để thêm nút "Xoá" cạnh đó)

## ⚠️ Quyết định cần xác nhận trước khi làm task này

Bảng 41 task ghi mô tả task này là "gọi từ List/Detail" nhưng cột file chỉ liệt kê `ProductList.tsx` (không có `ProductTable.tsx`, cũng không có `ProductDetail.tsx` dù mô tả có chữ "Detail"). Kiểm tra thực tế `ProductTable.tsx`:

- Bảng hiện **không có cột hành động** (Actions) và **không có link nào dẫn từ 1 dòng sản phẩm sang trang chi tiết** — nghĩa là hiện tại người dùng không có cách nào bấm vào 1 sản phẩm cụ thể trong danh sách để mở trang Detail hoặc xoá riêng nó, ngoài việc gõ tay URL `/products/:id`.
- Quyết định 3 (trong tài liệu gốc) yêu cầu không đụng `ProductTable.tsx` — nhưng phạm vi của Quyết định 3 chỉ nói rõ về 3 task loading/empty/error (Task 20/21/22), không tuyên bố cấm vĩnh viễn mọi thay đổi tương lai lên file này.

**Hai phương án, chọn 1 trước khi làm:**

- **Phương án A (khuyến nghị, task này viết theo phương án này):** Thêm 1 cột "Actions" tối thiểu vào `ProductTable.tsx` — mỗi dòng có 1 link "Xem" (`Link` tới `/products/:id`) và 1 nút "Xoá" nhỏ. Đây là thay đổi nhỏ, có kiểm soát, giúp tính năng thực sự dùng được từ danh sách.
- **Phương án B:** Không đụng `ProductTable.tsx`. Xoá chỉ thực hiện được từ trang Detail (đã có nút "Sửa" từ Task 33, thêm nút "Xoá" cạnh đó). Người dùng chỉ vào được Detail bằng cách gõ tay URL (đúng như hiện trạng từ Task 23). "Gọi từ List" trong mô tả task coi như không khả thi với ràng buộc file hiện tại, ghi nhận đây là sai lệch giữa mô tả và cột file trong bảng gốc.

Nếu anh Đăng chọn Phương án B, bỏ qua toàn bộ Mục 2 bên dưới (phần sửa `ProductTable.tsx` + wiring trong `ProductList.tsx`), chỉ làm Mục 1 và Mục 3.

## Bối cảnh kỹ thuật

Endpoint `DELETE /products/:id` — xoá mềm (`deletedAt` được set, không xoá thật khỏi DB), yêu cầu Bearer token, trả về:
```json
{ "success": true, "data": { "id": "...", "deletedAt": "..." } }
```
(đã được `apiClient` unwrap, tức `apiClient.delete()` trả thẳng `{ id: string; deletedAt: string }`).

## Yêu cầu

### 1. `product.service.ts` — thêm hàm mới

```ts
deleteProduct(id: string): Promise<{ id: string; deletedAt: string }> {
  return apiClient.delete(`/products/${id}`);
},
```

Không cần thêm type mới vào `types.ts` cho response này (kiểu inline `{ id: string; deletedAt: string }` là đủ, vì không nơi nào khác cần tái sử dụng type này).

### 2. `ProductTable.tsx` (chỉ làm nếu chọn Phương án A) + `ProductList.tsx`

**`ProductTable.tsx`:**
- Thêm prop mới `onDeleteRequest: (product: Product) => void` vào `ProductTableProps`.
- Thêm 1 cột `<th>Actions</th>` vào cả phần `<thead>` skeleton và phần `<thead>` thật.
- Mỗi `<tr>` thêm 1 `<td>` chứa:
  ```tsx
  <Link to={`/products/${product.id}`} className="btn-secondary btn-sm">Xem</Link>
  <button className="btn-danger btn-sm" onClick={() => onDeleteRequest(product)}>Xoá</button>
  ```
- Import `Link` từ `react-router-dom`.
- **Không đổi logic loading/empty/error đã có** (Task 20/21/22) — chỉ thêm cột mới vào bảng dữ liệu thật.

**`ProductList.tsx`:**
- Thêm state:
  ```ts
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  ```
- Truyền `onDeleteRequest={setProductToDelete}` vào `<ProductTable />`.
- Render `ConfirmDialog` (Task 37):
  ```tsx
  <ConfirmDialog
    open={productToDelete !== null}
    title="Xoá sản phẩm"
    message={`Bạn có chắc muốn xoá "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
    confirmLabel="Xoá"
    loading={deleting}
    onCancel={() => setProductToDelete(null)}
    onConfirm={handleConfirmDelete}
  />
  ```
- Viết `handleConfirmDelete`:
  ```ts
  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      refetch(); // đã có sẵn từ useProducts (Task 15/16)
    } catch (err) {
      console.error(err);
      // Toast lỗi ở đây là cải tiến hợp lý nhưng KHÔNG bắt buộc trong task này —
      // nếu muốn làm, dùng lại components/Toast.tsx theo đúng pattern Task 32/36.
    } finally {
      setDeleting(false);
    }
  }
  ```

### 3. `ProductDetail.tsx`

- Thêm state `deleting: boolean`, `showConfirm: boolean`.
- Thêm nút "Xoá" cạnh nút "Sửa" (từ Task 33), `onClick={() => setShowConfirm(true)}`.
- Render `ConfirmDialog` tương tự Mục 2, khác ở chỗ sau khi xoá thành công thì **điều hướng về trang danh sách** (`navigate('/')`) thay vì gọi `refetch()` (vì sản phẩm đã bị xoá, không còn gì để refetch trên chính trang này).
  ```ts
  async function handleConfirmDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(product.id);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }
  ```

## Không được làm

- Không xoá thật (hard delete) — endpoint đã tự xử lý soft delete, frontend không cần và không được giả định hành vi khác.
- Không quên `loading`/`deleting` để tránh double-click xoá 2 lần.
- Nếu chọn Phương án A: không đổi lại logic 3 nhánh loading/empty/error đã hoàn thiện ở Task 20/21/22 trong `ProductTable.tsx` — chỉ thêm cột Actions vào nhánh render bảng dữ liệu thật.
- Không tự ý chọn Phương án A hay B mà không xác nhận với anh Đăng trước — đây là quyết định kiến trúc ảnh hưởng đến file đã "chốt không đụng" trong quyết định gốc.

## Kết quả kỳ vọng (Definition of Done)

- [ ] Đã xác nhận Phương án A hoặc B với anh Đăng trước khi code, ghi lại quyết định trong PR description.
- [ ] Bấm "Xoá" (từ List theo Phương án A, hoặc từ Detail) → thấy `ConfirmDialog` hiện ra đúng tên sản phẩm.
- [ ] Xác nhận xoá → sản phẩm biến mất khỏi danh sách (List: tự refetch; Detail: điều hướng về `/`).
- [ ] Vào lại API `GET /products/:id` của sản phẩm vừa xoá → nhận lỗi 404 (đã bị soft-delete, `findOne` lọc `deletedAt: null`).
- [ ] `npx tsc --noEmit` không lỗi.

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor

Xem file: `prompts/Stage-5/38.txt`

⚠️ File này có lưu ý chọn Phương án A/B ở đầu — đọc kỹ trước khi copy phần prompt bên dưới.
(Copy toàn bộ nội dung file đó, dán các đoạn `[DÁN NỘI DUNG ... VÀO ĐÂY]` bằng code thật từ dự án, rồi gửi cho AI.)
