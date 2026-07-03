import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { ApiSuccessExample } from './common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from './common/swagger/swagger-examples';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiSuccessExample(SUCCESS_EXAMPLES.health, '200 OK — API đang hoạt động')
  @ApiOkResponse({ description: 'API is up' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
