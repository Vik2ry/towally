// src/admin/admin.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetMinimumFollowCostDTO, AdminTradeCurrencyDTO } from './dto/index.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('set-minimum-follow-cost')
  async setMinimumFollowCost(@Body() setMinimumFollowCostDTO: SetMinimumFollowCostDTO) {
    console.log('setMinimumFollowCostDTO: ', setMinimumFollowCostDTO);
    const { minimumCost } = setMinimumFollowCostDTO;
    return this.adminService.setMinimumFollowCost(minimumCost);
  }

  @Post('admin-trade-currency')
  async adminTradeCurrency(@Body() tradeData: AdminTradeCurrencyDTO) {
    console.log('tradeData of admin-trade-currency: ', tradeData);
    return this.adminService.adminTradeCurrency(tradeData);
  }

  @Post('freeze-user-account')
  async freezeUserAccount(@Body() userId: string) {
    console.log('userId of freeze-user-account: ', userId);
    return this.adminService.freezeUserAccount(userId);
  }

  @Post('issue-data-income')
  async issueDataIncome() {
    return this.adminService.issueDataIncome();
  }
}
