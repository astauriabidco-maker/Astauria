"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const navigation_module_1 = require("./navigation/navigation.module");
const pages_module_1 = require("./pages/pages.module");
const blog_module_1 = require("./blog/blog.module");
const faq_module_1 = require("./faq/faq.module");
const testimonials_module_1 = require("./testimonials/testimonials.module");
const case_studies_module_1 = require("./case-studies/case-studies.module");
const media_module_1 = require("./media/media.module");
const seo_module_1 = require("./seo/seo.module");
const generator_module_1 = require("./generator/generator.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            navigation_module_1.NavigationModule,
            pages_module_1.PagesModule,
            blog_module_1.BlogModule,
            faq_module_1.FaqModule,
            testimonials_module_1.TestimonialsModule,
            case_studies_module_1.CaseStudiesModule,
            media_module_1.MediaModule,
            seo_module_1.SeoModule,
            generator_module_1.GeneratorModule,
            settings_module_1.SettingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map