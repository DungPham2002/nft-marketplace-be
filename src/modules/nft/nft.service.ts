import { Injectable } from '@nestjs/common';
import { Nft } from '@prisma/client';
import { toChecksumAddress } from 'web3-utils';

import { PrismaService } from '../prisma/prisma.service';

import { CreateNftDTO } from './dto/createNft.dto';



@Injectable()
export class NftService {
  constructor(private prisma: PrismaService) {}

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
      await this.prisma.nft.update({
        where: { tokenId: tokenId },
        data: { ownerId: user.id, isSelling: false },
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
      })
      const listLiked = await this.prisma.nft_likes.findMany({
        where: { userId: user.id },
        select: {
          nft: true,
        }
      });
      return listLiked.map((item) => item.nft);
    } catch (error) {
      console.log(error)
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
              address: true
            }
          },
          tokenURI: true,
        }
      })
      return listSoldNft;
    } catch (error) {
      console.log(error)
    }
  }

  async getListOwnerNftByAddress(address: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { address: address },
      })
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
              address: true
            }
          },
          tokenURI: true,
        }
      })
      return listOwnerNft;
    } catch (error) {
      console.log(error)
    }
  }
}
