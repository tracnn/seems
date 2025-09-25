import { GetXml3sByXml1IdDto } from "../dto/get-xml3s-by-xml1-id.dto";
import { IQuery } from "@nestjs/cqrs";

export class GetXml3sByXml1IdQuery implements IQuery {
  constructor(public readonly dto: GetXml3sByXml1IdDto) {}
}