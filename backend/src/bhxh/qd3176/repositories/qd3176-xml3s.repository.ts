import { Repository } from "typeorm";
import { Qd3176Xml3s } from "../entities/qd3176-xml3s.entity";

export const Qd3176Xml3sRepository = (repo: Repository<Qd3176Xml3s>) => repo.extend({

    async findByXml1Id(xml1Id: string) {
        return this.find({ 
            where: { xml1Id },
        });
    },
});

export type Qd3176Xml3sRepositoryType = ReturnType<typeof Qd3176Xml3sRepository>;