import { Repository } from "typeorm";
import { Qd3176Xml4s } from "../entities/qd3176-xml4s.entity";

export const Qd3176Xml4sRepository = (repo: Repository<Qd3176Xml4s>) => repo.extend({

    async findByXml1Id(xml1Id: string) {
        return this.find({ 
            where: { xml1Id },
        });
    },
});

export type Qd3176Xml4sRepositoryType = ReturnType<typeof Qd3176Xml4sRepository>;