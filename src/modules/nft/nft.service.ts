import { Injectable } from '@nestjs/common';
import { Nft } from '@prisma/client';
import { toChecksumAddress } from 'web3-utils';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from '../notification/notification.gateway';

import { CreateNftDTO } from './dto/createNft.dto';
import { FilterNftDTO } from './dto/filterNft.dto';

@Injectable()
export class NftService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNft(ownerId: number, data: CreateNftDTO): Promise<Nft> {
    const nft = await this.prisma.nft.create({
      data: {
        ownerId: ownerId,
        image: data.image,
        name: data.name,
        website: data.website,
        royalties: data.royalties,
        size: data.size,
        description: data.description,
        price: data.price,
        collectionId: data.collectionId,
        tokenURI: data.tokenURI,
        isSelling: true,
      },
    });
    const followers = await this.prisma.follow.findMany({
      where: {
        followedId: ownerId,
      },
      include: {
        follower: true,
      },
    });
    const owner = await this.prisma.user.findFirst({
      where: {
        id: ownerId,
      },
    });
    await this.prisma.ownerHistory.create({
      data: {
        ownerId: ownerId,
        nftId: nft.tokenId,
      },
    });
    followers.forEach((follower) => {
      this.notificationGateway.notifyUser(follower.follower.address, {
        type: 'SELL',
        avatar: owner.avatar,
        address: owner.address,
        image: nft.image,
        message: 'Just sold an nft',
        isRead: false,
      });
    });
    return nft;
  }

  async getAllCollections() {
    const collections = await this.prisma.collection.findMany();
    return collections;
  }

  async buyNft(address: string, tokenId: number) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: toChecksumAddress(address) },
      });
      const nft = await this.prisma.nft.findFirst({
        where: { tokenId: tokenId },
      });
      const owner = await this.prisma.user.findFirst({
        where: { id: nft.ownerId },
      });
      await this.notificationGateway.notifyUser(owner.address, {
        type: 'BUY',
        avatar: user.avatar,
        address: address,
        image: nft.image,
        message: `Bought your NFT`,
        isRead: false
      });
      await this.prisma.nft.update({
        where: { tokenId: tokenId },
        data: { ownerId: user.id, isSelling: false },
      });
      await this.prisma.ownerHistory.create({
        data: {
          ownerId: user.id,
          nftId: tokenId,
        },
      });
      return 'Buy Success';
    } catch (error) {
      console.log(error);
    }
  }

  async reSellNFT(tokenId: number, price: number) {
    try {
      await this.prisma.nft.update({
        where: { tokenId: tokenId },
        data: { isSelling: true, price: price },
      });
      const nft = await this.prisma.nft.findFirst({
        where: {
          tokenId: tokenId,
        },
      });
      const owner = await this.prisma.user.findFirst({
        where: { id: nft.ownerId },
      });
      const followers = await this.prisma.follow.findMany({
        where: {
          followedId: owner.id,
        },
        include: {
          follower: true,
        },
      });
      followers.forEach((follower) => {
        this.notificationGateway.notifyUser(follower.follower.address, {
          type: 'SELL',
          avatar: owner.avatar,
          address: owner.address,
          image: nft.image,
          message: 'Just sold an nft',
          isRead: false,
        });
      });
      return 'Resell success';
    } catch (error) {
      console.log(error);
    }
  }

  async likeNft(userId: number, tokenId: number) {
    try {
      await this.prisma.nft_likes.create({
        data: {
          userId,
          nftId: +tokenId,
        },
      });
      const nft = await this.prisma.nft.findUnique({
        where: { tokenId: +tokenId },
      });
      const user = await this.prisma.user.findFirst({
        where: { id: userId },
      });
      const owner = await this.prisma.user.findFirst({
        where: { id: nft.ownerId },
      });

      if (nft) {
        await this.notificationGateway.notifyUser(owner.address, {
          type: 'LIKE',
          avatar: user.avatar,
          address: user.address,
          image: nft.image,
          message: `Liked your NFT`,
          isRead: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async unlikeNft(userId: number, tokenId: number) {
    try {
      await this.prisma.nft_likes.delete({
        where: { nftId_userId: { nftId: +tokenId, userId: userId } },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getLikeNft(userId: number, tokenId: number) {
    try {
      const likeCount = await this.prisma.nft_likes.count({
        where: { nftId: +tokenId },
      });
      const checkIsLiked = await this.prisma.nft_likes.findFirst({
        where: { nftId: +tokenId, userId: +userId },
      });
      return { likeCount, isLiked: checkIsLiked ? true : false };
    } catch (error) {
      console.log(error);
    }
  }

  async getListNftLiked(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      });
      const listLiked = await this.prisma.nft_likes.findMany({
        where: { userId: user.id },
        select: {
          nft: true,
        },
      });
      return listLiked.map((item) => item.nft);
    } catch (error) {
      console.log(error);
    }
  }

  async getListSoldNftByAddress(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      });
      const listSoldNft = await this.prisma.nft.findMany({
        where: {
          ownerId: user.id,
          isSelling: true,
        },
        select: {
          tokenId: true,
          name: true,
          description: true,
          image: true,
          price: true,
          isSelling: true,
          collectionId: true,
          website: true,
          royalties: true,
          owner: {
            select: {
              address: true,
            },
          },
          tokenURI: true,
        },
      });
      return listSoldNft;
    } catch (error) {
      console.log(error);
    }
  }

  async getListOwnerNftByAddress(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      });
      const listOwnerNft = await this.prisma.nft.findMany({
        where: {
          ownerId: user.id,
          isSelling: false,
        },
        select: {
          tokenId: true,
          name: true,
          description: true,
          image: true,
          price: true,
          isSelling: true,
          collectionId: true,
          website: true,
          royalties: true,
          owner: {
            select: {
              address: true,
            },
          },
          tokenURI: true,
        },
      });
      return listOwnerNft;
    } catch (error) {
      console.log(error);
    }
  }

  async getTopNft() {
    try {
      const topNfts = await this.prisma.nft.findMany({
        where: {
          isSelling: true,
        },
        select: {
          tokenId: true,
          name: true,
          description: true,
          image: true,
          price: true,
          isSelling: true,
          collectionId: true,
          website: true,
          royalties: true,
          owner: {
            select: {
              address: true,
            },
          },
          tokenURI: true,
          _count: {
            select: { nftLikes: true },
          },
          collection: true,
        },
        orderBy: {
          nftLikes: {
            _count: 'desc',
          },
        },
        take: 10,
      });
      const formattedTopNfts = topNfts.map((nft) => ({
        tokenId: nft.tokenId,
        name: nft.name,
        description: nft.description,
        image: nft.image,
        price: nft.price,
        isSelling: nft.isSelling,
        collectionId: nft.collectionId,
        website: nft.website,
        royalties: nft.royalties,
        seller: nft.owner.address,
        tokenURI: nft.tokenURI,
        collectionName: nft.collection.name,
        collectionImage: nft.collection.image,
      }));

      return formattedTopNfts;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to fetch top NFTs');
    }
  }

  async getFilteredNft(data: FilterNftDTO) {
    try {
      const { collectionId, filter } = data;
      const whereClause = collectionId
        ? { collectionId: +collectionId, isSelling: true }
        : { isSelling: true };
      let orderByClause = {};
      if (filter) {
        switch (filter) {
          case 'highest':
            orderByClause = { price: 'desc' };
            break;
          case 'lowest':
            orderByClause = { price: 'asc' };
            break;
          case 'newest':
            orderByClause = { created_at: 'desc' };
            break;
          case 'oldest':
            orderByClause = { created_at: 'asc' };
            break;
          default:
            break;
        }
      }
      return await this.prisma.nft.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: {
          collection: true,
          owner: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getOwnerHistory(nftId: number): Promise<any> {
    return this.prisma.ownerHistory.findMany({
      where: { nftId: +nftId },
      include: { owner: true },
      orderBy: { created_at: 'desc' },
    });
  }
}
