import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly invalidPasswordHash =
        '$2b$12$vrzW/h57WEcuuV/pzKI0geAMTk1/HYIXqgwc03yWoY9/QeuB2pN1G';

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findAuthByEmail(loginDto.email);
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user?.password || this.invalidPasswordHash,
        );

        // Always execute bcrypt, including for an unknown email, to reduce account
        // enumeration through response timing.
        if (!user || !isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Update last login
        await this.usersService.updateLastLogin(user.id);

        const payload = { sub: user.id, email: user.email, role: user.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
        };
    }

    async validateUser(userId: string) {
        return this.usersService.findById(userId);
    }

    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
