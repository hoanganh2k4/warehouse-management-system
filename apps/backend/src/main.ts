import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from './common/dto/api-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép frontend (Vercel) gọi API. FRONTEND_URL có thể liệt kê nhiều domain,
  // phân tách bởi dấu phẩy, ví dụ: "https://wms.vercel.app,https://wms-git-main.vercel.app"
  // Nếu không đặt FRONTEND_URL (ví dụ khi chạy local), mặc định cho phép mọi origin.
  const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Smart WMS API')
    .setDescription(
      'Warehouse Management System API\n\n' +
        '**Response format:**\n' +
        '- Success: `{ "success": true, "data": ... }`\n' +
        '- Error: `{ "success": false, "message": "..." }`\n\n' +
        '**HTTP Status Codes:**\n' +
        '| Code | Mô tả |\n' +
        '|------|-------|\n' +
        '| 200 | OK |\n' +
        '| 201 | Created |\n' +
        '| 400 | Validation error |\n' +
        '| 401 | Unauthorized |\n' +
        '| 403 | Forbidden |\n' +
        '| 404 | Not Found |\n' +
        '| 409 | Conflict |',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorResponseDto],
  });
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
