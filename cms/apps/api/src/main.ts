import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS for admin frontend and public website form submission
    app.enableCors({
        origin: [
            process.env.ADMIN_URL || 'http://localhost:5173',
            process.env.PUBLIC_URL || 'http://localhost:5500',
            process.env.PUBLIC_URL || 'http://127.0.0.1:5500',
            '*', // Permissive for initial setup, specify exact domains in production
        ],
        credentials: true,
    });

    // Validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Swagger API docs
    const config = new DocumentBuilder()
        .setTitle('Astauria CMS API')
        .setDescription('API for managing Astauria website content')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Astauria CMS API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
