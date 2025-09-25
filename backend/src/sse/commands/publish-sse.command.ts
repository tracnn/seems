import { ICommand } from "@nestjs/cqrs";
import { PublishSseDto } from "../dto/publish-sse.dto";

export class PublishSseCommand implements ICommand {
    constructor(public readonly publishSseDto: PublishSseDto) {}
}