import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionService } from './services/permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { SignatureGuard } from '@common/guards/signature.guard';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(SignatureGuard)
export class PermissionController {
    constructor(
        private readonly permissionService: PermissionService
    ) {}

    @ApiOperation({ summary: 'Create a new permission' })
    @Post()
    async create(@Headers('x-signature') signature: string, @Body() dto: CreatePermissionDto) {
        return this.permissionService.create(dto);
    }

    @ApiOperation({ summary: 'Get all permissions' })
    @Get()
    async getAll(@Headers('x-signature') signature: string) {
        return this.permissionService.findAll();
    }

    @ApiOperation({ summary: 'Get a permission by ID' })
    @Get(':id')
    async getById(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionService.findById(id);
    }

    @ApiOperation({ summary: 'Update a permission by ID' })
    @Patch(':id')
    async update(@Headers('x-signature') signature: string, @Param('id') id: string, @Body() dto: UpdatePermissionDto) {
        return this.permissionService.update(id, dto);
    }

    @ApiOperation({ summary: 'Delete a permission by ID' })
    @Delete(':id')
    async delete(@Headers('x-signature') signature: string, @Param('id') id: string) {
        return this.permissionService.remove(id);
    }
}