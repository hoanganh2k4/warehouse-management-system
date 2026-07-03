import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiErrorResponseDto } from './common/dto/api-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
