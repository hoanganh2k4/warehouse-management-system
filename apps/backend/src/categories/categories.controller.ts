import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiAuthWriteErrors,
  ApiCreatedExample,
  ApiPublicReadErrors,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import {
  ERROR_EXAMPLES,
  SUCCESS_EXAMPLES,
} from '../common/swagger/swagger-examples';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.categoryList,
    '200 OK — Danh sách danh mục',
  )
  @ApiValidationError()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.category, '200 OK — Chi tiết danh mục')
  @ApiPublicReadErrors(ERROR_EXAMPLES.categoryNotFound)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @ApiBearerAuth()
  @Post()
  @ApiCreatedExample(SUCCESS_EXAMPLES.category, '201 Created — Tạo danh mục')
  @ApiAuthWriteErrors({
    conflict: { nameExists: ERROR_EXAMPLES.categoryNameExists },
  })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth()
  @Put(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.category, '200 OK — Cập nhật danh mục')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.categoryNotFound,
    conflict: { nameExists: ERROR_EXAMPLES.categoryNameExists },
  })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiSuccessExample(SUCCESS_EXAMPLES.category, '200 OK — Xóa danh mục')
  @ApiAuthWriteErrors({
    notFound: ERROR_EXAMPLES.categoryNotFound,
    conflict: { hasProducts: ERROR_EXAMPLES.categoryHasProducts },
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
