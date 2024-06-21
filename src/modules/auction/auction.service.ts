import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateAuctionDTO } from './dto/createAuction.dto';


@Injectable()
export class AuctionService {
  constructor(private prisma: PrismaService) {}

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
}
