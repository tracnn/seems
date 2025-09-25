import { GetXml1sByKeywordDto } from "../dto/get-xml1s-by-keyword.dto";
import { IQuery } from "@nestjs/cqrs";

export class GetXml1sByKeywordQuery implements IQuery{
  constructor(public readonly dto: GetXml1sByKeywordDto) {}
}