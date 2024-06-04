import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class updateUserProfileDTO {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly name: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    readonly email: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly avatar: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly description: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly website: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly facebook: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly twitter: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly instgram: string;
}