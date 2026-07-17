import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from './dto/create-supplier.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { MANAGER_ROLE } from '../common/constants/roles.constant';
import {
  ApiAuthReadErrors,
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

const SUPPLIER_EXAMPLE = {
  id: 'b2c3d4e5-f6a7-4890-bcde-f12345678901',
  name: 'Công ty TNHH Thực phẩm An Phát',
  contactName: 'Nguyễn Văn Hùng',
  phone: '0901234567',
  email: 'hung.nguyen@anphat.vn',
  address: 'KCN Tân Bình, TP.HCM',
  createdAt: '2026-07-17T05:00:00.000Z',
  updatedAt: '2026-07-17T05:00:00.000Z',
};

const SUPPLIER_LIST_EXAMPLE = {
  items: [SUPPLIER_EXAMPLE],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

// Danh sách Nhà cung cấp dùng để: (1) Quản lý bảo trì danh mục, (2) Nhân viên
// kho chọn khi Đặt lịch nhập -> nên GET không giới hạn role (chỉ cần đăng nhập),
// còn thao tác ghi (tạo/sửa/xóa) chỉ dành cho Quản lý.
@ApiBearerAuth()
@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  @ApiSuccessExample(SUPPLIER_LIST_EXAMPLE, '200 OK — Danh sách nhà cung cấp')
  @ApiValidationError()
  @ApiAuthReadErrors()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiSuccessExample(SUPPLIER_EXAMPLE, '200 OK — Chi tiết nhà cung cấp')
  @ApiAuthReadErrors()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(MANAGER_ROLE)
  @ApiCreatedExample(
    SUPPLIER_EXAMPLE,
    '201 Created — Tạo nhà cung cấp (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateSupplierDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    SUPPLIER_EXAMPLE,
    '200 OK — Cập nhật nhà cung cấp (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.delete,
    '200 OK — Xóa mềm nhà cung cấp (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
