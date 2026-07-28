import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const publicUserSelect = {
    id: true,
    email: true,
    name: true,
    role: true,
    avatar: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
} as const;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            select: {
                ...publicUserSelect,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: publicUserSelect,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: publicUserSelect,
        });
    }

    async findAuthByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: {
                ...publicUserSelect,
                password: true,
            },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto, allowRoleChange = false) {
        const { role, ...allowedFields } = updateUserDto;
        const data: any = { ...allowedFields };
        if (allowRoleChange && role) {
            if (role !== 'ADMIN') {
                await this.ensureAnotherAdminExists(id);
            }
            data.role = role;
        }
        if (updateUserDto.password) {
            data.password = await bcrypt.hash(updateUserDto.password, 12);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: publicUserSelect,
        });
    }

    async updateLastLogin(id: string) {
        return this.prisma.user.update({
            where: { id },
            data: { lastLogin: new Date() },
            select: { id: true },
        });
    }

    async remove(id: string) {
        await this.ensureAnotherAdminExists(id);
        return this.prisma.user.delete({
            where: { id },
            select: publicUserSelect,
        });
    }

    private async ensureAnotherAdminExists(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (user?.role !== 'ADMIN') return;

        const adminCount = await this.prisma.user.count({
            where: { role: 'ADMIN' },
        });
        if (adminCount <= 1) {
            throw new BadRequestException('Le dernier compte administrateur doit être conservé');
        }
    }
}
