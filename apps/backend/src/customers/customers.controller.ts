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
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
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

const CUSTOMER_EXAMPLE = {
  id: 'c3d4e5f6-a7b8-4901-cdef-123456789012',
  name: 'Siêu thị Bình Minh',
  contactName: 'Phạm Thu Hà',
  phone: '0934567890',
  email: 'ha.pham@binhminh.vn',
  address: 'Quận 7, TP.HCM',
  createdAt: '2026-07-17T05:00:00.000Z',
  updatedAt: '2026-07-17T05:00:00.000Z',
};

const CUSTOMER_LIST_EXAMPLE = {
  items: [CUSTOMER_EXAMPLE],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

// Tương tự Suppliers: GET mở cho mọi user đã đăng nhập (nhân viên cần chọn khi
// Đặt lịch xuất), thao tác ghi chỉ dành cho Quản lý.
@ApiBearerAuth()
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @ApiSuccessExample(CUSTOMER_LIST_EXAMPLE, '200 OK — Danh sách khách hàng')
  @ApiValidationError()
  @ApiAuthReadErrors()
  findAll(@Query() query: PaginationDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiSuccessExample(CUSTOMER_EXAMPLE, '200 OK — Chi tiết khách hàng')
  @ApiAuthReadErrors()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(MANAGER_ROLE)
  @ApiCreatedExample(
    CUSTOMER_EXAMPLE,
    '201 Created — Tạo khách hàng (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    CUSTOMER_EXAMPLE,
    '200 OK — Cập nhật khách hàng (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.delete,
    '200 OK — Xóa mềm khách hàng (chỉ Quản lý)',
  )
  @ApiAuthWriteErrors()
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
