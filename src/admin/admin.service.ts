import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminTradeCurrencyDTO } from './dto/index.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private user: UserService) { }

  async setMinimumFollowCost(minimumCost: number) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        const existingMinimumCost = await this.prisma.adminAction.findFirst({
          where: { action: 'setMinimumFollowCost' },
        });

        if (existingMinimumCost) {
          await this.prisma.adminAction.update({
            where: { id: existingMinimumCost.id },
            data: { value: minimumCost },
          });
        } else {
          await this.prisma.adminAction.create({
            data: { action: 'setMinimumFollowCost', value: minimumCost },
          });
        }
      } catch (error) {
        throw new BadRequestException('Failed to set minimum follow cost.');
      }
    });
    return transaction;
  }

  async adminTradeCurrency(tradeData: AdminTradeCurrencyDTO) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        const { action, wallys } = tradeData;

        // Validate action
        if (action !== 'BUY' && action !== 'SELL') {
          throw new BadRequestException('Invalid action. Must be BUY or SELL.');
        }

        // Validate wallys
        if (wallys <= 0) {
          throw new BadRequestException('Invalid Wallys. Amount must be greater than zero.');
        }

        // Implement logic for admin trading currency
        // Assuming Wallys are traded at fixed rates
        const buyRate = 0.009; // $0.009 per Wally
        const sellRate = 0.011; // $0.011 per Wally

        if (action === 'BUY') {
          const cost = wallys * buyRate;
          // Logic to handle buying Wallys and updating balances
        } else if (action === 'SELL') {
          const revenue = wallys * sellRate;
          // Logic to handle selling Wallys and updating balances
        }
      } catch (error) {
        throw new BadRequestException('Failed to perform admin currency trading.');
      }
    });
    return transaction;
  }

  async freezeUserAccount(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { status: 'INACTIVE' },
      });
      console.log('User account frozen successfully.');
    } catch (error) {
      throw new BadRequestException('Failed to freeze user account.');
    }
  }

  @Cron(CronExpression.EVERY_WEEK, { timeZone: 'UTC' })
  async issueDataIncome() {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        // Get all active users
        const activeUsers = await this.prisma.user.findMany({
          where: {
            status: 'ACTIVE',
          },
        });

        // Issue 100ω to each active user
        for (const user of activeUsers) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { dataIncome: user.dataIncome + 100 },
          });

          // After updating dataIncome, call computeFollowIncome
          await this.computeFollowIncome(user.id);
          await this.updatewallyWallet(user.id);
        }

        console.log('Weekly data income issued successfully.');
      } catch (error) {
        console.error('Failed to issue weekly data income:', error.message);
        throw new BadRequestException('Failed to issue weekly data income.');
      }
    });
    return transaction;
  }

  private async updatewallyWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        wallyWallet: {
          increment: user.dataIncome + user.FollowIncome,
        },
      },
    });
  }

  private async computeFollowIncome(userId: string) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        // Find the user's follow relationships
        const followRelationships = await this.prisma.follow.findMany({
          where: {
            followerId: userId,
          },
          include: {
            following: true, // Include the details of the user being followed
          },
        });

        // Calculate the total follow income
        let totalFollowIncome = 0;
        const minimumCost = 100; // Example minimum cost set by admin

        for (const relationship of followRelationships) {
          const followedUser = relationship.following;
          const dataIncome = followedUser.dataIncome || 0;

          if (dataIncome / followRelationships.length > minimumCost) {
            const followIncome = dataIncome / followRelationships.length;
            totalFollowIncome += followIncome;

            // Update the user's follow income in the database
            await this.prisma.user.update({
              where: { id: userId },
              data: {
                FollowIncome: totalFollowIncome,
                dataIncome: 0, // Reset the user's data income to 0
              },
            });
          }
        }

        console.log("Follow income computed successfully");
      } catch (error) {
        console.error('Error computing follow income:', error.message);
        throw new BadRequestException('Error computing follow income');
      }

    });
    return transaction;
  }
}
