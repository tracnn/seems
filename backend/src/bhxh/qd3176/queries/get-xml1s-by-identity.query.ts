import { GetXml1sByIdentityDto } from "../dto/get-xml1s-by-identity.dto";
import { IQuery } from "@nestjs/cqrs";

export class GetXml1sByIdentityQuery implements IQuery{
  constructor(public readonly dto: GetXml1sByIdentityDto) {}
}