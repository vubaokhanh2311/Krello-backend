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
    .setTitle(name || 'Krello API')
    .setDescription(
      `
## API Documentation

RESTful API for Krello - A project management application with boards, lists, cards, comments, attachments, and user management.

**Base URL**: \`${serverUrl}/${globalPrefix}\` <br>
**Swagger JSON**: [View JSON documentation](${swaggerPath}/json)

### Authentication
Most endpoints require JWT authentication. Use the \`/auth/login\` or \`/auth/register\` endpoints to obtain a token, then include it in the Authorization header as \`Bearer <token>\`.

### Features
- User authentication and authorization
- Board management with role-based access (owner, editor, viewer)
- List and card organization
- Comments and attachments
- Labels and card members
- Activity tracking
- Image search via Unsplash integration
`,
    )
    .setVersion('1.0')
    .setContact('API Support', '', '')
    .setLicense('MIT', '')
    .addServer(`${serverUrl}/${globalPrefix}`, 'Base URL')
    .addTag(
      'auth',
      'Authentication endpoints: register, login, logout, password reset, JWT refresh',
    )
    .addTag('users', 'User management: profile, CRUD operations, avatar upload')
    .addTag(
      'Board',
      'Board management: create, update, delete boards, member invitations, role management',
    )
    .addTag(
      'List',
      'List management: create, update, delete lists within boards',
    )
    .addTag(
      'Card',
      'Card management: create, update, delete cards within lists',
    )
    .addTag(
      'Comment',
      'Comment management: add, update, delete comments on cards',
    )
    .addTag(
      'Attachment',
      'File attachment management: upload, update, delete attachments on cards',
    )
    .addTag(
      'Label',
      'Label management: create, update, delete labels for boards',
    )
    .addTag(
      'CardMember',
      'Card member management: add or remove members from cards',
    )
    .addTag(
      'CardLabel',
      'Card label management: add or remove labels from cards',
    )
    .addTag('Activity', 'Activity tracking: view board activity history')
    .addTag(
      'unsplash',
      'Unsplash integration: search for images to use as board backgrounds',
    )
    .addSecurity(API_SECURITY_AUTH, {
      description:
        'Enter JWT token (obtained from /auth/login or /auth/register)',
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
