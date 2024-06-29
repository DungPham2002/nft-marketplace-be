import { Prisma, User } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { toChecksumAddress } from 'web3-utils';

import { PrismaService } from '../prisma/prisma.service';

import { updateUserProfileDTO } from './dto/updateUserProfile.dto';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findFirst({ where: { id: userId } });
  }

  async getUserByAddress(address: string) {
    const user = await this.prisma.user.findFirst({
      where: { address: toChecksumAddress(address) },
    });
    let listedNft = [];
    let createdNft = [];

    if (user) {
      listedNft = await this.prisma.nft.findMany({
        where: {
          owner: user,
          isSelling: true,
        },
      });
      createdNft = await this.prisma.nft.findMany({
        where: {
          owner: user,
          isSelling: false,
        }
      })
    };
    return { user, listedNft, createdNft };
  }


  async updateUserProfile(
    userId: number,
    data: updateUserProfileDTO,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: data,
    });
    return user;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async followUser(userId: number, address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          address: address,
        }
      })
      await this.prisma.follow.create({
        data:{
          followedId: user.id,
          followerId: userId,
        }
      })
      const follower = await this.prisma.user.findFirst({
        where: {
          id: userId,
        }
      })
      await this.notificationGateway.notifyUser(address, {
        type: 'FOLLOW',
        avatar: follower.avatar,
        address: follower.address,
        message: 'Followed you',
        image: '',
        isRead: false
      })
    } catch (error) {
      console.log(error)
    }
  }

  async unfollowUser(userId: number, address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          address: address,
        }
      })
      await this.prisma.follow.delete({
        where: {
          followedId_followerId: {
            followedId: user.id,
            followerId: userId,
          }
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  async getFollowUser(userId: number, address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          address: address,
        }
      })

      if (!user) {
        throw new BadRequestException('User not found');
      }
      const checkIsFollowed = await this.prisma.follow.findFirst({
        where: { followedId: user.id, followerId: +userId },
      });
      return { isFollowed: checkIsFollowed ? true : false };
    } catch (error) {
      console.log(error);
    }
  }

  async getFollowerByAddress(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      })
      const listFollowing = await this.prisma.follow.findMany({
        where: { followedId: user.id },
        select: {
          follower: true,
        }
      });
      return listFollowing.map((item) => item.follower);
    } catch (error) {
      console.log(error)
    }
  }

  async getFollowingByAddress(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      })
      const listFollowed = await this.prisma.follow.findMany({
        where: { followerId: user.id },
        select: {
          followed: true,
        }
      });
      return listFollowed.map((item) => item.followed);
    } catch (error) {
      console.log(error)
    }
  }

  async getTopFollower() {
    try {
      const topFollower = await this.prisma.user.findMany({
        take: 9,
        orderBy: {
          followed: {
            _count: 'desc',
          },
        },
        include: {
          _count: {
            select: {
              followed: true,
            },
          },
        },
      });
      return topFollower;
    } catch (error) {
      console.log(error);
    }
  }
}
