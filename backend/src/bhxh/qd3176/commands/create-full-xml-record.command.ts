import { ICommand } from "@nestjs/cqrs";
export class CreateFullXmlRecordCommand implements ICommand{
    constructor(
        public readonly xmlPayloads: { [key: string]: any }, 
        public readonly importSessionId: string,
        public readonly userId: string) {}
}