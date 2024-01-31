import { Module } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { InvestorController } from './investor.controller';

@Module({
  controllers: [InvestorController],
  providers: [InvestorService],
})
export class InvestorModule {}
