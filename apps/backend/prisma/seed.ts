import { PrismaClient, ProductCategory } from '../generated/prisma/client';
import { createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/smart_wms';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

// NOTE: tạm dùng sha256 để không phụ thuộc thêm package bcrypt trong seed.
// Khi viết module Auth thật, hãy thay bằng bcrypt.hash() và migrate lại passwordHash của user seed.
function hashPassword(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

const ZONES = ['A', 'B', 'C', 'D', 'E'];
const RACKS_PER_ZONE = 20;
const LEVELS_PER_RACK = 5;
const SLOTS_PER_LEVEL = 10;

const SLOT_MAX_CAPACITY = 200;

async function main() {
  console.log('🌱 Seeding...');

  // ===================== Roles =====================
  const managerRole = await prisma.role.upsert({
    where: { name: 'Quản lý' },
    update: {},
    create: { name: 'Quản lý', description: 'Quản lý kho, xem báo cáo, phân quyền' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Nhân viên kho' },
    update: {},
    create: { name: 'Nhân viên kho', description: 'Nhập/xuất/di chuyển hàng' },
  });

  // ===================== Users =====================
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@smartwms.local',
      fullName: 'Quản trị viên',
      passwordHash: hashPassword('Admin@123'),
      roleId: managerRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff01' },
    update: {},
    create: {
      username: 'staff01',
      email: 'staff01@smartwms.local',
      fullName: 'Nhân viên kho 01',
      passwordHash: hashPassword('Staff@123'),
      roleId: staffRole.id,
    },
  });

  console.log('✅ Roles & users seeded');

  // ===================== Warehouse structure =====================
  let warehouse = await prisma.warehouse.findFirst({ where: { name: 'Warehouse A' } });
  if (!warehouse) {
    warehouse = await prisma.warehouse.create({
      data: { name: 'Warehouse A', address: 'KCN Tân Bình, TP.HCM' },
    });
  }

  // Xoá cấu trúc kho cũ (nếu seed lại) để tránh trùng lặp — chỉ áp dụng cho warehouse này.
  await prisma.slot.deleteMany({ where: { level: { rack: { zone: { warehouseId: warehouse.id } } } } });
  await prisma.level.deleteMany({ where: { rack: { zone: { warehouseId: warehouse.id } } } });
  await prisma.rack.deleteMany({ where: { zone: { warehouseId: warehouse.id } } });
  await prisma.zone.deleteMany({ where: { warehouseId: warehouse.id } });

  // ----- Zones -----
  const zoneInputs = ZONES.map((code) => ({ warehouseId: warehouse!.id, code: `Zone ${code}` }));
  await prisma.zone.createMany({ data: zoneInputs });
  const zones = await prisma.zone.findMany({ where: { warehouseId: warehouse.id } });

  // ----- Racks -----
  const rackInputs: { zoneId: string; code: string }[] = [];
  for (const zone of zones) {
    for (let r = 1; r <= RACKS_PER_ZONE; r++) {
      rackInputs.push({ zoneId: zone.id, code: `Rack ${String(r).padStart(2, '0')}` });
    }
  }
  await prisma.rack.createMany({ data: rackInputs });
  const racks = await prisma.rack.findMany({ where: { zone: { warehouseId: warehouse.id } } });

  console.log(`✅ Created ${zones.length} zones, ${racks.length} racks`);

  // ----- Levels -----
  const levelInputs: { rackId: string; levelNumber: number }[] = [];
  for (const rack of racks) {
    for (let l = 1; l <= LEVELS_PER_RACK; l++) {
      levelInputs.push({ rackId: rack.id, levelNumber: l });
    }
  }
  await prisma.level.createMany({ data: levelInputs });
  const levels = await prisma.level.findMany({
    include: { rack: { include: { zone: true } } },
    where: { rack: { zone: { warehouseId: warehouse.id } } },
  });

  console.log(`✅ Created ${levels.length} levels`);

  // ----- Slots (5 x 20 x 5 x 10 = 5000) -----
  const slotInputs: {
    levelId: string;
    code: string;
    maxCapacity: number;
    usedCapacity: number;
    availableCapacity: number;
    occupancyRate: number;
    distanceToGate: number;
    outboundFrequencyScore: number;
  }[] = [];

  for (const level of levels) {
    const zoneIndex = ZONES.indexOf(level.rack.zone.code.replace('Zone ', ''));
    const rackNumber = Number(level.rack.code.replace('Rack ', ''));

    // Khoảng cách tới cửa xuất: giả định cửa ở Zone A, Rack 01.
    // Công thức demo: tăng dần theo zone và theo rack trong zone.
    const distanceToGate = zoneIndex * 60 + rackNumber * 3;

    for (let s = 1; s <= SLOTS_PER_LEVEL; s++) {
      slotInputs.push({
        levelId: level.id,
        code: `S${String(s).padStart(2, '0')}`,
        maxCapacity: SLOT_MAX_CAPACITY,
        usedCapacity: 0,
        availableCapacity: SLOT_MAX_CAPACITY,
        occupancyRate: 0,
        distanceToGate,
        outboundFrequencyScore: 0,
      });
    }
  }

  // createMany 5000 bản ghi trong 1 lần gọi — Postgres xử lý tốt việc này.
  await prisma.slot.createMany({ data: slotInputs });

  console.log(`✅ Created ${slotInputs.length} slots`);

  // ===================== Products & Batches (dữ liệu mẫu để test) =====================
  const products = [
    { skuCode: 'VINA001', name: 'Vinamilk Có Đường 180ml', category: ProductCategory.MILK, unit: 'hộp', isHeavy: false },
    { skuCode: 'VINA002', name: 'Vinamilk Không Đường 1L', category: ProductCategory.MILK, unit: 'hộp', isHeavy: true },
    { skuCode: 'CRACK001', name: 'Bánh quy AFC', category: ProductCategory.CRACKER, unit: 'gói', isHeavy: false },
    { skuCode: 'CRACK002', name: 'Bánh Cosy', category: ProductCategory.CRACKER, unit: 'gói', isHeavy: false },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { skuCode: p.skuCode },
      update: {},
      create: p,
    });

    // Mỗi product có 2 batch với HSD khác nhau, để test FEFO.
    const today = new Date();
    const batchDefs = [
      { suffix: '01', daysToExpire: 30 },
      { suffix: '02', daysToExpire: 90 },
    ];

    for (const b of batchDefs) {
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + b.daysToExpire);
      const manufactureDate = new Date(today);
      manufactureDate.setDate(manufactureDate.getDate() - 10);

      await prisma.batch.upsert({
        where: { batchCode: `${p.skuCode}-B${b.suffix}` },
        update: {},
        create: {
          productId: product.id,
          batchCode: `${p.skuCode}-B${b.suffix}`,
          manufactureDate,
          expiryDate,
        },
      });
    }
  }

  console.log(`✅ Seeded ${products.length} products with batches`);
  console.log('🌱 Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });