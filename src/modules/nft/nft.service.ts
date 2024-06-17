import { Injectable } from '@nestjs/common';
import { Nft } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { CreateNftDTO } from './dto/createNft.dto';
import { toChecksumAddress } from 'web3-utils';

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
}
