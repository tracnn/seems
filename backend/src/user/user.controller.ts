import { Controller, UseGuards, Get, Post, Put, Delete, Body, Param, Query, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly service: UserService,
    ) {}


    @ApiOperation({ summary: 'Create new user' })
    @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.service.create(createUserDto);
    }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return list of users', type: [UserResponseDto] })
    @Get()
    async findAll(@Query() query: GetUsersDto) {
        // TODO: Implement get all users
        //return await this.service.findAll(query);
        return [];
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'Return user information', type: UserResponseDto })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get(':id')
    async findOne(@Param('id') id: string) {
        // TODO: Implement get user by ID
        //return await this.service.findOne(id);
        return [];
    }

    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Delete(':id')
    async remove(@Param('id') id: string) {
        // TODO: Implement delete user
        //return await this.service.deleteUser(id);
        return [];
    }
}
