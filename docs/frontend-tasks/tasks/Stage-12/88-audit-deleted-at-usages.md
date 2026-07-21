# Task 88 [BACKEND] — Audit toàn bộ _count/aggregate liên quan `deletedAt` + viết test hồi quy

## 🎯 Mục tiêu
Sau khi vá đúng 1 điểm lỗi cụ thể ở Task 87 (Category), rà soát **toàn bộ** những chỗ khác trong backend có
dùng `_count`/`count`/`aggregate` trên các bảng có field `deletedAt` (soft-delete), để chắc chắn không còn
chỗ nào bị lỗi tương tự đang ẩn, đồng thời viết test hồi quy để lỗi này không tái diễn khi có người sửa code
sau này.

## 📖 Giải thích nghiệp vụ
Task 87 chỉ sửa 1 điểm cụ thể (Category → Product). Nhưng đây là **loại lỗi có thể lặp lại** ở bất kỳ chỗ
nào khác trong code base có quan hệ 1-n trỏ tới 1 bảng có soft-delete. Task này để rà soát hệ thống, không
đoán mò — đối chiếu với danh sách model có `deletedAt` trong schema hiện tại: `Product`, `Supplier`,
`Customer` (xem `schema.prisma` để xác nhận đầy đủ danh sách, có thể có thêm model khác).

Việc rà soát này KHÔNG bắt phải sửa toàn bộ hệ thống lại từ đầu — chỉ áp dụng đúng nguyên tắc "nếu `_count`
hoặc `aggregate` chạy trên bảng có `deletedAt` mà không lọc, và có nơi khác trong hệ thống hiển thị cùng
khái niệm có lọc `deletedAt`, thì đó là lỗi cần vá giống Task 87". Nếu rà soát xong không tìm thấy thêm điểm
lỗi nào khác, task này coi như hoàn thành ở việc viết test + note lại kết quả rà soát, không cần sửa thêm
code.

## 🧠 Giải thích Prisma/NestJS cần biết
- Cách rà soát nhanh: `grep -rn "_count\|\.count(\|\.aggregate(" apps/backend/src --include=*.ts` rồi đối
  chiếu từng kết quả với model liên quan trong `schema.prisma` — model đó có field `deletedAt` không, và nếu
  có, câu query đó đã lọc `deletedAt: null` (trực tiếp trong `where` hoặc trong `_count.select.<relation>.where`)
  hay chưa.
- Viết test bằng Jest theo convention NestJS đã có sẵn trong project (xem file `*.spec.ts` khác nếu có, để
  học cách mock `PrismaService`).

## 📖 Các file cần đọc trước
- `apps/backend/prisma/schema.prisma` (để liệt kê chính xác model nào có `deletedAt`)
- Toàn bộ output của lệnh grep ở bước 1 dưới đây
- `apps/backend/src/categories/categories.service.ts` (bản đã sửa ở Task 87, để biết đúng chuẩn cần đạt ở
  các chỗ khác nếu phát hiện lỗi tương tự)

## 📂 File được phép sửa / tạo mới
- Tạo mới: `apps/backend/src/categories/categories.service.spec.ts` (nếu Task 87 chưa tạo)
- Sửa (chỉ nếu rà soát phát hiện thêm lỗi thật sự, không sửa "phòng ngừa" khi không chắc chắn): bất kỳ
  service nào có lỗi tương tự đã xác nhận qua bước rà soát — phải liệt kê rõ trong PR description file nào,
  dòng nào, lý do.
- Tạo mới: `docs/frontend-tasks/tasks/Stage-12/88-audit-result.md` — ghi lại kết quả rà soát (danh sách đã
  kiểm tra, kết luận từng chỗ có lỗi hay không) để lưu vết cho lần audit sau.

## 📂 File KHÔNG được sửa
- Không sửa bất kỳ file nào ngoài phạm vi đã xác nhận có lỗi qua rà soát — tuyệt đối không "tiện tay" đổi
  code ở chỗ không liên quan.

## 🔌 API cần dùng
Không có API mới — đây là task rà soát + test.

