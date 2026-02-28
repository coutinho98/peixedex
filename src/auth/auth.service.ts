import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';

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

        const { password, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
        };
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

        const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan };
        const token = await this.jwtService.signAsync(payload);
        return { access_token: token };
    }

    async getToken(userId: number, email: string, role: string, plan: string) {
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
}