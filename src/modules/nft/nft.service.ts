import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNftDTO } from "./dto/createNft.dto";
import { Nft, Prisma } from "@prisma/client";

@Injectable()
export class NftService {
    constructor(private prisma: PrismaService) {}
    
    
    async createNft(ownerId: number, data: CreateNftDTO) :Promise<Nft>{
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
}