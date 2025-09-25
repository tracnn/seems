import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetXml3sByXml1IdQuery } from "./get-xml3s-by-xml1-id.query";
import { Qd3176Xml3sRepositoryType } from "../repositories/qd3176-xml3s.repository";
import { Inject } from "@nestjs/common";

@QueryHandler(GetXml3sByXml1IdQuery)
export class GetXml3sByXml1IdHandler implements IQueryHandler<GetXml3sByXml1IdQuery> {
  constructor(
    @Inject('Qd3176Xml3sRepository')
    private readonly xml3sRepository: Qd3176Xml3sRepositoryType
  ) {}

  async execute(query: GetXml3sByXml1IdQuery) {
    const { xml1Id } = query.dto;
    const xml3s = await this.xml3sRepository.findByXml1Id(xml1Id);
    return xml3s;
  }
}   