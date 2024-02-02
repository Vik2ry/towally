import { Module } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [InvestorController],
  providers: [InvestorService, UserService],
})
export class InvestorModule {}
