import { IsNotEmpty, IsUUID } from "class-validator";

export class GetXml3sByXml1IdDto {
  @IsNotEmpty()
  @IsUUID()
  xml1Id: string;
}