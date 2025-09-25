import { ICommand } from "@nestjs/cqrs";

export class UpdateXml1sByKeyCommand implements ICommand {
  constructor(
    public readonly maTheBhyt: string,
    public readonly ngayVao: string,
    public readonly thangQt: number,
    public readonly namQt: number,
    public readonly maLoaiKcb: string,
    public readonly maCskcb: string,
  ) {}
}