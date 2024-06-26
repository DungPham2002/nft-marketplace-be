import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { FilterNftDTO } from '../nft/dto/filterNft.dto';

import { CreateAuctionDTO } from './dto/createAuction.dto';
import { NotificationGateway } from '../notification/notification.gateway';


@Injectable()
export class AuctionService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

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

      const timeEnd = new Date(new Date().getTime() + data.duration * 1000);

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

      const owner = await this.prisma.user.findFirst({
        where: {
          id: nft.ownerId,
        },
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
          isRead: false
        });
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
      await this.prisma.bidderHistory.create({
        data: {
          bidderId: +userId,
          price: +price,
          auctionId: auction.id,
        },
      });
      const user = await this.prisma.user.findFirst({
        where: { id: +userId },
      });
      const nft = await this.prisma.nft.findFirst({
        where: { tokenId: +nftId },
      });
      const owner = await this.prisma.user.findFirst({
        where: { id: +auction.sellerId },
      });
      await this.notificationGateway.notifyUser(owner.address, {
        type: 'AUCTION',
        avatar: user.avatar,
        address: owner.address,
        image: nft.image,
        message: `Bid your NFT`,
        isRead: false
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

      if (!higgestBidder) {
        return 'No one bids';
      }
      await this.prisma.nft.update({
        where: { tokenId: +nftId },
        data: {
          ownerId: higgestBidder.bidderId,
          price: higgestBidder.bidAmount,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getTopAuction() {
    try {
      const topAuctions = await this.prisma.auction.findMany({
        where: {
          isActive: true,
        },
        include: {
          nft: {
            include: {
              collection: true,
            },
          },
          seller: {
            select: {
              address: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: { bids: true },
          },
          bids: {
            select: {
              bidAmount: true,
              bidder: {
                select: {
                  address: true,
                },
              },
            },
            orderBy: {
              bidAmount: 'desc',
            },
          },
        },
        orderBy: {
          bids: {
            _count: 'desc',
          },
        },
        take: 10,
      });

      const formattedAuctions = topAuctions.map((auction) => {
        const highestBid =
          auction.bids.length > 0 ? auction.bids[0].bidAmount : 0.0;
        const highestBidder =
          auction.bids.length > 0
            ? auction.bids[0].bidder.address
            : '0x0000000000000000000000000000000000000000';

        return {
          tokenId: auction.nft.tokenId,
          seller: auction.seller.address,
          sellerName: auction.seller.name,
          sellerAvatar: auction.seller.avatar,
          image: auction.nft.image,
          name: auction.nft.name,
          description: auction.nft.description,
          minBid: auction.minBid.toString(),
          highestBid: highestBid.toString(),
          highestBidder: highestBidder,
          tokenURI: auction.nft.tokenURI,
          collectionName: auction.nft.collection.name,
          collectionImage: auction.nft.collection.image,
          endTime: auction.timeEnd.toISOString(),
        };
      });

      return formattedAuctions;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to fetch top auctions');
    }
  }

  async getFilteredAuction(data: FilterNftDTO) {
    try {
      const { collectionId, filter } = data;
      const whereClause = collectionId
        ? { nft: { collectionId: +collectionId }, isActive: true }
        : { isActive: true };
      let orderByClause = {};
      if (filter) {
        switch (filter) {
          case 'highest':
            orderByClause = { minBid: 'desc' };
            break;
          case 'lowest':
            orderByClause = { minBid: 'asc' };
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
      const auctions = await this.prisma.auction.findMany({
        where: whereClause,
        orderBy: orderByClause,
        include: {
          nft: {
            include: {
              collection: true,
            },
          },
          seller: {
            select: {
              address: true,
              name: true,
              avatar: true,
            },
          },
          bids: {
            select: {
              bidAmount: true,
              bidder: {
                select: {
                  address: true,
                },
              },
            },
            orderBy: {
              bidAmount: 'desc',
            },
          },
        },
      });
      const formattedAuctions = auctions.map((auction) => {
        const highestBid =
          auction.bids.length > 0 ? auction.bids[0].bidAmount : 0.0;
        const highestBidder =
          auction.bids.length > 0
            ? auction.bids[0].bidder.address
            : '0x0000000000000000000000000000000000000000';

        return {
          tokenId: auction.nft.tokenId,
          owner: auction.seller,
          image: auction.nft.image,
          name: auction.nft.name,
          description: auction.nft.description,
          minBid: auction.minBid.toString(),
          highestBid: highestBid.toString(),
          highestBidder: highestBidder,
          tokenURI: auction.nft.tokenURI,
          collection: auction.nft.collection,
          endTime: auction.timeEnd.toISOString(),
          isActive: true,
        };
      });
      return formattedAuctions;
    } catch (error) {
      console.log(error);
    }
  }

  async getBidderHistory(nftId: number): Promise<any> {
    const auction = await this.prisma.auction.findFirst({
      where: { nftId: +nftId, isActive: true },
    });

    if (!auction) {
      return [];
    }
    if (auction.isActive == true) {
      return this.prisma.bidderHistory.findMany({
        where: { auctionId: auction.id },
        include: { bidder: true },
        orderBy: { created_at: 'desc' },
      });
    }
    return [];
  }
}
