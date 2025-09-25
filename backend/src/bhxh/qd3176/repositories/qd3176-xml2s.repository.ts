import { Repository } from "typeorm";
import { Qd3176Xml2s } from "../entities/qd3176-xml2s.entity";

export const Qd3176Xml2sRepository = (repo: Repository<Qd3176Xml2s>) => repo.extend({

    async findByXml1Id(xml1Id: string) {
        return this.find({ 
            where: { xml1Id },
        });
    },
});

export type Qd3176Xml2sRepositoryType = ReturnType<typeof Qd3176Xml2sRepository>;