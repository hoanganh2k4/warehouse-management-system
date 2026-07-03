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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiPublicReadErrors,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import { ERROR_EXAMPLES, SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiSuccessExample(SUCCESS_EXAMPLES.productList, '200 OK — Danh sách sản phẩm (phân trang)')
  @ApiValidationError()
  findAll(@Query() query: PaginationDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.product, '200 OK — Chi tiết sản phẩm')
  @ApiPublicReadErrors(ERROR_EXAMPLES.productNotFound)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiCreatedExample(SUCCESS_EXAMPLES.product, '201 Created — Tạo sản phẩm')
  @ApiAuthWriteErrors({
    conflict: { skuExists: ERROR_EXAMPLES.skuExists },
  })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.product, '200 OK — Cập nhật sản phẩm')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.productNotFound })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.delete, '200 OK — Xóa mềm sản phẩm')
  @ApiAuthWriteErrors({ notFound: ERROR_EXAMPLES.productNotFound })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
