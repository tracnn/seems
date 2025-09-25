import { GetXml2sByXml1IdDto } from "../dto/get-xml2s-by-xml1-id.dto";
import { IQuery } from "@nestjs/cqrs";

export class GetXml2sByXml1IdQuery implements IQuery {
  constructor(public readonly dto: GetXml2sByXml1IdDto) {}
}