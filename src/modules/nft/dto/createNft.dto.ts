import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNftDTO {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  image: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  website: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  size: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  royalties: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  collectionId: number;
}
