import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterNftDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  collectionId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  filter: string;
}