## 🪜 Các bước thực hiện
1. Trong `apps/backend`, chạy: `grep -rn "_count\|\.count(\|\.aggregate(" src --include=*.ts | grep -v spec`
2. Mở `schema.prisma`, liệt kê toàn bộ model có field `deletedAt` (tính tới thời điểm này đã biết có
   `Product`, `Supplier`, `Customer` — xác nhận lại có thiếu model nào không).
3. Với mỗi dòng kết quả grep ở bước 1, kiểm tra: model đích của `count`/`_count`/`aggregate` đó có nằm trong
   danh sách bước 2 không?
   - Nếu KHÔNG (model không có `deletedAt`, ví dụ `Zone`, `Rack`, `Level`, `Slot`) → bỏ qua, không phải lỗi
     loại này.
   - Nếu CÓ → kiểm tra tiếp: câu query đã có `where: { deletedAt: null }` (trực tiếp hoặc lồng trong
     `_count.select`) chưa? Nếu chưa lọc VÀ có ít nhất 1 nơi khác trong hệ thống hiển thị cùng khái niệm có
     lọc → đây là lỗi, ghi lại vào `88-audit-result.md` kèm số dòng, rồi sửa giống cách làm ở Task 87.
4. Viết `categories.service.spec.ts` (nếu chưa có) — test case: category có N sản phẩm, M sản phẩm trong đó
   bị soft-delete → `_count.products` phải trả về `N - M`.
5. Ghi kết quả rà soát đầy đủ vào `88-audit-result.md` (kể cả trường hợp không tìm thêm lỗi nào — ghi rõ "đã
   kiểm tra, không phát hiện thêm lỗi tương tự" kèm danh sách các chỗ đã xem qua).
6. Chạy `npm run test --workspace=backend -- categories.service.spec` (hoặc lệnh test tương ứng project
   đang dùng) — pass.

## 💻 Ví dụ code (khung test mẫu)
```ts
import { Test } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const prismaMock = {
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(CategoriesService);
  });

  it('chỉ đếm sản phẩm chưa bị xoá mềm trong _count.products', async () => {
    await service.findAll();
    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      }),
    );
  });
});
```

## 🤖 Prompt hoàn chỉnh cho Claude/Cursor
Xem file: `prompts/88.txt`

## ✅ Checklist nghiệm thu
- ☐ Đã grep và đối chiếu toàn bộ `_count`/`count`/`aggregate` trong `src` với danh sách model có `deletedAt`
- ☐ File `88-audit-result.md` liệt kê đầy đủ kết quả rà soát (có lỗi hay không, ở đâu)
- ☐ Nếu phát hiện thêm lỗi → đã sửa đúng phạm vi, có giải thích rõ trong PR
- ☐ `categories.service.spec.ts` có test case xác nhận công thức lọc `deletedAt: null` trong `_count`
- ☐ `npm run test --workspace=backend` pass, `npm run build --workspace=backend` không lỗi

## ❌ Lỗi thường gặp
- **Sửa "phòng ngừa" ở chỗ không có bằng chứng lỗi thật** (vd sửa cả những model không có `deletedAt`) → gây
  thay đổi không cần thiết, khó review. Chỉ sửa khi đã xác nhận chắc chắn qua bước rà soát.
- **Bỏ sót model có `deletedAt`** vì chỉ nhớ tới `Product` mà quên kiểm tra `Supplier`/`Customer` — luôn đọc
  lại `schema.prisma` để lấy danh sách đầy đủ, không dựa vào trí nhớ.

## 🔄 Cách test
1. `npm run test --workspace=backend`.
2. Đọc lại `88-audit-result.md` — đảm bảo liệt kê rõ ràng, người khác đọc vào hiểu ngay đã kiểm tra những gì.

## 🔙 Cách rollback nếu sai
```
git checkout apps/backend/src
rm docs/frontend-tasks/tasks/Stage-12/88-audit-result.md
```

## 📝 Commit message
```
test(categories): add regression test + audit deletedAt-aware count/aggregate usages
```

## 🔀 PR title
```
[Task 88] Audit count/aggregate for soft-delete correctness + regression test
```
