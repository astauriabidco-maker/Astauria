import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

function getAllowedOrigins(configService: ConfigService) {
    const configured = [
        configService.get<string>('CORS_ORIGINS'),
        configService.get<string>('ADMIN_URL'),
        configService.get<string>('PUBLIC_URL'),
    ]
        .filter(Boolean)
        .flatMap(value => value!.split(','))
        .map(value => value.trim().replace(/\/$/, ''))
        .filter(Boolean);

    if (configService.get<string>('NODE_ENV') !== 'production') {
        configured.push(
            'http://localhost:5173',
            'http://localhost:5500',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5500',
        );
    }

    return [...new Set(configured.map(origin => {
        const parsed = new URL(origin);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error(`Invalid CORS origin protocol: ${origin}`);
        }
        return parsed.origin;
    }))];
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const trustProxy = Number(configService.get<string>('TRUST_PROXY_HOPS') || '0');
    if (Number.isInteger(trustProxy) && trustProxy > 0 && trustProxy <= 10) {
        app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
    }

    const allowedOrigins = getAllowedOrigins(configService);
    app.enableCors({
        origin: allowedOrigins,
        credentials: configService.get<string>('CORS_CREDENTIALS') === 'true',
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Authorization', 'Content-Type'],
        maxAge: 600,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));

    const swaggerEnabled =
        configService.get<string>('NODE_ENV') !== 'production' ||
        configService.get<string>('SWAGGER_ENABLED') === 'true';
    if (swaggerEnabled) {
        const config = new DocumentBuilder()
            .setTitle('Astauria CMS API')
            .setDescription('API for managing Astauria website content')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
    }

    const port = configService.get<number>('PORT') || 3001;
    await app.listen(port);
    console.log(`🚀 Astauria CMS API running on http://localhost:${port}`);
    if (swaggerEnabled) {
        console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
    }
}
bootstrap();
