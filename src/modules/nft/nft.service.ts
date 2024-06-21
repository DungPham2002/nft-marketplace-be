import { BadRequestException, Injectable } from '@nestjs/common';
import { Nft } from '@prisma/client';
import { toChecksumAddress } from 'web3-utils';

import { PrismaService } from '../prisma/prisma.service';

import { CreateNftDTO } from './dto/createNft.dto';
import { CreateAuctionDTO } from './dto/createAuction.dto';
import e from 'express';

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

  async createAuction(userId: number, nftId: number, data: CreateAuctionDTO) {
    try {
      const nft = await this.prisma.nft.findFirst({
        where: { tokenId: +nftId, ownerId: userId },
      });

      if (!nft) {
        return 'NFT not found or not owned by user';
      }

      const endedAuction = await this.prisma.auction.findFirst({
        where: { nftId: +nftId, isActive: true },
      });

      if (endedAuction) {
        return 'Auction already active';
      }

      const timeEnd = new Date(new Date().getTime() + data.duration);

      await this.prisma.auction.create({
        data: {
          nftId: +nftId,
          sellerId: userId,
          minBid: +data.price,
          duration: +data.duration,
          isActive: true,
          timeEnd: timeEnd,
        },
      });
      return 'Create Auction success';
    } catch (error) {
      console.log(error);
    }
  }

  async bidAuction(userId: number, nftId: number, price: number) {
    try {
      const auction = await this.prisma.auction.findFirst({
        where: { nftId: +nftId, isActive: true },
      });

      if (!auction) {
        return 'Auction not found';
      }

      if (price < auction.minBid) {
        return 'Bid amount too low';
      }
      await this.prisma.auctionBid.create({
        data: {
          auctionId: auction.id,
          bidderId: userId,
          bidAmount: +price,
        },
      });
      return 'Make an offer success';
    } catch (error) {
      console.log(error);
    }
  }

  async endAuction(nftId: number) {
    try {
      const auction = await this.prisma.auction.findFirst({
        where: { nftId: +nftId, isActive: true },
      });

      if (!auction) {
        throw new BadRequestException('Auction not found');
      }
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: {
          isActive: false,
        },
      });
      const higgestBidder = await this.prisma.auctionBid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { bidAmount: 'desc' },
      });

      if (higgestBidder) {
        await this.prisma.nft.update({
          where: { tokenId: +nftId },
          data: {
            ownerId: higgestBidder.bidderId,
            price: higgestBidder.bidAmount,
          },
        });
      }
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
        }
      })
      return listOwnerNft;
    } catch (error) {
      console.log(error)
    }
  }
}
