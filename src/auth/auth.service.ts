import { ForbiddenException, Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async signUp(dto: AuthDto) {
        const userExists = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (userExists) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
            }
        });

        const tokens = await this.getToken(user.id, user.email, user.role, user.plan);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async signIn(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user) {
            throw new ConflictException('Invalid credentials');
        }

        const pwMatches = await bcrypt.compare(dto.password, user.password,);

        if (!pwMatches) {
            throw new ConflictException('Invalid credentials');
        }

        const tokens = await this.getToken(user.id, user.email, user.role, user.plan);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async getToken(userId: string, email: string, role: string, plan: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email, role, plan }, { expiresIn: '15m', secret: process.env.ACCESS_TOKEN_SECRET }),
            this.jwtService.signAsync({ sub: userId, email, role, plan }, { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET }),
        ]);
        return { access_token: at, refresh_token: rt };
    }

    async updateRtHash(userId: string, rt: string) {
        const hash = await bcrypt.hash(rt, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRt: hash },
        });
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: { not: null },
            },
            data: {
                hashedRt: null,
            },
        });
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.hashedRt) {
            throw new ForbiddenException('Access Denied');
        }

        const rtMatches = await bcrypt.compare(rt, user.hashedRt);
        if (!rtMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.getToken(user.id, user.email, user.role, user.plan);
        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;
    }
}