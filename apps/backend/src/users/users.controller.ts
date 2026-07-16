import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { MANAGER_ROLE } from '../common/constants/roles.constant';
import {
  ApiAuthReadErrors,
  ApiSuccessExample,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(MANAGER_ROLE)
  @ApiSuccessExample(
    SUCCESS_EXAMPLES.userList,
    '200 OK — Danh sách nhân viên (phân trang, chỉ Quản lý)',
  )
  @ApiAuthReadErrors()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }
}
