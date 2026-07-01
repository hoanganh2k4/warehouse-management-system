import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
