import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { toChecksumAddress } from 'web3-utils';
import { recoverPersonalSignature } from 'eth-sig-util';

import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';

import { AuthResponseDTO, LoginDTO } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  public async login(loginDTO: LoginDTO): Promise<AuthResponseDTO> {
    const { address, signature } = loginDTO;

    let user = await this.prisma.user.findFirst({
      where: {
        address: toChecksumAddress(address),
      },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          address: toChecksumAddress(address),
          name: '',
          avatar: '',
          email: '',
          description: '',
          website: '',
          facebook: '',
          twitter: '',
          instagram: '',
        },
      });
    }

    try {
      const recoveredAddress = recoverPersonalSignature({
        data: process.env.METAMASK_MESSAGE_CONFIG,
        sig: signature,
      });

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new BadRequestException('Signature is in correct');
      }
    } catch (err) {
      throw new BadRequestException('Signature is in correct');
    }

    const payload = {
      address: toChecksumAddress(address),
      id: user.id,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
      }),
      user,
    };
  }
}
