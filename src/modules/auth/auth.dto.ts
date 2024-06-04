import { User } from '@prisma/client';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDTO {
  user: User;
  accessToken: string;
}

export class LoginDTO {
  @IsString()
  @ApiProperty({
    required: true,
    type: 'string',
    example:
      '0x95170610db759cc5bcee14bf2485d22e6c17c8f4fc643b5a564b4df132d2068669f33c28104c5b232f76f06cf02bc71b12526004e32f3f46a96b2a04bfb380ed1b',
  })
  signature: string;

  @IsString()
  @ApiProperty({
    required: true,
    type: 'string',
    example: '0xd53eb5203e367bbdd4f72338938224881fc501ab',
  })
  address: string;
}
