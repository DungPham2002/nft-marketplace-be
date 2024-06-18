import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateAuctionDTO {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  duration: number;

}
