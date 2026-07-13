import { LoginDto } from './dto/login.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { verifyPassword } from '../common/utils/password.util';

type AccessTokenPayload = { sub: string; username: string; role: string };
type RefreshTokenPayload = AccessTokenPayload & { type: 'refresh' };

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 86400; // 1d — phải khớp JWT_EXPIRES_IN mặc định trong auth.module.ts

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private issueTokenPair(payload: AccessTokenPayload) {
    const accessToken = this.jwtService.sign(payload);
    const refreshPayload: RefreshTokenPayload = { ...payload, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username, deletedAt: null },
      include: { role: true },
    });

    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.issueTokenPair({
      sub: user.id,
      username: user.username,
      role: user.role.name,
    });
  }

  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Người dùng không còn tồn tại');

    return this.issueTokenPair({
      sub: user.id,
      username: user.username,
      role: user.role.name,
    });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId, deletedAt: null },
      include: { role: true },
    });

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role.name,
    };
  }
}