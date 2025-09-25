import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetXml2sByXml1IdQuery } from "./get-xml2s-by-xml1-id.query";
import { Qd3176Xml2sRepositoryType } from "../repositories/qd3176-xml2s.repository";
import { Inject } from "@nestjs/common";

@QueryHandler(GetXml2sByXml1IdQuery)    
export class GetXml2sByXml1IdHandler implements IQueryHandler<GetXml2sByXml1IdQuery> {
  constructor(
    @Inject('Qd3176Xml2sRepository')
    private readonly xml2sRepository: Qd3176Xml2sRepositoryType
  ) {}

  async execute(query: GetXml2sByXml1IdQuery) {
    const { xml1Id } = query.dto;
    const xml2s = await this.xml2sRepository.findByXml1Id(xml1Id);
    return xml2s;
  }
}