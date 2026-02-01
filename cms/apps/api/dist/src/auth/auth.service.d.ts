import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            avatar: string | null;
        };
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: string;
        avatar: string | null;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatar: string | null;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
