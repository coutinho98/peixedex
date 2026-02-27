import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { use } from 'passport';

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

        const pwMatches = await bcrypt.compare(dto.password, user.password, );

        if (!pwMatches) {
            throw new ConflictException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role, plan: user.plan };
        const token = await this.jwtService.signAsync(payload);
        return { access_token: token };
    }
}