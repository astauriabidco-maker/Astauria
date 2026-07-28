import {
    BadRequestException,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Body,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@Controller('api/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create a new user (Admin only)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    findOne(@Param('id') id: string, @Request() request: any) {
        if (request.user.role !== 'ADMIN' && request.user.sub !== id) {
            throw new ForbiddenException('Vous ne pouvez consulter que votre propre profil');
        }
        return this.usersService.findById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user' })
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() request: any,
    ) {
        const isAdmin = request.user.role === 'ADMIN';
        if (!isAdmin && request.user.sub !== id) {
            throw new ForbiddenException('Vous ne pouvez modifier que votre propre profil');
        }
        return this.usersService.update(id, updateUserDto, isAdmin);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete user (Admin only)' })
    remove(@Param('id') id: string, @Request() request: any) {
        if (request.user.sub === id) {
            throw new BadRequestException('Vous ne pouvez pas supprimer votre propre compte');
        }
        return this.usersService.remove(id);
    }
}
