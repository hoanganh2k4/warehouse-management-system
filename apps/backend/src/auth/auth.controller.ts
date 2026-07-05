import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import {
  CurrentUser,
  AuthUser,
} from '../common/decorators/current-user.decorator';
import {
  ApiSuccessExample,
  ApiUnauthorizedError,
  ApiValidationError,
  ApiAuthReadErrors,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiSuccessExample(SUCCESS_EXAMPLES.login, '200 OK — Đăng nhập thành công')
  @ApiValidationError()
  @ApiUnauthorizedError()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @Get('profile')
  @ApiSuccessExample(SUCCESS_EXAMPLES.profile, '200 OK — Thông tin người dùng')
  @ApiAuthReadErrors()
  profile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }
}
