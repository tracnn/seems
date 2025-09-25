import { CommandBus, ICommandHandler } from "@nestjs/cqrs";
import { ChangePasswordCommand } from "./change-password.command";
import { CommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { ERROR_404 } from "../../common/error-messages/error-404";
import { ERROR_400 } from "../../common/error-messages/error-400";
import { AuthService } from "../../auth/auth.service";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@CommandHandler(ChangePasswordCommand)  
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ) {}

    async execute(command: ChangePasswordCommand): Promise<any> {
        const { userId, changePasswordDto } = command;
        const { oldPassword, newPassword, confirmPassword } = changePasswordDto;

        if (newPassword !== confirmPassword) {
            throw new BadRequestException(ERROR_400.NEW_PASSWORD_NOT_MATCH);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(ERROR_404.USER_NOT_FOUND);
        }

        const isMatch = await this.authService.comparePassword(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException(ERROR_400.OLD_PASSWORD_NOT_MATCH);
        }


        const hashedPassword = await this.authService.hashPassword(newPassword);
        return await this.userRepository.update(userId, { password: hashedPassword });
    }
}