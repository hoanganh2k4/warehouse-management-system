import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Public()
  @Get()
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.search,
    '200 OK — Tìm kiếm SKU → Batch → Slot',
  )
  @ApiValidationError()
  search(@Query() query: SearchQueryDto) {
    return this.service.search(query.keyword);
  }
}
