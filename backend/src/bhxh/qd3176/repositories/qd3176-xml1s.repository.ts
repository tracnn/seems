import { ILike, In, Repository } from "typeorm";
import { Qd3176Xml1s } from "../entities/qd3176-xml1s.entity";
import { XML_SUMMARY_TYPE } from "../../enums/bhxh.enum";

export const Qd3176Xml1sRepository = (repo: Repository<Qd3176Xml1s>) => repo.extend({
    async findByIdentity(identity: string) {
        return this.find({ where: { identity } });
    },
    async findByInsuranceNumber(insuranceNumber: string) {
        return this.find({ where: { insuranceNumber } });
    },
    async findByIdentityAndInsuranceNumber(identity: string, insuranceNumber: string) {
        return this.find({ where: { identity, insuranceNumber } });
    },
    async findByKeyword(keyword: string) {
        const items = keyword.split(';').map(item => item.trim());

        return this.find({ 
          where: [ 
            {soCccd: In(items),
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT
            },
            {
              maTheBhyt: In(items),
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT
            }
        ]});
    },
    
    async findByIdentityOrInsuranceNumber(identity: string) {
        return this.find({
          where: [
            {
              soCccd: identity,
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT,
            },
            {
              soCccd: identity,
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT_WITH_WARNING,
            },
            {
              maTheBhyt: identity,
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT,
            },
            {
              maTheBhyt: identity,
              xmlSummaryType: XML_SUMMARY_TYPE.CORRECT_WITH_WARNING,
            },
          ],
        });
    }
});

export type Qd3176Xml1sRepositoryType = ReturnType<typeof Qd3176Xml1sRepository>;