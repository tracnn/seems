import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty({ description: 'Mật khẩu cũ' })
    @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
    @IsString({ message: 'Mật khẩu cũ phải là một chuỗi' })
    oldPassword: string;

    @ApiProperty({ description: 'Mật khẩu mới' })
    @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
    @IsString({ message: 'Mật khẩu mới phải là một chuỗi' })
    @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    newPassword: string;

    @ApiProperty({ description: 'Xác nhận mật khẩu mới' })
    @IsNotEmpty({ message: 'Xác nhận mật khẩu mới không được để trống' })
    @IsString({ message: 'Xác nhận mật khẩu mới phải là một chuỗi' })
    @MinLength(6, { message: 'Xác nhận mật khẩu mới phải có ít nhất 6 ký tự' })
    confirmPassword: string;
}