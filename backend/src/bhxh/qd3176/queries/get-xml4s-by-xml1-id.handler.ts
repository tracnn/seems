import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetXml4sByXml1IdQuery } from "./get-xml4s-by-xml1-id.query";

import { Qd3176Xml4sRepositoryType } from "../repositories/qd3176-xml4s.repository";
import { Inject } from "@nestjs/common";

@QueryHandler(GetXml4sByXml1IdQuery)
export class GetXml4sByXml1IdHandler implements IQueryHandler<GetXml4sByXml1IdQuery> {
  constructor(
    @Inject('Qd3176Xml4sRepository')
    private readonly xml4sRepository: Qd3176Xml4sRepositoryType
  ) {}

  async execute(query: GetXml4sByXml1IdQuery) {
    const { xml1Id } = query.dto;
    const xml4s = await this.xml4sRepository.findByXml1Id(xml1Id);
    return xml4s;
  }
}