import { IsNotEmpty, IsUUID } from "class-validator";

export class GetXml4sByXml1IdDto {
  @IsNotEmpty()
  @IsUUID()
  xml1Id: string;
}