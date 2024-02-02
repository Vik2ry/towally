import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { InvestorModule } from './investor/investor.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InvestorModule,
    UserModule,
    AdminModule,
    PrismaModule,
  ],
})
export class AppModule {}
