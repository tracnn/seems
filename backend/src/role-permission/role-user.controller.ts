import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureGuard } from '@common/guards/signature.guard';
import { RoleUserService } from './services/role-user.service';
import { AssignRoleUserDto } from './dto/assign-role-user.dto';

@ApiTags('Role Assignments for a User')
@Controller('role-assignments/user')
@UseGuards(SignatureGuard)
export class RoleUserController {
    constructor(
        private readonly roleUserService: RoleUserService
    ) {}

    @ApiOperation({ summary: 'Assign a role to a user' })
    @Post()
    async assignRole(@Headers('x-signature') signature: string, @Body() dto: AssignRoleUserDto) {
        return this.roleUserService.assignRole(dto);
    }

    @ApiOperation({ summary: 'Get all role assignments for a user' })
    @Get()
    async getAll(@Headers('x-signature') signature: string) {
        return this.roleUserService.findAll();
    }

    @ApiOperation({ summary: 'Get a role assignment for a user by ID' })
    @Get(':id')
    async getById(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.roleUserService.findById(id);
    }

    @ApiOperation({ summary: 'Delete a role assignment for a user by ID' })
    @Delete(':id')
    async delete(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.roleUserService.remove(id);
    }
}