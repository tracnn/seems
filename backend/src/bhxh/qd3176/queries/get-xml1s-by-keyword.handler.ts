import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetXml1sByKeywordQuery } from "./get-xml1s-by-keyword.query";
import { Qd3176Xml1sRepository, Qd3176Xml1sRepositoryType } from "../repositories/qd3176-xml1s.repository";
import { Inject } from "@nestjs/common";

@QueryHandler(GetXml1sByKeywordQuery)
export class GetXml1sByKeywordHandler implements IQueryHandler<GetXml1sByKeywordQuery> {
    constructor(
        @Inject('Qd3176Xml1sRepository')
        private readonly xml1sRepository: Qd3176Xml1sRepositoryType) {}
    async execute(query: GetXml1sByKeywordQuery) {
        const { keyword } = query.dto;
        const xml1s = await this.xml1sRepository.findByKeyword(keyword);
        return xml1s;
  }
}