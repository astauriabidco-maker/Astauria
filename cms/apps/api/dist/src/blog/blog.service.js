"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BlogService = class BlogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, authorId) {
        return this.prisma.article.create({
            data: { ...data, authorId },
            include: { category: true, author: { select: { name: true, avatar: true } } },
        });
    }
    async findAll(status) {
        return this.prisma.article.findMany({
            where: status ? { status } : undefined,
            include: {
                category: true,
                author: { select: { name: true, avatar: true } },
                tags: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findBySlug(slug) {
        return this.prisma.article.findUnique({
            where: { slug },
            include: { category: true, author: true, tags: true, seo: true },
        });
    }
    async update(id, data) {
        return this.prisma.article.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.article.delete({ where: { id } });
    }
    async publish(id) {
        return this.prisma.article.update({
            where: { id },
            data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
    }
    async getCategories() {
        return this.prisma.category.findMany({ include: { _count: { select: { articles: true } } } });
    }
    async createCategory(data) {
        return this.prisma.category.create({ data });
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map