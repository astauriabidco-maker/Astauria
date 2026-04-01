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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
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
    ],
})
export class AppModule { }
