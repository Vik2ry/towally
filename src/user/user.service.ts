import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleType } from './dto/enums';
import moment from 'moment';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async createInitialUser(userData: CreateUserDto, emailList: string[]): Promise<void> {
    try {
      console.log('userData:', userData);
      const { email, firstName, lastName, dob, country, zipcode, profession, company, tagline, links } = userData;
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
      return console.log("User successfully created");
    } catch (error) {
      console.error('Error in createInitialUser:', error.message);
      throw new BadRequestException('Error creating initial user');
    }
  }


  async enterUserData(userId: string, userData: UpdateUserDto): Promise<void> {
    const dobDate: Date = moment(userData.dob, 'YYYY-MM-DD').toDate();
    try {
      await this.prisma.user.update({
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
        }
      });
      await this.prisma.share.create({
        data: {
          owner: { connect: { id: userId } }, // Connect to the updated user
          price: 100.0,
        },
      });
      return console.log("User data successfully updated");
    } catch (error) {
      console.log('Error updating user data', error.message)
      throw new BadRequestException('Error updating user data');
    }
  }

  async followUser(userId: string, userBeenFollowed: string): Promise<void> {
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
  }

}
