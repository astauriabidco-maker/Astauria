import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NavigationModule } from './navigation/navigation.module';
import { PagesModule } from './pages/pages.module';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './faq/faq.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { CaseStudiesModule } from './case-studies/case-studies.module';
import { MediaModule } from './media/media.module';
import { SeoModule } from './seo/seo.module';
import { GeneratorModule } from './generator/generator.module';
import { SettingsModule } from './settings/settings.module';
import { LeadsModule } from './leads/leads.module';
import { AiModule } from './ai/ai.module';
import { ProjectsModule } from './projects/projects.module';
import { HeroSlidesModule } from './hero-slides/hero-slides.module';
import { randomBytes } from 'crypto';
import { HealthController } from './health.controller';

function validateEnvironment(config: Record<string, unknown>) {
    const isProduction = config.NODE_ENV === 'production';
    const jwtSecret = typeof config.JWT_SECRET === 'string' ? config.JWT_SECRET.trim() : '';

    const looksLikePlaceholder =
        /change[-_ ]?(me|in[-_ ]production)|replace[-_ ]?with|astauria-cms-secret/i.test(jwtSecret);

    if (isProduction && (jwtSecret.length < 32 || looksLikePlaceholder)) {
        throw new Error(
            'JWT_SECRET must be a unique, non-placeholder value of at least 32 characters in production',
        );
    }

    // A random development secret avoids shipping a reusable credential. Tokens are
    // intentionally invalidated when the development API restarts.
    if (!jwtSecret) {
        config.JWT_SECRET = randomBytes(32).toString('hex');
    }

    return config;
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            validate: validateEnvironment,
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        NavigationModule,
        PagesModule,
        BlogModule,
        FaqModule,
        TestimonialsModule,
        CaseStudiesModule,
        MediaModule,
        SeoModule,
        GeneratorModule,
        SettingsModule,
        LeadsModule,
        AiModule,
        ProjectsModule,
        HeroSlidesModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }
