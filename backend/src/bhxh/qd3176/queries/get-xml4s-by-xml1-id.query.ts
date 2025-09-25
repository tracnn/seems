import { GetXml4sByXml1IdDto } from "../dto/get-xml4s-by-xml1-id.dto";
import { IQuery } from "@nestjs/cqrs";

export class GetXml4sByXml1IdQuery implements IQuery {
  constructor(public readonly dto: GetXml4sByXml1IdDto) {}
}