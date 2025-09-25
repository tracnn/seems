import { UpdateXml1sByKeyCommand } from './update-xml1s-by-key.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Qd3176Xml1s } from '../entities/qd3176-xml1s.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { XML_SUMMARY_TYPE } from '../../enums/bhxh.enum';

@CommandHandler(UpdateXml1sByKeyCommand)
export class UpdateXml1sByKeyHandler implements ICommandHandler<UpdateXml1sByKeyCommand> {
  constructor(@InjectRepository(Qd3176Xml1s) private readonly qd3176Xml1sRepository: Repository<Qd3176Xml1s>) {}

  async execute(command: UpdateXml1sByKeyCommand) {
    const { maTheBhyt, ngayVao, thangQt, namQt, maLoaiKcb, maCskcb } = command;

    return await this.qd3176Xml1sRepository
        .createQueryBuilder()
        .update(Qd3176Xml1s)
        .set({ xmlSummaryType: XML_SUMMARY_TYPE.DUPLICATE })
        .where("maTheBhyt = :maTheBhyt", { maTheBhyt })
        .andWhere("ngayVao = :ngayVao", { ngayVao })
        .andWhere("thangQt = :thangQt", { thangQt })
        .andWhere("namQt = :namQt", { namQt })
        .andWhere("maLoaiKcb = :maLoaiKcb", { maLoaiKcb })
        .andWhere("maCskcb = :maCskcb", { maCskcb })
        .andWhere(
            "(xmlSummaryType = :correct OR xmlSummaryType = :correctWithWarning)",
            {
                correct: XML_SUMMARY_TYPE.CORRECT,
                correctWithWarning: XML_SUMMARY_TYPE.CORRECT_WITH_WARNING,
            }
        )
        .execute();
        }
}  