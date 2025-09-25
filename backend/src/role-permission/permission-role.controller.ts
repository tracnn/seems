import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureGuard } from '../common/guards/signature.guard';
import { PermissionRoleService } from './services/permission-role.service';
import { AssignPermissionRoleDto } from './dto/assign-permission-role.dto';

@ApiTags('Permission Assignments for role')
@Controller('permission-assignments/role')
@UseGuards(SignatureGuard)
export class PermissionRoleController {
    constructor(
        private readonly permissionRoleService: PermissionRoleService
    ) {}

    @ApiOperation({ summary: 'Assign a permission to a role' })
    @Post()
    async assignRole(@Headers('x-signature') signature: string, @Body() dto: AssignPermissionRoleDto) {
        return this.permissionRoleService.assignRole(dto);
    }

    @ApiOperation({ summary: 'Get all permission assignments for a role' })
    @Get()
    async getAll(@Headers('x-signature') signature: string) {
        return this.permissionRoleService.findAll();
    }

    @ApiOperation({ summary: 'Get a permission assignment for a role by ID' })
    @Get(':id')
    async getById(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionRoleService.findById(id);
    }

    @ApiOperation({ summary: 'Delete a permission assignment for a role by ID' })
    @Delete(':id')
    async delete(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionRoleService.remove(id);
    }
}