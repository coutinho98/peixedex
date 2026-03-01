import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { SpeciesModule } from './species/species.module';
import { AtGuard } from './auth/guard/at.guard';
import { RolesGuard } from './auth/guard/roles.guard';
import { PlanGuard } from './auth/guard/plan.guard';

@Module({
  imports: [AuthModule, PrismaModule, ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 10,
  }]), SpeciesModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PlanGuard,
    },
  ],
})
export class AppModule { }
