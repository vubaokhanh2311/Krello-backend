import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { API_SECURITY_AUTH } from '../common/decorators/swagger.decorator';
import { IAppConfig, ISwaggerConfig } from '../config/config.types.ts';

export function setupSwagger(
  app: INestApplication,
  configService: ConfigService,
) {
  const { name, globalPrefix } = configService.get<IAppConfig>('app')!;
  const { enable, path, serverUrl } =
    configService.get<ISwaggerConfig>('swagger')!;

  if (!enable) return;

  const swaggerPath = `${serverUrl}/${path}`;

  const documentBuilder = new DocumentBuilder()
    .setTitle(name)
    .setDescription(
      `
 **Base URL**: \`${serverUrl}/${globalPrefix}\` <br>
 **Swagger JSON**: [View JSON documentation](${swaggerPath}/json)
`,
    )
    .setVersion('1.0')
    .addServer(`${serverUrl}/${globalPrefix}`, 'Base URL')
    .addSecurity(API_SECURITY_AUTH, {
      description: 'Enter JWT token',
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    });

  const document = SwaggerModule.createDocument(app, documentBuilder.build(), {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup(path, app, document, {
    swaggerOptions: { persistAuthorization: true },
    jsonDocumentUrl: `/${path}/json`,
  });

  return () => {
    const logger = new Logger('SwaggerModule');
    logger.log(`Swagger UI: ${swaggerPath}`);
    logger.log(`Swagger JSON: ${swaggerPath}/json`);
  };
}
