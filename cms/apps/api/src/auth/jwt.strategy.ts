import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            issuer: 'astauria-cms',
            audience: 'astauria-admin',
        });
    }

    async validate(payload: { sub?: string }) {
        if (!payload.sub) {
            throw new UnauthorizedException();
        }

        // Reload the user for every authenticated request: deleting an account or
        // changing its role takes effect immediately instead of waiting for expiry.
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
        };
    }
}
