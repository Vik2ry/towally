// investor.controller.ts

import { Body, Controller, Post, BadRequestException, Param, Get } from '@nestjs/common';
import { InvestorService } from './investor.service';
import { TradeSharesDTO, TradeCurrencyDTO } from './dto/index.dto';

@Controller('investor')
export class InvestorController {
  constructor(private readonly investorService: InvestorService) {}

  @Post('trade-shares/:userId')
  async tradeShares(@Body() tradeData: TradeSharesDTO, @Param('userId') userId: string) {
    console.log('tradeData of trade shares : ', tradeData);
    console.log('userId of trade shares : ', userId);
    return this.investorService.tradeShares(tradeData, userId);
  }

  @Post('trade-currency/:userId')
  async tradeCurrency(@Body() tradeData: TradeCurrencyDTO, @Param('userId') userId: string) {
    console.log('tradeData of trade-currency: ', tradeData);
    console.log('userId of trade-currency: ', userId);
    return this.investorService.tradeCurrency(tradeData, userId);
  }

  @Get('share-id/:userId')
  async getShareIdForUser(@Param('userId') userId: string): Promise<{ shareId: string }> {
    const shareId = await this.investorService.getShareIdForUser(userId);
    return { shareId };
  }
}
