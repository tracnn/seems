import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { BaseDto } from "../../../common/base.dto";

export class GetXml1sByKeywordDto extends BaseDto {
  @ApiProperty({
    description: 'Mã CCCD/Mã thẻ BHYT',
    example: '123456789012;123456789013',
  })
  @IsString()
  @IsNotEmpty()
  keyword: string;
}