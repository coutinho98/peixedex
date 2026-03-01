import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler'
import { SpeciesModule } from './species/species.module';

@Module({
  imports: [AuthModule, PrismaModule, ThrottlerModule.forRoot([{
    ttl: 60000, 
    limit: 10,  
  }]), SpeciesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
