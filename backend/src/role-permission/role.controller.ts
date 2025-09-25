import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignatureGuard } from '@common/guards/signature.guard';
import { RoleService } from './services/role.service';
import { CreateRoleDto } from './dto/create-role.dto';  
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(SignatureGuard)
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) {}

    @ApiOperation({ summary: 'Create a new role' })
    @Post()
    async create(@Headers('x-signature') signature: string, @Body() dto: CreateRoleDto) {
        return this.roleService.create(dto);
    }

    @ApiOperation({ summary: 'Get all roles' })
    @Get()
    async getAll(@Headers('x-signature') signature: string) {
        return this.roleService.findAll();
    }

    @ApiOperation({ summary: 'Get a role by ID' })
    @Get(':id')
    async getById(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.roleService.findById(id);
    }

    @ApiOperation({ summary: 'Update a role by ID' })
    @Patch(':id')
    async update(@Headers('x-signature') signature: string, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
        return this.roleService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a role by ID' })
    @Delete(':id')
    async delete(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.roleService.remove(id);
    }
}