import { Prisma, User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { toChecksumAddress } from 'web3-utils';

import { PrismaService } from '../prisma/prisma.service';

import { updateUserProfileDTO } from './dto/updateUserProfile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.user.findFirst({
      where: { address: toChecksumAddress(address) },
    });
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
}
