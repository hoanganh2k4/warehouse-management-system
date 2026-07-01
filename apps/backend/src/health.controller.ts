import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ description: 'API is up' })
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
