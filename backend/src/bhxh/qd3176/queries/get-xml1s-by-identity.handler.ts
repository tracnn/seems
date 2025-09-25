import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetXml1sByIdentityQuery } from "./get-xml1s-by-identity.query";
import { Qd3176Xml1sRepository, Qd3176Xml1sRepositoryType } from "../repositories/qd3176-xml1s.repository";
import { Inject } from "@nestjs/common";

@QueryHandler(GetXml1sByIdentityQuery)
export class GetXml1sByIdentityHandler implements IQueryHandler<GetXml1sByIdentityQuery> {
    constructor(
        @Inject('Qd3176Xml1sRepository')
        private readonly xml1sRepository: Qd3176Xml1sRepositoryType) {}
    async execute(query: GetXml1sByIdentityQuery) {
        const { identity } = query.dto;
        const xml1s = await this.xml1sRepository.findByIdentityOrInsuranceNumber(identity);
        return xml1s;
  }
}