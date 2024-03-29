import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleType } from './dto/enums';
import moment from 'moment';
import { User } from '.prisma/client';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createInitialUser(userData: CreateUserDto, emailList: string[]) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        console.log('userData:', userData);
        const { email, firstName, lastName, dob, country, zipcode, profession, company, links, tagline, adminRevenue } = userData;
        const dobDate: Date = moment(dob, 'YYYY-MM-DD').toDate();

        // Create the user
        const user = await this.prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            dob: dobDate,
            country,
            zipcode,
            profession,
            company,
            links,
            tagline,
            wallyWallet: 50.0, // Assuming the initial wallet balance is 0.0
            dataIncome: 0.0, // Assuming the initial follow income is 0.0
            FollowIncome: 0.0, // Assuming the initial follow income is 0.0
            adminRevenue: 50.0, // Assuming the initial admin revenue is 50.0
            roleType: 'user', // Assuming it's a regular user
          },
        });

        // Allocate a share of 100ω to the new user
        await this.prisma.share.create({
          data: {
            owner: { connect: { id: user.id } },
            price: 100.0,
          },
        });

        // Create initial users if emails are provided
        if (emailList && emailList.length > 0) {
          // Inside the for loop for creating initial users
          for (const email of emailList) {
            // Check if the email already exists in the database
            const existingUser = await this.prisma.user.findFirst({
              where: {
                email: email,
              },
            });

            if (!existingUser) {
              // Create user data object with minimal fields
              const newUser: CreateUserDto = {
                email,
                firstName: null,
                lastName: null,
                dob: null,
                country: null,
                zipcode: null,
                profession: null,
                company: null,
                links: [],
                tagline: null,
                dataIncome: 0.0, // Assuming the initial follow income is 0.0
                FollowIncome: 0.0, // Assuming the initial follow income is 0.0
                adminRevenue: 50.0, // Assuming the initial admin revenue is 50.0
                roleType: RoleType.USER, // Assuming it's a regular user
              };

              // Create the new user with minimal data
              const newUserData = await this.prisma.user.create({
                data: {
                  ...newUser,
                },
              });

              // If other users have email only, assign 0ω
              if (!newUser.firstName && !newUser.lastName && !newUser.dob && !newUser.country && !newUser.zipcode && !newUser.profession && !newUser.company && (!newUser.links || newUser.links.length === 0) && !newUser.tagline) {
                // Otherwise, create a new share for the user
                await this.prisma.share.create({
                  data: {
                    owner: { connect: { id: newUserData.id } },
                    price: 0.0,
                  },
                });
              } else {
                // If other fields are provided, run followUser for current user's ID and email ID
                await this.followUser(user.id, newUserData.id);
              }
            }
          }

        }
        return user;
      } catch (error) {
        console.error('Error in createInitialUser:', error.message);
        throw new BadRequestException('Error creating initial user');
      }
    });
    return transaction;
  }

  async getUserId(email: string) {
    // Find the user by email
    const userDetails = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    });
    return userDetails.id;
  }

  async enterUserData(userId: string, userData: UpdateUserDto) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      const dobDate: Date = moment(userData.dob, 'YYYY-MM-DD').toDate();
      try {
        const updatedUser = await this.prisma.user.update({
          where: {
            id: userId
          },
          data: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            dob: dobDate, // Set dob to the parsed Date object
            country: userData.country,
            zipcode: userData.zipcode,
            profession: userData.profession,
            company: userData.company,
            links: userData.links,
            tagline: userData.tagline,
            roleType: userData.roleType,
            adminRevenue: userData.adminRevenue,
          }
        });
        const updatedPrice = await this.prisma.share.create({
          data: {
            owner: { connect: { id: userId } }, // Connect to the updated user
            price: 100.0,
          },
          select: {
            price: true,
          },
        });
        console.log("User data successfully updated");
        return { updatedUser, updatedPrice };
      } catch (error) {
        console.log('Error updating user data', error.message)
        throw new BadRequestException('Error updating user data');
      }
    });
    return transaction;
  }

  async followUser(userId: string, userBeenFollowed: string): Promise<void> {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        // Check if the user exists
        if (userId === userBeenFollowed) {
          throw new BadRequestException('Cannot follow yourself');
        }
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          throw new BadRequestException('User not found');
        }

        // Check if the user to follow exists
        const userToFollow = await this.prisma.user.findUnique({
          where: { id: userBeenFollowed },
        });
        if (!userToFollow) {
          throw new BadRequestException('User to follow not found');
        }

        // Check if the user is already following the userToFollow
        const existingFollow = await this.prisma.follow.findFirst({
          where: {
            followerId: userId,
            followingId: userBeenFollowed,
          },
        });
        if (existingFollow) {
          throw new BadRequestException('User is already following this user');
        }

        // Find the user's share
        const userShare = await this.prisma.share.findFirst({
          where: { ownerId: userBeenFollowed }, // Assuming 'ownerId' is the field that connects to the user being followed
        });

        // If the user has a share, update its price
        if (userShare && userShare.price > 0.0) {
          await this.prisma.share.update({
            where: { id: userShare.id }, // Provide the unique identifier of the share
            data: {
              price: {
                increment: 1.0, // Increase by 1.0
              },
            },
          });
          // Create a new follow relationship
          await this.prisma.follow.create({
            data: {
              followerId: userId,
              followingId: userBeenFollowed,
            },
          });

          return console.log("User successfully followed");
        }
        else {
          throw new BadRequestException('User has no share and must update their profile');
        }
      } catch (error) {
        console.error('Error in followUser:', error.message);
        throw new BadRequestException('Error following user');
      }
    });
    return transaction;
  }

  async upgradeAccount(userId: string) {
    const transaction = await this.prisma.$transaction(async (prisma) => {
      try {
        // Fetch user details including subscription status and following count
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            subscription: true,
            following: {
              select: {
                id: true,
              },
            },
            roleType: true,
          },
        });

        // Check if the user exists
        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Check if the user's roleType is 'user' and they have a subscription and are following at least one user
        if (user.roleType === 'user' && user.subscription && user.following.length > 0) {
          // Upgrade the user's account to 'investor'
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              roleType: 'investor',
            },
          });

          console.log('User account upgraded to investor');
        } else {
          console.log('User account does not meet upgrade criteria');
        }
      } catch (error) {
        console.error('Error upgrading account:', error.message);
        throw new BadRequestException('Error upgrading account');
      }
    });
    return transaction;
  }

}
