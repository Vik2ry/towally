// src/investor/investor.service.ts

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TradeSharesDTO, TradeCurrencyDTO } from './dto/index.dto';

@Injectable()
export class InvestorService {
  constructor(private prisma: PrismaService) { }

  async tradeShares(tradeData: TradeSharesDTO, userId: string) {
    try {
      // Get user data including roleType
      const userData = await this.getUser(userId);
      const userRoleType = userData.roleType;
      // Check if user's roleType is investor
      if (userRoleType !== 'investor') {
        throw new BadRequestException('User role must be investor to trade shares.');
      }

      const { action, shareId, price } = tradeData;

      // Validate action
      if (action !== 'BUY' && action !== 'SELL') {
        throw new BadRequestException('Invalid action. Must be BUY or SELL.');
      }

      // Validate price
      if (price <= 0) {
        throw new BadRequestException('Invalid price. Must be greater than zero.');
      }

      // Fetch the share
      const share = await this.prisma.share.findUnique({
        where: { id: shareId },
        include: { owner: true, transactions: true },
      });

      if (!share) {
        throw new BadRequestException('Share not found.');
      }

      // Logic for buying shares
      if (action === 'BUY') {
        if (share.ownerId === userId) {
          throw new BadRequestException('Cannot buy shares owned by yourself.');
        }

        const transactionFee = price > 100 ? 0.02 * price : 0.01 * price;
        const totalPrice = price + transactionFee;

        if (userData.dataIncome < totalPrice) {
          throw new BadRequestException('Insufficient balance to buy shares.');
        }

        // Update buyer's balance
        await this.prisma.user.update({
          where: { id: userId },
          data: { dataIncome: userData.dataIncome - totalPrice },
        });

        // Update seller's balance
        await this.prisma.user.update({
          where: { id: share.ownerId },
          data: { dataIncome: share.owner.dataIncome + price },
        });

        // Create transaction record
        await this.prisma.transaction.create({
          data: {
            buyerId: userId,
            sellerId: share.ownerId,
            shareId: shareId,
            price: price,
            type: 'BUY',
          },
        });

        console.log('Shares bought successfully.');
      }

      // Logic for selling shares
      if (action === 'SELL') {
        if (share.ownerId !== userId) {
          throw new BadRequestException('Cannot sell shares you do not own.');
        }

        // Check if the share is already sold
        if (share.sold) {
          throw new BadRequestException('Share is already sold.');
        }

        // Update share's sold status
        await this.prisma.share.update({
          where: { id: shareId },
          data: { sold: true },
        });

        // Update user's balance
        await this.prisma.user.update({
          where: { id: userId },
          data: { dataIncome: userData.dataIncome + price },
        });

        console.log('Shares sold successfully.');
      }
    } catch (error) {
      console.error('Error trading shares:', error.message);
      throw new BadRequestException('Error trading shares');
    }
  }

  async tradeCurrency(tradeData: TradeCurrencyDTO, userId: string) {
    try {
      // Get user data including roleType
      const userData = await this.getUser(userId);
      const userRoleType = userData.roleType;
  
      // Check if user's roleType is investor
      if (userRoleType !== 'investor') {
        throw new BadRequestException('User role must be investor to trade currency.');
      }
  
      const { action, amount } = tradeData;
  
      // Validate action
      if (action !== 'BUY' && action !== 'SELL') {
        throw new BadRequestException('Invalid action. Must be BUY or SELL.');
      }
  
      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Invalid amount. Must be greater than zero.');
      }
  
      // Implement logic for trading currency
      // For simplicity, let's assume the currency exchange rate is 1:1
      // Adjust this logic according to your actual currency trading rules
      if (action === 'BUY') {
        // Deduct the amount from the user's balance
        await this.prisma.user.update({
          where: { id: userId },
          data: { dataIncome: userData.dataIncome - amount },
        });
        console.log('Currency bought successfully.');
      } else if (action === 'SELL') {
        // Add the amount to the user's balance
        await this.prisma.user.update({
          where: { id: userId },
          data: { dataIncome: userData.dataIncome + amount },
        });
        console.log('Currency sold successfully.');
      }
    } catch (error) {
      console.error('Error trading currency:', error.message);
      throw new BadRequestException('Error trading currency');
    }
  }
  

  private async getUser(userId: string) {
    try {
      // Fetch user data including roleType
      const userData = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userData) {
        throw new Error('User not found');
      }
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      throw new BadRequestException('Error fetching user data');
    }
  }

  async getShareIdForUser(userId: string): Promise<string> {
    try {
      // Find the share owned by the user
      const share = await this.prisma.share.findFirst({
        where: {
          ownerId: userId,
        },
      });

      if (!share) {
        throw new NotFoundException('Share not found for the user');
      }

      return share.id;
    } catch (error) {
      console.error('Error getting share ID for user:', error.message);
      throw new BadRequestException('Error getting share ID for user');
    }
  }
  
}
