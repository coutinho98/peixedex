import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './auth/decorator/roles.decorator';
import { RolesGuard } from './auth/guard/roles.guard';
import { Plan, Role } from '@prisma/client';
import { RequirePlan } from './auth/decorator/plan.decorator';
import { PlanGuard } from './auth/guard/plan.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Roles(Role.ADMIN) 
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Get('admin')
  getAdminPanel(@Request() req) {
    return {
      mensagem: 'welcome back Shadys :)!',
      utilizador: req.user,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('perfil')
  getProfile(@Request() req) {
    return req.user;
  }

  @RequirePlan(Plan.PREMIUM)
  @UseGuards(AuthGuard('jwt'), PlanGuard)
  @Get('peixes-raros')
  getPremiumContent() {
    return {
      mensagem: 'Test - fish foudned :))',
    };
  }
}