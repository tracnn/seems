import { IsNotEmpty, IsUUID } from "class-validator";

export class GetXml2sByXml1IdDto {
  @IsNotEmpty()
  @IsUUID()
  xml1Id: string;
}