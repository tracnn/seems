import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureGuard } from '../common/guards/signature.guard';
import { PermissionUserService } from './services/permission-user.service';
import { AssignPermissionUserDto } from './dto/assign-permission-user.dto';

@ApiTags('Permission Assignments for user')
@Controller('permission-assignments/user')
@UseGuards(SignatureGuard)
export class PermissionUserController {
    constructor(
        private readonly permissionUserService: PermissionUserService
    ) {}

    @ApiOperation({ summary: 'Assign a permission to a user' })
    @Post()
    async assignRole(@Headers('x-signature') signature: string, @Body() dto: AssignPermissionUserDto) {
        return this.permissionUserService.assignRole(dto);
    }

    @ApiOperation({ summary: 'Get all permission assignments for a user' })
    @Get()
    async getAll(@Headers('x-signature') signature: string) {
        return this.permissionUserService.findAll();
    }

    @ApiOperation({ summary: 'Get a permission assignment for a user by ID' })
    @Get(':id')
    async getById(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionUserService.findById(id);
    }

    @ApiOperation({ summary: 'Delete a permission assignment for a user by ID' })
    @Delete(':id')
    async delete(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionUserService.remove(id);
    }
}